# Java Modernization | Part 1
## Case Study: Aurora Core (Spring Boot 1.5 / Java 8 / Spring Data JPA + Hibernate 5 / Oracle)

### Goal of part 1
Demonstrate how **IBM Bob** can:
- Understand a non-trivial legacy Java / Spring codebase
- Produce an honest upgrade assessment (blockers, risks, effort)
- Build a modernisation spec from the legacy codebase
- Modernize safely: Java 8 → 21, Spring Boot 1.5 → 3.x, `javax.*` → `jakarta.*`
- Migrate the data layer from **Oracle → PostgreSQL**
- Validate the modernized implementation against the extracted contract

We use **Aurora Core**, a small core-banking REST API for a retail bank
(`java-modernization/`). It is realistic but approachable — customers, accounts,
double-entry ledger postings, and transfers — and it is deliberately built the way a
2016-era enterprise Java app looks today.

---

## Prerequisites — Install SDKMan and Java 21

> **Complete these steps before starting with the lab.** The Java Modernization workflow uses SDKMan to switch JDK versions automatically. You need both SDKMan and a Java 21 distribution (in this case IBM Semeru) on the machine.

> **Why IBM Semeru?** Semeru is IBM's production-ready OpenJDK distribution built on the Eclipse OpenJ9 JVM. It starts faster and uses significantly less heap than HotSpot. It's well-suited to containerised banking workloads. The workflow defaults to Semeru; if the below instructions don't work, you can download it manually from [developer.ibm.com/languages/java/semeru-runtimes/downloads/](https://developer.ibm.com/languages/java/semeru-runtimes/downloads/).

Select your operating system:

<details>
<summary><strong>🍎 macOS</strong></summary>

### 1 — Install SDKMan

SDKMan requires `bash`, `curl`, and `zip`. All three ship with macOS. Open **Terminal** and run:

```bash
curl -s "https://get.sdkman.io" | bash
```

Once the installer finishes, source the init script in your current terminal (or open a new window):

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

> **Note:** If you installed a newer `bash` via Homebrew (`brew install bash`), the installer uses that shell automatically. Either `/bin/bash` or `/opt/homebrew/bin/bash` works fine.

Confirm the installation:

```bash
sdk version
# Expected output: SDKMAN 5.x.x
```

### 2 — Install Java 21 via SDKMan

```bash
sdk install java 21.0.7-sem
```

> This installs the IBM Semeru Runtime 21 (OpenJ9 JVM). The download is ~200 MB.

Make Java 21 the active version for the current session:

```bash
sdk use java 21.0.7-sem
```

Verify:

```bash
java -version
# Expected: openjdk version "21.0.7" ...
```

> **Tip — Permanent default:** Run `sdk default java 21.0.7-sem` to make this the default for all new terminals.

### 3 — Confirm Maven is present

Bob's workflow generates a Maven wrapper (`mvnw`) inside the modernized project during Part D. A system Maven is not required for building the output, but Maven must be available to run the OpenRewrite migration recipes. Confirm it is present:

```bash
mvn -version
# Expected: Apache Maven 3.x.x ...
```

If it is missing, install Maven via SDKMan:

```bash
sdk install maven
mvn -version
```

### 4 — Install Docker (Rancher Desktop or Docker Desktop)

A container runtime is required to run the database via `docker-compose`. Install one of the following:

- **Rancher Desktop** *(recommended, free)*: Download from [rancherdesktop.io](https://rancherdesktop.io). During first launch, select **dockerd (moby)** as the container engine. Rancher Desktop also bundles `kubectl` and `nerdctl`.
- **Docker Desktop**: Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop). Requires a free Docker account for personal use.

After installation, confirm Docker is available:

```bash
docker --version
# Expected: Docker version 24.x.x (or later)
docker compose version
# Expected: Docker Compose version v2.x.x (or later)
```

> **Note:** Make sure the container runtime is **running** (check the tray icon) before starting the lab.

</details>


---

<details>
<summary><strong>🐧 Linux</strong></summary>

### 1 — Install prerequisites

SDKMan requires `bash`, `curl`, and `zip`. Install them if they are not already present:

```bash
# Debian / Ubuntu
sudo apt-get update && sudo apt-get install -y curl zip unzip

# RHEL / Fedora / CentOS
sudo dnf install -y curl zip unzip
```

