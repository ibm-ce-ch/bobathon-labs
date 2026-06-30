# IBM Bob Workshop: Java Modernization | Part 2: Full-Stack Dashboard
## Case Study: Aurora Core — Modern Banking Dashboard (Vaadin 24 + Java 21 + Spring RestClient)

### Audience
Enterprise Java engineers and architects in **banking/ financial services** who have completed **Part 1** and have the Java 21/ Spring Boot 3.x REST backend running on port 8090.

### Goal of the Workshop
Demonstrate how **IBM Bob** can:
- Generate a production-ready Vaadin 24 dashboard entirely in Java
- Consume the modernized Spring Boot 3.x REST API from Part 1 using Spring `RestClient`
- Generate Java record types directly from the OpenAPI specification extracted in Part 1
- Implement an enterprise UI styled with the Vaadin Lumo design system
- Ensure type-safe, contract-driven full-stack development end to end in Java

> **Why this matters:** Banks need modern, responsive web interfaces and they often want to stay in Java end to end. This lab shows how IBM Bob can build a full-stack enterprise dashboard entirely in Java, where the OpenAPI spec extracted from the legacy codebase in Part 1 becomes the contract that drives the Java type system in Part 2.

---

## Before You Start

> **Prerequisite:** The Part 1 REST backend must be running on **port 8090**.
> If it is not running, see [Backend Startup Reference](#backend-startup) at the bottom of this file.

> **Open the right folder.** Open the **`java-modernization/`** folder as your Bob workspace root, the same folder you used in Part 1.

> **Stay in `Agent` mode** for this entire lab. Agent mode can create files and run commands, which is needed throughout.

---

## Workshop Flow Overview

| Part | What You'll Do | Time |
|---|---|---|
| **Part A** | Scaffold the Vaadin + Spring Boot project | ~10 min |
| **Part B** | Generate Java types from the OpenAPI spec and build the REST client | ~10 min |
| **Part C** | Build the Customer List and KPI Dashboard views | ~10 min |
| **Part D** | Build the Transfer Form view | ~10 min |
| **Part E** | Assemble the main layout and run the live dashboard | ~10 min |

---

## Part A: Scaffold the Vaadin + Spring Boot Project

### Why this part?
Vaadin runs as a standard Spring Boot application. The UI is defined in Java and rendered by the Vaadin server. We scaffold the project under `aurora-bank-ui/` as a completely independent service that talks to the Part 1 REST API over HTTP.

Start with this short prompt and see what Bob produces:

```
Create a new Spring Boot project in aurora-bank-ui/ for a Vaadin 24 dashboard that calls the REST API running on port 8090.
```

> **Note:** Read what Bob produces. If something is missing, make sure the result covers all of the goals (Expected Outcome) below before moving on.

### Expected Outcome
- Uses Vaadin 24 with the same Spring Boot version as the `modern/` project (Spring Boot 3.3.x)
- Dev server runs on port **8080**; backend URL (`http://localhost:8090`) is configurable via a property
- No database or JPA configuration — this project calls the REST API, not the database
- HTTP Basic credentials (`aurora.api.username` / `aurora.api.password`) are configurable via properties and forwarded on every POST request — the `modern/` backend requires Basic auth on all write endpoints
- A Maven wrapper is included so the project builds without a pre-installed Maven
- A README is included with build and run instructions
- `BUILD SUCCESS` from:

```bash
cd aurora-bank-ui
./mvnw -q -DskipTests package
```

> **Note:** The build downloads Vaadin's npm frontend bundle on first run. This can take 2–3 minutes. Subsequent builds are fast. You must see `BUILD SUCCESS` before moving to Part B.

### Known issues and fixes

<details>
<summary><strong>Bob sets the UI port to something other than 8080 (e.g. 8091)</strong></summary>

Bob may choose a non-clashing port if it detects the legacy app on 8080. The `modern/` backend already runs on 8090, so 8080 is free.

Fix: set `server.port=8080` in `aurora-bank-ui/src/main/resources/application.properties` (or `application.yml`), then re-run the build.
</details>

<details>
<summary><strong>Maven wrapper (mvnw) is missing</strong></summary>

If Bob does not generate the wrapper, run this once inside `aurora-bank-ui/`:

```bash
mvn wrapper:wrapper
```

This creates `mvnw`, `mvnw.cmd`, and `.mvn/wrapper/maven-wrapper.properties`. The lab checkpoint `./mvnw -q -DskipTests package` will then work.
</details>

<details>
<summary><strong>POST calls return HTTP 401 (transfers / account opens fail)</strong></summary>

The `modern/` backend's `SecurityConfig` requires HTTP Basic on all `POST /api/**` requests (credentials: `apiuser` / `secret`). If Bob's API client does not include credentials, every write operation returns 401 and the form shows an error.

Fix — add to `application.properties`:

```properties
aurora.api.username=apiuser
aurora.api.password=secret
```

Then update the `WebClient` (or `RestClient`) bean to attach the credentials on every request:

```java
// WebClient
WebClient.builder()
    .baseUrl(baseUrl)
    .defaultHeaders(h -> h.setBasicAuth(username, password))
    .build();

// RestClient
RestClient.builder()
    .baseUrl(baseUrl)
    .defaultHeader(HttpHeaders.AUTHORIZATION,
        HttpHeaders.encodeBasicAuth(username, password, StandardCharsets.UTF_8))
    .build();
```
</details>

<details>
<summary><strong>Spring Boot 1.5 legacy app crashes with InaccessibleObjectException on Java 21</strong></summary>

If you are still running the **legacy** app (not `modern/`) and it crashes with:

```
Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(...) accessible
```

Java 21 strong encapsulation blocks Spring Boot 1.5's CGLIB proxy generation. Add these flags to the `spring-boot-maven-plugin` configuration in the legacy `pom.xml`:

```xml
<configuration>
  <jvmArguments>
    --add-opens java.base/java.lang=ALL-UNNAMED
    --add-opens java.base/java.lang.reflect=ALL-UNNAMED
    --add-opens java.base/java.io=ALL-UNNAMED
    --add-opens java.base/java.util=ALL-UNNAMED
  </jvmArguments>
</configuration>
```

This is not needed for the `modern/` backend — Spring Boot 3.x uses Jakarta EE and is fully compatible with Java 21.
</details>

<details>
<summary><strong>docker compose up fails: port 5432 already allocated</strong></summary>

Another Postgres container (e.g. `aurora-postgres-modern` from a previous lab session) is already bound to port 5432.

**Option A — reuse the existing container** (fastest): if `aurora-postgres-modern` is already healthy and the `aurora` database exists, skip `docker compose up` entirely.

**Option B — remap the port**: in `docker-compose.yml` change the host port:

```yaml
ports:
  - "5433:5432"
```

Then update the JDBC URL in `application-local.properties` to match:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5433/aurora
```
</details>

---

## Part B: Generate Java Types from the OpenAPI Spec and Build the REST Client

### Why this part?
Instead of hand-writing Java record types that could drift from the backend, we **generate them automatically from the OpenAPI spec** you produced in Part 1. We then build a typed service class that calls the Part 1 REST API.

Start with this short prompt and see what Bob produces:

```
Using the spec at specs/SPEC.md, generate Java types for the API models and create a service class that calls the REST backend.
```

> **Note:** Bob may produce interfaces, records, or hand-written classes. Read what it generates and check whether the goals below (Expected Outcomes) are met before moving on.

### Expected Outcome
- Java record types (`CustomerRecord`, `AccountRecord`, `TransferRecord`, `AccountSearchRecord`) are derived directly from `specs/SPEC.md` — no hand-written model classes that could drift
- `money` fields (`balance`, `amount`) use `BigDecimal`, not `double`, matching the spec's money-safety requirement
- Field names match the JSON shapes from Part 1: `fullName`, `balance`, `status`, `accountNumber`, etc.
- A service class (`AuroraApiClient`) is backed by Spring `RestClient` reading its base URL from the `aurora.api.base-url` property
- The service exposes typed methods covering all spec endpoints: `getCustomers()`, `getCustomer(id)`, `createCustomer()`, `getAccount(id)`, `getAccountsForCustomer(customerId)`, `searchAccounts(name)`, `openAccount()`, `createTransfer()`
- HTTP Basic credentials (`aurora.api.username` / `aurora.api.password`) are read from properties and attached to every request — required by the modernised backend's security config
- API errors (4xx/5xx) are caught in a `defaultStatusHandler` and rethrown as `IllegalStateException` carrying the server's error body, so Vaadin views can display them in a notification
- `BUILD SUCCESS` — `./mvnw -q -DskipTests compile` passes with zero compilation errors

> **Checkpoint:** Ask Bob to show you the generated types and confirm the field names match Part 1's JSON shapes.

---

## Part C: Build the Customer List and KPI Dashboard Views

### Why this part?
Two data-display views built together — a customer table and a KPI summary. They share the same `AuroraApiClient` and Vaadin layout primitives, and are the Vaadin equivalent of `CustomerList.tsx` and `KPIDashboard.tsx` from the React lab.


Start with this short prompt and see what Bob produces:

```
Build me a Vaadin view that shows all customers in a table, and a dashboard view with KPI tiles showing total balance, active accounts, and average balance.
```

> **Note:** Read what Bob produces and check whether the goals below are met before moving on.

### Expected Outcome
- A `CustomerView` (`@SpringView(name="customers")`) that loads all customers from the repository and displays them in a `Grid<Customer>` with columns: ID, Full Name, Email, Status with an inline filter row on the Name and Email columns
- A `DashboardView` (`@SpringView(name="dashboard")`) that queries all accounts and aggregates three KPI tiles: **Total Balance**, **Active Accounts**, and **Average Balance** — each rendered as a Valo card panel
- A `MainUI` (`@SpringUI(path="/ui")`) wired to a Vaadin `Navigator` with a top navigation bar containing buttons for Dashboard and Customers; the app lands on Dashboard by default
- `@ServletComponentScan` is added to the main application class so Spring Boot registers the `@WebServlet` declared inside `MainUI`
- Both views should compile cleanly.

<details>
<summary><strong>How to run the app</strong></summary>

**Step 1 — Ensure the Part 1 REST backend is running on port 8090** (see [Backend Startup Reference](#backend-startup)).

**Step 2 — Start the Vaadin dashboard:**

```bash
cd aurora-bank-ui
./mvnw spring-boot:run
```

**Step 3 — Verify the REST backend is serving requests:**

```bash
curl -s http://localhost:8090/api/customers | head -c 200
```

**Step 4 — Open the UI in a browser:**

```
http://localhost:8080/ui
```

You should see:
- A top navigation bar with **Dashboard** and **Customers** buttons
- The **Dashboard** page showing three KPI tiles: Total Balance, Active Accounts, Average Balance
- The **Customers** page showing a full grid of seeded customers with live Name/Email filter fields

**To stop the Vaadin app:** `Ctrl+C` in the terminal running `spring-boot:run`.

</details>

> **Tip:** The navigation shell is assembled in Part E — the views are reachable at `/ui` from this point onward.

---

## Part D: Build the Transfer Form View

### Why this part?
The transfer form is the most interactive view in the dashboard. It demonstrates Vaadin form components, client-side validation before the HTTP call, and live feedback. It is where money actually moves, so the UX matters.


Start with this short prompt and see what Bob produces:

```
Create a Vaadin view for creating money transfers between accounts.
```

> **Note:** Read Bob's output and check whether the goals below are met. This back-and-forth is intentional. It demonstrates how prompt specificity controls output quality.

### Expected Outcome
- A transfer form routed at `/transfer` with four fields: From Account ID, To Account ID, Amount, and an optional Memo
- All required fields are validated before the API is called: all fields filled, amount positive, from ≠ to account
- The submit button is disabled while the transfer is in progress
- A green success notification appears and all fields clear after a successful transfer
- A red error notification shows the API's error message when the transfer is rejected (e.g. insufficient funds, frozen account)
- The view compiles cleanly

---

## Part E: Assemble the Main Layout and Run the Dashboard

### Why this part?
The final step wraps all three views inside a navigation shell that gives the dashboard its Aurora Bank identity.

Start with this short prompt and see what Bob produces:

```
Create a navigation shell for the Aurora Bank dashboard with a dark theme and sidebar links to Dashboard, Customers, and New Transfer.
```

> **Note:** Read what Bob produces and check whether the goals below are met before moving on.

### Expected Outcome
- A navigation shell titled "Aurora Bank Dashboard" wraps all three views
- A sidebar contains three entries: Dashboard, Customers, and New Transfer, each linking to the correct route
- The dark Lumo theme is applied to the entire application
- All three views are wired to the shell, navigating between them works without a full page reload
- The app starts and is accessible at `http://localhost:8080`

### How to run

```bash
# Terminal 1 — REST backend on port 8090
cd java-modernization/modern
docker compose up -d postgres
./mvnw spring-boot:run

# Terminal 2 — Vaadin dashboard on port 8080
cd aurora-bank-ui
./mvnw spring-boot:run
```

Then open **http://localhost:8080** and verify:
- Dark-themed AppLayout shell with Aurora Bank Dashboard title
- Side navigation with Dashboard, Customers, and New Transfer links
- Dashboard page shows KPI tiles: Total Balance, Active Accounts, Average Balance
- Customers page shows a grid of all seeded customers with ID, Full Name, Email, Status
- New Transfer page shows the form; submitting a valid transfer shows a success notification
- Submitting a transfer with insufficient funds shows a red error notification

> **Try a transfer:** See if your application works :)