### 2 — Install SDKMan

```bash
curl -s "https://get.sdkman.io" | bash
```

Source the init script (or open a new terminal):

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

Confirm the installation:

```bash
sdk version
# Expected output: SDKMAN 5.x.x
```

### 3 — Install Java 21 via SDKMan

```bash
sdk install java 21.0.7-sem
```

> This installs the IBM Semeru Runtime 21 (OpenJ9 JVM). The download is ~200 MB.

Make Java 21 the active version for the current session:

```bash
sdk use java 21.0.7-sem
```

Verify:

```bash
java -version
# Expected: openjdk version "21.0.7" ...
```

> **Tip — Permanent default:** Run `sdk default java 21.0.7-sem` to make this the default for all new terminals.

### 4 — Confirm Maven is present

Bob's workflow generates a Maven wrapper (`mvnw`) inside the modernized project during Part D. A system Maven is not required for building the output, but Maven must be available to run the OpenRewrite migration recipes. Confirm it is present:

```bash
mvn -version
# Expected output: Apache Maven 3.x.x ...
```

If it is missing, install Maven via SDKMan:

```bash
sdk install maven
mvn -version
```

### 5 — Install Docker Engine

A container runtime is required to run the database via `docker-compose`. Install **Docker Engine** (no Docker Desktop licence required on Linux):

```bash
# Debian / Ubuntu
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# RHEL / Fedora / CentOS
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Enable and start the Docker service, then add your user to the `docker` group so you can run commands without `sudo`:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

Confirm Docker is available:

```bash
docker --version
# Expected: Docker version 24.x.x (or later)
docker compose version
# Expected: Docker Compose version v2.x.x (or later)
```

> **Full install guide:** [docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

</details>

---

<details>
<summary><strong>🪟 Windows</strong></summary>

> SDKMan does not run natively on Windows. The alternative for windows is **winget** for a local install. Alternatively the approach is to use **Windows Subsystem for Linux (WSL 2)**, which gives you a full Linux environment.

<details>
<summary><strong>Local install</strong></summary>

> On Windows, `winget` (Windows Package Manager) is bundled with Windows 10 1809+ and Windows 11. IBM Bob runs as a native Windows app, so its integrated terminal sees anything on the Windows `PATH`. Maven is the one exception: Apache publishes no winget package, so we need to install it by hand.

### 1 — Install Java 21 (IBM Semeru) via winget

Open **PowerShell** (or Windows Terminal) and run:

```powershell
winget install -e --id IBM.Semeru.21.JDK
```

> Installs the IBM Semeru Runtime 21 (OpenJ9 JVM) from IBM's official package. Accept the UAC prompt if asked — the MSI installs per-machine and updates `PATH` / `JAVA_HOME`.

Open a **new** terminal (so the updated environment is loaded) and verify:

```powershell
java -version
# Expected: openjdk version "21.0.x" ... IBM Semeru Runtime ...
echo $env:JAVA_HOME
# Expected: a path under C:\Program Files\Semeru\jdk-21...
```

> **If `JAVA_HOME` is empty**, derive it from the installed `java` and reopen the terminal:
> ```powershell
> $javaHome = Split-Path -Parent (Split-Path -Parent (Get-Command java).Source)
> [Environment]::SetEnvironmentVariable("JAVA_HOME", $javaHome, "User")
> ```

### 2 — Install Maven (manual)

Apache Maven ships as a plain ZIP with no installer and no winget package. Install it from https://maven.apache.org/download.cgi

Open a **new** terminal and verify:

```powershell
mvn -version
# Expected: Apache Maven 3.9.x ... and "Java version: 21" (Semeru)
```

### 3 — Install Docker Desktop via winget

```powershell
winget install -e --id Docker.DockerDesktop
```

> Docker Desktop uses a **WSL 2 backend** under the hood. If WSL 2 isn't present, the installer (or first launch) prompts you to enable it — run `wsl --install` and reboot if asked. This WSL layer is only Docker's engine; you do **not** develop inside it.

Launch Docker Desktop once and let it finish starting (tray icon), then confirm from PowerShell:

```powershell
docker --version
# Expected: Docker version 24.x.x (or later)
docker compose version
# Expected: Docker Compose version v2.x.x (or later)
```

### 4 — Open the project in Bob

> **Verify the toolchain is visible to Bob:** in Bob's integrated terminal run `java -version`, `mvn -version`, and `docker compose version`. All three should resolve before you start Part A.

</details>
<details>
<summary><strong>WSL install</strong></summary>

### 1 — Enable WSL 2

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

This installs WSL 2 with Ubuntu as the default distro. **Restart your machine** when prompted.

After the restart, Ubuntu will finish setting up. Create a UNIX username and password when asked.

> **Already have WSL?** Run `wsl --update` and `wsl --set-default-version 2` to ensure you are on WSL 2.

### 2 — Install prerequisites inside WSL

Open the **Ubuntu** (WSL) terminal and run:

```bash
sudo apt-get update && sudo apt-get install -y curl zip unzip
```

### 3 — Install SDKMan inside WSL

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk version
# Expected output: SDKMAN 5.x.x
```

### 4 — Install Java 21 via SDKMan

```bash
sdk install java 21.0.7-sem
sdk use java 21.0.7-sem
java -version
# Expected: openjdk version "21.0.7" ...
```

> **Tip — permanent default:** Run `sdk default java 21.0.7-sem` to make this the default for all new WSL terminals.

### 5 — Open the project in WSL

Clone or copy the `java-modernization/` folder into your WSL home directory so that all file operations stay inside the Linux filesystem (avoids Windows/Linux path-permission issues):

```bash
# If the repo is already on Windows, access it via the WSL mount:
cd /mnt/c/Users/<YourName>/path/to/java-modernization
# Or clone fresh inside WSL:
# git clone <repo-url> && cd java-modernization
```

### 6 — Confirm Maven is present

Bob's workflow generates a Maven wrapper (`mvnw`) inside the modernized project during Part D. A system Maven is not required for building the output, but Maven must be available to run the OpenRewrite migration recipes. Confirm it is present:

```bash
mvn -version
# Expected output: Apache Maven 3.x.x ...
```

If it is missing, install Maven via SDKMan:

```bash
sdk install maven
mvn -version
```

> **Bob tip:** Point Bob's workspace at the WSL path (`\\wsl$\Ubuntu\home\<user>\java-modernization`) when opening the folder, or use VS Code's **Remote – WSL** extension to open the folder natively inside WSL.

### 7 — Install Docker Desktop for Windows

A container runtime is required to run the database via `docker-compose`. Install **Docker Desktop for Windows**, which integrates with WSL 2:

1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) and run the installer.
2. During setup, ensure **"Use WSL 2 based engine"** is checked.
3. After installation, open Docker Desktop → **Settings → Resources → WSL Integration** and enable integration for your Ubuntu distro.

Confirm Docker is available from inside your WSL terminal:

```bash
docker --version
# Expected: Docker version 24.x.x (or later)
docker compose version
# Expected: Docker Compose version v2.x.x (or later)
```

> **Note:** Make sure Docker Desktop is **running** (check the tray icon) before starting the lab.

</details>
</details>

---

## Before You Start

> **1. Open the right folder.** Open the **`java-modernization/`** folder as your Bob workspace root.

> **2. Start in Ask mode.** Use the mode selector and choose **`Ask`**. Ask mode is read-only, so Bob can read and reason about the code but *cannot* change or create files. Perfect for the analysis phases, and it guarantees no files are written until we're ready.

> **3. Glance at Permissions.** At the bottom of the chat panel, open the **Permissions** menu. For the analysis parts of this lab, leaving **Read** approved lets Bob explore the code without stopping to ask; anything that changes files still needs your OK.

---

## Workshop Flow Overview

| Part | What You'll Do | Time |
|---|---|---|
| **Part A** | Understand the codebase — architecture and money-transfer flow | ~10 min |
| **Part B** | Upgrade assessment, correctness & security analysis | ~15 min |
| **Part C** | Build a modernisation spec from the legacy codebase | ~10 min |
| **Part D** | Java Modernization | ~20 min |
| **Part E** | Build, run, and verify the live API | ~5 min |

Each part builds on the previous one, mirroring how a real modernization program runs:
understand → assess → specify → generate → validate.