---


## 🚀 Suggested Next Steps

Explore these independently after the lab:

- **Balance Chart** — Ask Bob to add a `BalanceChartView` using Vaadin Charts showing account balance distribution as a pie chart
- **Contract Testing** — Ask Bob to generate Spring Boot integration tests that call each `AuroraApiClient` method against a WireMock stub of the OpenAPI spec at development time
- **Docker Deployment** — Ask Bob to create Dockerfiles for both services and a root-level `docker-compose.yml` to run the full stack with one command
- **Authentication** — Ask Bob to add Spring Security HTTP Basic to the REST backend and a login screen to the Vaadin dashboard
- **Monitoring** — Ask Bob to add Spring Boot Actuator to both services and surface health and metrics in a dedicated dashboard view

---

## What You Accomplished

By the end of this lab, you will have:

1. **A running full-stack modernization**: Java 8 / Spring Boot 1.5 / Oracle → Java 21 / Spring Boot 3.x / PostgreSQL → Vaadin 24 dashboard..
2. **Contract-driven types**: The OpenAPI spec extracted from the legacy Java code in Part 1 drove the Java record type system in Part 2. One source of truth across the full stack.
3. **An enterprise UI** built with Vaadin 24 and the Lumo dark theme, featuring KPI tiles, a data grid, and a validated transfer form.
4. **Type-safe REST integration**: compile-time errors prevent backend/frontend contract drift.