---

## Part A: Understand the Codebase

### Why this part?
Before modernizing software that moves customers' money, engineers must **fully understand how it works**: the domain model, transfer/ledger semantics, transaction boundaries, and what couples the app to Java 8, Spring Boot 1.5, and Oracle.

This part shows that Bob can perform a **deep technical read**, not just summarize files.
Begin by setting context for the conversation:

```
For our conversation, answer in chat and be concise. Focus on the source files in this project. Understand?
```

Then ask for a high-level overview:

```
What does this application do and how is it structured?
```

> **Note:** Bob reads several files before answering. Take a moment to review the response and ask follow-up questions. For example, *"What does double-entry ledger mean here?"* — before continuing.

Now ask for the architecture and the key flow:

```
Show me the software architecture as a Mermaid diagram, and explain the money-transfer flow.
```

> **Note:** The Mermaid diagram renders inline in the chat. If anything is missing (for example, the Oracle database or the ledger layer), ask Bob to add it before moving on.

---

## Part B: Upgrade Assessment, Correctness & Security

### Why this part?
Leadership needs an **honest, evidence-based assessment** before committing budget. This part produces three things in one conversation: upgrade blockers, money-safety risks, and security issues. Exactly these findings drive the modernization decisions in Parts D and E.

> Switch to **Plan mode**.

Before using the structured prompt below, try this challenge first:

```
What do you think is most risky about this codebase?
```

> **Note:** Note what Bob finds on its own. Then run the full prompt and compare. This is a live demonstration of Bob's reasoning depth!

Now run the full assessment:

```
Produce a Java modernization assessment for this application:

1. Inventory all framework and library dependencies and state their compatibility
   with Java 21 and Spring Boot 3.x — flag anything that blocks the upgrade.

2. Review the transfer, fee, and interest logic for correctness, money-precision,
   and concurrency problems. Where can the system lose money or let two requests
   spend the same balance?

3. Audit the data-access and API layers for security issues, especially SQL
   injection risks.

Deliver findings as a single report with three sections: Upgrade Blockers, Money-Safety Risks, and Security Issues.
```

### Expected Outcome
A structured assessment covering:
- Dependency inventory with Java 21 / Spring Boot 3.x compatibility ratings
- Money-precision and concurrency risks (`double` money, missing `@Transactional`, lost-update race)
- Security findings (SQL injection in `AccountService`, missing auth on money-moving endpoints)
- **HTTP Basic auto-enabled:** Spring Boot 1.5 activates HTTP Basic when `spring-security` is on the classpath — this will cause 401 errors in Part 2. Ensure `security.basic.enabled=false` is set in `application.properties`.

> **Tip:** Read Bob's findings carefully. The correctness and security issues it surfaces here are exactly what we fix as part of the modernization in Part E, no separate patching step needed.

---

## Part C: Build a Modernisation Spec

### Why this part?

Instead of asking Bob to build the whole application from one giant prompt, this lab uses **spec-driven development**: you first co-author a written specification, review and refine it, then have Bob build from that spec.

**Why this matters:**

- **Predictable output** — Bob builds what you agreed on, not what it guesses
- **A reviewable artifact** — the spec is something you (and stakeholders) can read, correct, and sign off on before any code exists
- **Better prompts** — a clear spec turns the build step into a short, precise instruction
- **Mirrors real engineering** — teams write requirements before implementation

You will build the spec one section at a time in the steps below. There is no single "correct" spec — the goal is to capture the inputs you need to write an effective build prompt.

> **Switch to `Agent` mode** using the mode selector. Agent mode can write files, which we need to save the generated spec.

---

### Step C-1: Document the current API contract

The legacy code has no written spec. Ask Bob to read the `@RestController` classes and produce a plain-English summary of every endpoint — method, path, inputs, and what it returns. This is your **baseline**: what the system does today.

```
Read the Aurora Core REST controllers and write a plain-English summary of every endpoint: HTTP method, path, query/path/body parameters, success response, and any known error cases.

Save it as specs/SPEC.md under a heading "## Current API Contract".
```

> **Checkpoint:** Open `specs/SPEC.md` and confirm every endpoint from `CustomerController`, `AccountController`, and `TransferController` is listed. Add any notes or corrections before moving on.