## Troubleshooting

<details>
<summary><strong>Navigating to /ui returns a 404 Whitelabel Error Page</strong></summary>

**Symptom:**
```
There was an unexpected error (type=Not Found, status=404).
```

**Cause:** Bob generated a manual `@WebServlet` inner class inside `MainUI`. With `vaadin-spring-boot-starter`, the starter already auto-registers `SpringVaadinServlet` at `/*` based on `@SpringUI(path)`. The two registrations conflict and neither owns the path.

**Fix — remove the inner `Servlet` class and the `@ServletComponentScan` annotation:**

In `MainUI.java`, delete the inner class entirely:

```java
// DELETE these lines:
@WebServlet(urlPatterns = "/ui/*", asyncSupported = true)
@VaadinServletConfiguration(ui = MainUI.class, productionMode = false)
public static class Servlet extends VaadinServlet {
}
```

In `CoreBankApplication.java`, remove `@ServletComponentScan` and its import. Then recompile and restart:

```bash
mvn compile -q && mvn spring-boot:run -Dspring.profiles.active=local
```

`@SpringUI(path="/ui")` on `MainUI` is sufficient — the starter maps the servlet to that path automatically.

</details>

<details>
<summary><strong>Vaadin build fails: "vaadin-dev-server" or npm errors on first run</strong></summary>