---

### Step C-2: Add the modernisation requirements

Now extend the same file with the target-state requirements, drawn directly from the Part B assessment findings.

```
Append to specs/SPEC.md a second section with four headings:

1. Upgrade targets: Java 21, Spring Boot 3.x, dependency changes
2. Money-safety fixes: @Transactional, BigDecimal, optimistic locking, fee guard
3. Security fixes: Parameterised SQL, Spring Security stub, DTO projections, input validation
4. API contract changes: Any endpoint inputs or responses that must change from the current contract

Keep each requirement concise and actionable: One sentence per item is enough.
```

> **Checkpoint:** Read through `specs/SPEC.md`. Add, remove, or reword any item before moving to Part D. The spec does not need to be exhaustive — it needs to be accurate enough that the build prompt in Part D produces code you are happy to review.

---

### Expected Outcome
- `specs/SPEC.md`: co-authored modernisation requirements, reviewed and ready to drive Part D

> **Tip:** This file answers two questions in one place: *"what does it do now?"* and *"what must the modernised version do?"*. Part D's build prompt will reference it directly.

---

## Part D: Java Modernization

### Why this part?
With the legacy codebase understood and the API contract extracted, we now run Bob's built-in **Java Modernization workflow**: A guided process that installs the target JDK, applies OpenRewrite recipes, remediates CVEs, and verifies the build. No manual command running or file editing required. This end-to-end automation (including multi-step Spring Boot migration, CVE remediation, and automated build verification) is a **Bob Premium** feature.

---

### Steps at a glance

| Step | What to do | What Bob does |
|---|---|---|
| **D-1** | Type `start java modernization` in chat. Under **Modernization Type** select `Java Upgrade`, turn off `Enable Git Flow`, and click `Continue`. Under **Java Configuration** choose `Semeru (IBM)` + `Java 21`. | Launches the workflow and applies Java 21 OpenRewrite recipes. |
| **D-2** | When asked *"Fix vulnerabilities?"*, click **`Yes`**. | Scans all dependencies, then applies targeted `pom.xml` overrides to remediate CVEs — Spring Boot 1.5.22 is preserved. |
| **D-3** | Wait for the Maven build to finish. | Runs `mvn package`; auto-patches any compiler errors. Expected result: **`BUILD SUCCESS`** with 1 warning and 0 errors. |

---

### Expected Outcome — `pom.xml` changes

| Property / artifact | Change |
|---|---|
| `<java.version>` | `1.8` → `21` |
| `<tomcat.version>` | added `8.5.100` |
| `<logback.version>` | added `1.2.13` |
| `<snakeyaml.version>` | added `2.0` |
| `<hibernate-validator.version>` | added `5.4.3.Final` |
| jackson artifacts | pinned `2.12.7.1` / `2.12.7` via `<dependencyManagement>` |
| H2 | upgraded to `2.2.220` |
| dom4j | replaced `dom4j:dom4j` → `org.dom4j:dom4j:2.1.4` |
| json-path | added `2.9.0` (test scope) |
| junit / assertj | pinned `4.13.2` / `2.9.1` |

> **What did NOT change (yet):** The project remains on Spring Boot 1.5.22 — `javax.persistence.*` imports, `findOne()` calls, and `Oracle12cDialect` are untouched. A full Spring Boot 3.x migration is covered in Part E.

> **Review the changes.** Open `pom.xml` and confirm the new overrides are in place. Then ask Bob: *"Why was Spring Boot not upgraded to 3.x here?"* or *"What risks remain with `javax.persistence` on Java 21?"*

---

## Part E: Build, Run & Verify

### Why this part?
The real payoff of the modernization story is seeing the new service **actually build and run**, on a current JDK, against a throwaway PostgreSQL container, producing the same JSON shapes the legacy API returned.

> Switch to **Agent mode**.

Ask Bob to do the end-to-end run for you:

```
Bring up Postgres with docker compose from the modern/ folder, build the modernized project in modern/, run the app on port 8090, and call GET /api/accounts/10 and GET /api/customers. Show the output.
```

Or run the commands yourself in the terminal:

```bash
cd modern
docker compose up -d --wait          # start PostgreSQL on port 5432
./mvnw -q -DskipTests package        # compile + package → target/corebank-modern-2.0.0.jar
java -jar target/corebank-modern-2.0.0.jar &   # start on port 8090
```

```bash
# in a second terminal: GET endpoints are public; POST endpoints require HTTP Basic:
curl http://localhost:8090/api/accounts/10
curl http://localhost:8090/api/customers
```

> **Spring Security note:** `GET /api/**` endpoints are public (no credentials required). `POST /api/**` money-moving endpoints require HTTP Basic authentication. The default credentials are `apiuser` / `secret`, overridable via the `API_USER` / `API_PASS` environment variables.

### Expected Response Shapes

`GET /api/accounts/10`:
```json
{
  "id": 10,
  "accountNumber": "ACC-1001",
  "customerId": 1,
  "accountType": "CHECKING",
  "currency": "EUR",
  "balance": 2500.00,
  "status": "ACTIVE",
  "openedAt": "2021-03-01T09:00:00Z"
}
```

`GET /api/customers`:
```json
[
  { "id": 1, "fullName": "Anna Schmidt",   "email": "anna.schmidt@example.com",  "status": "ACTIVE" },
  { "id": 2, "fullName": "Marco Rossi",    "email": "marco.rossi@example.com",   "status": "ACTIVE" },
  { "id": 3, "fullName": "Sophie Laurent", "email": "sophie.laurent@example.com","status": "ACTIVE" }
]
```

> **Note:** Money is returned as exact decimals (`BigDecimal` / `numeric(19,4)`), not floating-point artifacts — that is the correctness fix from Part B, live in production-ready code.

> **Leave this service running on port 8090.** Part 2 connects the Vaadin dashboard to it over HTTP. The REST API you just verified is the backend Part 2 consumes.

---

## Expected Outcome

By the end of this lab, you will have:

1. **A complete exploratory conversation** in your chat history covering the system's architecture, domain model, upgrade blockers, money-safety risks, and security findings with inline Mermaid diagrams.
2. **`specs/SPEC.md`** — a co-authored modernisation spec covering the current API contract and all required changes.
3. **`modern/`** — a running Java 21 / Spring Boot 3.x service on PostgreSQL, with `jakarta.*` namespaces, `BigDecimal` money, parameterized queries, and a Docker Compose stack.

---

## Troubleshooting

<details>
<summary><strong>Wrong Java version / build fails on language level</strong></summary>

Confirm `java -version` reports 21. The Spring Boot 3 parent and `maven.compiler.release=21` require a JDK 21 toolchain.
</details>

<details>
<summary><strong>Still seeing <code>javax.persistence</code> errors</strong></summary>

Spring Boot 3 uses `jakarta.persistence`. Ensure every entity import was migrated and that no transitive dependency pulls in the old `javax` JPA API.
</details>

<details>
<summary><strong>PostgreSQL connection refused</strong></summary>

- Confirm the container is running: `docker compose ps`
- Check that Postgres has finished initializing before the app connects
- Verify the datasource URL, username, and password in `application.yml` match `docker-compose.yml`
</details>

<details>
<summary><strong>Relation / column "does not exist"</strong></summary>

PostgreSQL folds unquoted identifiers to lower case. Ensure the JPA entity mappings (`@Table` / `@Column`) and `schema-postgres.sql` agree on identifier casing and quoting.
</details>

<details>
<summary><strong>Manual backend verification</strong></summary>

```bash
cd java-modernization/modern
docker compose ps postgres          # check health
docker compose up -d postgres       # if not running
./mvnw clean package -DskipTests
./mvnw spring-boot:run
```

In a second terminal:
```bash
curl http://localhost:8090/api/customers
curl http://localhost:8090/api/accounts/10
```
</details>

---

## Next Steps

After this lab, continue to:
- **Part 2**: Build a Vaadin 24 Java dashboard that consumes the REST API you just verified. Leave both PostgreSQL and the REST backend running before you start Part 2.

```bash
# Keep PostgreSQL and the REST backend running for Part 2:
cd java-modernization/modern
docker compose up -d postgres
./mvnw spring-boot:run
```

---

| [↑ Overview](<../README.md>) | [Part 2 · Full-Stack Dashboard](<./Bob_V2_lab_part2.md>) |
|:--|--:|