Vaadin downloads its own npm frontend bundle into `target/` on the first build. This requires a working internet connection and takes 2–3 minutes. If the build fails mid-download:

```bash
cd aurora-bank-ui
./mvnw vaadin:clean-frontend
./mvnw -q -DskipTests package
```

If `npm` is not found, install Node.js 18 LTS or later — Vaadin's Maven plugin bundles its own Node but falls back to the system Node if the download fails.
</details>

<details>
<summary><strong>REST calls fail: I/O error or connection refused on /api/* calls</strong></summary>

**Symptom:**
```
Transfer failed: I/O error on POST request for "http://localhost:8090/api/transfers": null
```
or all views show errors / empty data.

**Cause:** The `modern/` REST backend is not running. The Vaadin UI always calls `http://localhost:8090` — the port the `modern/` backend listens on. The legacy `java-modernization` backend runs on port **8080** and is a separate process.

**Fix:** Start the `modern/` backend in a separate terminal:
```bash
cd modern
docker compose up -d postgres
./mvnw spring-boot:run
```
Then confirm it is up before retrying the transfer:
```bash
curl http://localhost:8090/api/customers
```

If you need to use a different port, update `aurora.api.base-url` in `aurora-bank-ui/src/main/resources/application.properties` to match.

See [Backend Startup Reference](#backend-startup) for the full startup sequence.
</details>

<details>
<summary><strong>openapi-generator fails: cannot read spec file</strong></summary>

The generator reads `java-modernization/specs/aurora-core-api-v1-legacy.yaml`. If the file is missing, it was not produced in Part 1 Part C.

**Fix:** Go back to Part 1 Part C and ask Bob to generate the spec, then re-run:
```bash
cd aurora-bank-ui
./mvnw -q -DskipTests package
```
</details>

<details>
<summary><strong>Generated record fields have wrong names or missing fields</strong></summary>

The generated records mirror the JSON field names from the OpenAPI spec. If a field name in `CustomerRecord` does not match what the REST API returns (e.g. `full_name` vs `fullName`), the spec may have been generated with incorrect casing.

**Fix:** Ask Bob to inspect `specs/aurora-core-api-v1-legacy.yaml` and confirm the property names match the JSON shapes in Part 1's Expected Response Shapes. Regenerate the spec if needed, then re-run `./mvnw -q -DskipTests package`.
</details>

<details>
<summary><strong>KPI tiles show 0 or "—" instead of real values</strong></summary>

**Symptom:** Total Balance, Active Accounts, and Average Balance display `0` or `—` even when the REST backend is running.

**Cause:** The `GET /api/accounts` endpoint is scoped per customer — there is no single "get all accounts" endpoint. `KPIDashboard` must fan out: fetch all customers first, then fetch accounts per customer and aggregate.

**Fix:** Confirm `KPIDashboard.java` calls `apiClient.getCustomers()` first, then calls `apiClient.getAccounts(customer.id())` for each customer, flattens the results, and aggregates the three KPIs. Ask Bob to review the view if it does a single `getAccounts()` call with no customer ID.
</details>

<details>
<summary><strong>Transfer form shows no error for invalid account IDs</strong></summary>

`AuroraApiClient.createTransfer()` catches 4xx/5xx responses and rethrows as `IllegalStateException`. Confirm `TransferView` catches `IllegalStateException` and displays the message in the error notification. Ask Bob to review the try/catch block in `TransferView.java` if no notification appears on a bad submission.
</details>

<details>
<summary><strong>docker-compose: "no such service: #" error</strong></summary>

**Symptom:**
```
no such service: #
```

**Cause:** Shell inline comments (`#`) are only stripped when the shell processes them — but some terminals pass them as literal arguments when copy-pasting compound commands.

**Fix:** Strip inline comments and name only the `postgres` service:
```bash
cd modern
docker-compose up -d postgres
```
</details>

<details>
<summary><strong>Maven: "Unknown lifecycle phase #" error</strong></summary>

**Symptom:**
```
[ERROR] Unknown lifecycle phase "#". You must specify a valid lifecycle phase...
```

**Cause:** Same shell-comment issue as above.

**Fix:** Run Maven commands without inline comments:
```bash
./mvnw spring-boot:run
```
</details>

---

## Backend Startup Reference {#backend-startup}

If the Part 1 REST backend is not running, start it here before beginning Part A:

```bash
cd java-modernization/modern

# Start PostgreSQL
docker compose up -d postgres

# Start the REST backend (leave this terminal open)
./mvnw spring-boot:run
```

Verify it's up:
```bash
curl http://localhost:8090/api/customers
# Should return a JSON array of customers
```

- Swagger UI: **http://localhost:8090/swagger-ui.html**
- OpenAPI spec: **http://localhost:8090/v3/api-docs**

---

| [Part 1 · Java Modernization](<./Bob_V2_lab_part1_vaadin.md>) | [↑ Overview](<../README.md>) |
|:--|--:|
