# Build a Carbon React Teller Application | Part 2
## Case Study: GFM Bank Modern Teller Interface (React / IBM Carbon Design)

### Goal of part 2
Demonstrate how **IBM Bob** can:
- Practice spec-driven development: write and refine a specification before any code is generated
- Build a complete React UI from a reviewed specification, on top of a provided starter project
- Apply IBM Carbon Design System components correctly
- Connect frontend applications to existing backend APIs
- Create production-ready, accessible banking interfaces
- Leverage MCP (Model Context Protocol) for enhanced design capabilities

We will build a modern **Teller Front-End** for GFM Bank that connects to the Core Banking API analyzed in Part 1.

You start from a **runnable starter project** that has the plumbing already wired (backend proxy, authentication, the API client). Your job — with Bob — is to design the spec and then build the **Carbon UI** on top of that plumbing.

> **Open the right folder.** Open the **`02_build_the_teller_app`** folder as your Bob workspace root. Every file path in this lab (for example `code/teller_client.py` or `starter/teller_frontend/`) is relative to that folder.

---

## Prerequisites - Setup Instructions

### What you're working with

**Carbon React** is IBM's React UI component library — ready-made, accessible building blocks (buttons, data tables, forms, modals, the UI Shell) you assemble the teller interface from. Learn more at [carbondesignsystem.com](https://carbondesignsystem.com/).

**The IBM Carbon MCP** is a set of web-accessible tools Bob can call to pull in the right Carbon design elements — which components to use and their correct import paths. Paired with the **`carbon-builder`** skill — a local guide that tells Bob how to use those tools and build Carbon UI the right way — it helps Bob build with Carbon.

**The Carbon React mode** is a custom Bob mode tuned for this work — a purpose-built persona that already knows to reach for the `carbon-builder` skill and the Carbon MCP, so Bob builds with the right Carbon components from the start.

### Already set up for you

The connection is already set ip:

- **Carbon MCP** — configured in `.bob/mcp.json`.
- **`carbon-builder` skill** — installed under `.bob/skills/`.
- **Carbon React mode** — a custom mode defined in `.bob/custom_modes.yaml`, tuned for building Carbon UI.

> **What's an MCP server?** A way to give Bob extra tools beyond its built-in ones, delivered over the internet — like an API an agent can understand and call. Here, those tools search Carbon's components, icons, and docs.

> **What's a Bob skill?** A reusable set of instructions stored locally that Bob loads on demand for a specific task — here, a guide for how to use the Carbon MCP and build UIs with Carbon the right way.

> **What's a custom mode?** In Part 1 you met Bob's built-in modes — **Ask**, **Plan**, and **Agent**. A *custom mode* goes further: a purpose-built persona with its own role, allowed tools, and instructions, saved with the project so it travels with the lab. Here, **Carbon React** is one such mode, specialized for building Carbon UI.

Just open the **`02_build_the_teller_app`** folder as your Bob workspace and Bob picks all of this up automatically. Bob keeps the MCP connection details, skills, and custom modes in the project's `.bob/` folder, so they travel with the lab.

> **Add your Carbon MCP credentials.** The token and session ID are shared separately in [this sheet](https://docs.google.com/spreadsheets/d/1YwabTyHriSXjsae0vGewFRn-ZUeKr0rx2pJAUj1v268/edit?usp=sharing). If the token is expired (mcp server disconnects), you can get your own credentials from [here](https://carbondesignsystem.com/developing/carbon-mcp/onboarding-and-setup/). Open `.bob/mcp.json` and paste them in place of the two `<PASTE_…>` placeholders, so the file reads:
>
> ```json
> {
>   "mcpServers": {
>     "carbon-mcp": {
>       "type": "streamable-http",
>       "url": "https://mcp.carbondesignsystem.com/mcp",
>       "headers": {
>         "Authorization": "Bearer <token from the sheet>",
>         "X-MCP-Session": "<session id from the sheet>"
>       }
>     }
>   }
> }
> ```

Want to confirm it for yourself? You can browse the **settings** (gear icon, top right) — there are **MCP**, **Skills**, and **Modes** sections. Or just ask Bob, since it can see its own configuration:

> **Set your Permissions first.** Stay in **Ask** mode, then open the **Permissions** menu (bottom of the chat panel) and enable **Read**, **MCP**, **Skill**, **Subagent**, and **Mode**. That lets Bob call the Carbon MCP and inspect its own setup to answer the questions below without stopping for approval each time.

```
Which MCP servers are connected, what tools do they have, and what is each server used for?
```
```
What skills do you have installed, and what are they used for?
```
```
What custom modes are installed, and what are they used for?
```

### Switch into Carbon React mode

Switch out of Ask mode and into **`⬡🐝 Carbon React`** mode before you start building — it's wired to reach for the `carbon-builder` skill and the Carbon MCP, so Bob builds with the right components and import paths from the start. Just ask Bob:

```
Switch to Carbon React mode.
```

> **Set your Permissions.** Open the **Permissions** menu and enable **Read**, **MCP**, **Skill**, **Todo**, **Subtask**, **Subagent**, and **Mode** (leave **Edit** and **Execute** off), then turn the master **Auto-approve** switch on. This lets Bob reach the Carbon MCP and skills on its own while still pausing for your approval on what it builds.

---

## Workflow Overview

1. Test the existing backend API connectivity
2. Build a specification (`SPEC.md`) one piece at a time — functional requirements, non-functional constraints, edge cases, and scope
3. Review and refine the spec
4. Open the provided **starter project** and see what is already wired for you
5. Plan the build in **Plan mode** — turn the spec and starter into a reviewed implementation plan
6. Build the Carbon UI by following the approved plan, on top of the starter
7. Try the finished teller app in the browser

Each step builds on the previous one to create a complete, production-ready banking teller interface.

---

## Lab Files

The following files are included in this lab:

Reference (read these to understand the backend):
- `code/teller_client.py` - Reference CLI showing all required teller operations
- `code/backoffice_client.py` - Reference for understanding API patterns (back-office; out of scope here)
- `code/API_REFERENCE.md` - The teller-facing API contract: endpoints, request/response shapes, and auth, grounded in the live backend
- `code/requirements.txt` - Python dependencies (for reference)

Starter project (you build into this):
- `starter/teller_frontend/` - A runnable React + Carbon scaffold with the plumbing pre-wired. See its `README.md`.

Backend Server:
- **URL**: `https://wxo-corebanking-backend.1944johjccn7.eu-de.codeengine.appdomain.cloud`
- **Test IBAN**: `DE89545769475769453536`

---

## Step 1 - Test Backend Connectivity

### Why this step?
Before building a frontend, verify that the backend API is accessible and functioning correctly.

### Prompt
```
Can you test my teller client with my server:
https://wxo-corebanking-backend.1944johjccn7.eu-de.codeengine.appdomain.cloud

Use IBAN DE89545769475769453536 to check the balance.
```

### Expected Outcome
Bob should:
- Connect to the backend server
- Authenticate using the teller credentials
- Retrieve and display the account balance
- Show recent transactions for the specified IBAN

---

## Spec-Driven Development

Instead of asking Bob to build the whole application from one giant prompt, this lab uses **spec-driven development**: you first co-author a written specification, review and refine it, then have Bob build from that spec.

Why this matters:
- **Predictable output** — Bob builds what you agreed on, not what it guesses
- **A reviewable artifact** — the spec is something you (and stakeholders) can read, correct, and sign off on *before* any code exists
- **Reduce reliance on prompts** — a clear spec turns the build step into a short, precise instruction

You will build the spec one section at a time in the steps below. There is no single "correct" spec — the goal is to capture the inputs you need to write an effective build prompt.

---

## Step 2 - Start the Spec

### Why this step?
Begin the specification with just an overview and goals. You will grow it section by section in the following steps.

### Prompt
```
Create a specification document called SPEC.md for a new Teller Front-End application for "GFM Bank".

Add just two sections to start:
1. **Overview** — a short paragraph: a modern, professional banking teller interface built with React and the IBM Carbon Design System that connects to the existing Core Banking backend (the same API used by teller_client.py).
2. **Goals** — a short bulleted list of what the application must achieve for a bank teller.

Keep it brief — we will add more sections in the next steps. Save this as SPEC.md in the project root.
```

---

## Step 3 - Define Functional Requirements

### Why this step?
Functional requirements describe *what the system must do*. Grounding them in `teller_client.py` and `code/API_REFERENCE.md` keeps them tied to operations the backend actually supports.

### Prompt
```
Look at code/teller_client.py and code/API_REFERENCE.md, then add a "Functional Requirements" section to SPEC.md. Base every requirement on operations the teller client actually performs against the backend — do not invent features or endpoints. The client supports exactly these operations:

- Log in with a username and password to obtain an auth token (the client uses teller / teller123; store credentials in a .env file)
- List the teller's accounts
- Look up an account's balance by IBAN (the balance is computed from the transaction ledger) with formatted currency display
- View an account's transaction history in a sortable, filterable table
- Transfer money between two accounts by IBAN (the backend rejects transfers that exceed the available balance)
- Send an overdraft request (a teller cannot grant overdrafts; this produces a formatted request for the back office)

You may also include these UI-only conveniences that are not backend operations: a backend connectivity indicator (online/offline) that polls the server, and consistent currency formatting.

Write each requirement so it is testable. Keep it concise and append it to SPEC.md.
```

---

## Step 4 - Identify Non-Functional Constraints

### Why this step?
Non-functional requirements describe *how* the system must behave — performance, security, accessibility, and design constraints.

### Prompt
```
Add a "Non-Functional Requirements" section to SPEC.md covering:

- **Design**: IBM Carbon Design System, professional banking theme (blues, grays, whites), Carbon UI Shell for layout, Carbon data tables, notifications, skeleton loading states, and confirmation modals for critical actions
- **Security**: credentials in .env, secure token storage, automatic logout on session expiration, input sanitization, HTTPS for all API calls
- **Accessibility**: ARIA labels and keyboard navigation
- **Responsiveness**: works across screen sizes
- **Technical constraints**: React functional components with hooks, React Router for navigation, a clear project structure (pages, components, services, utils), Axios or Fetch for API calls, environment-based configuration

Keep it concise — bullets, not prose — and append it to SPEC.md.
```

---

## Step 5 - Capture Edge Cases and Failure Modes

### Why this step?
Naming failure modes up front is what separates a prototype from a banking-grade interface. The spec should say what happens when things go wrong.

### Prompt
```
Add an "Edge Cases & Failure Modes" section to SPEC.md. For each case, state the expected behavior:

- Backend is offline or the connectivity check fails
- Invalid login credentials
- A transfer exceeds the available balance
- Invalid or unknown IBAN
- Session/token expires mid-session
- Network timeout or API error during an operation
- Empty transaction history
- Duplicate or double-submitted transactions

Present this as a table (case → expected behavior). Keep it concise and append it to SPEC.md.
```

---

## Step 6 - Define What Is Out of Scope

### Why this step?
Stating what you are *not* building prevents scope creep and keeps Bob focused.

### Prompt
```
Add an "Out of Scope" section to SPEC.md listing what this application will not include, for example:

- Deposits, withdrawals, and account creation — the backend exposes no teller endpoints for these (the only manual transaction route is back-office only)
- Back-office / administrative functions (separate from the teller role)
- Customer-facing self-service banking
- Real payment settlement or interbank clearing
- Multi-currency support
- Data persistence beyond what the backend provides

Keep it to a short bulleted list and append it to SPEC.md.
```

---

## Step 7 - Review and Refine the Spec

### Why this step?
A spec is only useful once it is reviewed. Read through `SPEC.md` yourself first, then have Bob critique its own document for gaps and contradictions, then you decide what to change.

### Prompt
```
Review the full SPEC.md as if you were a engineer about to implement it. Point out:

- Gaps or missing requirements
- Contradictions or ambiguities
- Anything inconsistent with what teller_client.py and code/API_REFERENCE.md actually support

List your findings in the chat. Do not rewrite the file yet — wait for my confirmation, then apply only the changes I approve.
```

> **Tip:** Read Bob's findings, decide which suggestions you agree with, and reply with the specific changes to make. This back-and-forth is the heart of spec-driven development.
>
> Bob will likely surface a long list — that's the point, it shows how well it can reason about the spec. You don't need to act on all of it. We recommend proceeding **without** making changes for now: get something working first, then build on it. **Part 4** is where you'll have the chance to extend and harden the app, so park the deeper suggestions until then.

Tell Bob to leave the spec as-is for now — we'll revisit the review findings in **Part 4**:

```
Leave SPEC.md unchanged for now — don't apply the review findings. We'll revisit them later.
```

---

## Step 8 - Run the Starter Project

You don't start from a blank page. The lab ships a **runnable starter** that already solves the tricky parts for you. It gives you three things:

1. **Backend wiring** — a dev proxy, the API client (`src/services/api.js`), and auth/session, so calls to the live backend just work.
2. **Carbon setup** — the stylesheet is already wired the one correct way (a single `@use '@carbon/react';` in `src/index.scss`). Leave it as is.
3. **App shell & pages** — routing plus placeholder pages, each with a `TODO` describing what to build.

This lets you focus on building the Carbon UI.

Before building, let's confirm it runs.

### Start it

You run the starter yourself in a terminal — the dev server is a long-running process, so Bob can't hold it open. Open a terminal — in the IDE, **Terminal → New Terminal** — and run these three commands:

```
cd starter/teller_frontend
npm install
npm run dev
```

Vite opens **http://localhost:3000** automatically. Sign in — `teller` / `teller123` are pre-filled. You'll see a deliberately plain scaffold with placeholder pages.

### Stop it

Once you've confirmed it loads, stop the server so it isn't running while Bob edits files in the next steps. Click the terminal and press **`Ctrl + C`**.

---

## Step 9 - Plan the Build (Plan mode)

### Why this step?
You now have both inputs Bob needs to plan well: a reviewed **spec** (*what* to build) and the **starter project** (the real files and plumbing). The **spec is the contract**; the **plan is the engineering approach** — the file-by-file build order that gets you there. Plan mode reads and reasons but does **not** implement: it drafts a plan for you to review and approve, then you switch modes to build it.

Switch the mode selector to **`Plan`**, then run the prompt below.

### Prompt
```
Plan the implementation of SPEC.md for the teller UI in starter/teller_frontend.

Read the spec and the full starter project — the placeholder pages and their TODO comments, plus the existing plumbing you'll reuse rather than rebuild. The plan must build on this plumbing exactly, not reinvent it:
- Every backend call goes through the functions already exported from src/services/api.js (login, getAccounts, getBalanceByIban, getTransactions, transferByIban, buildOverdraftRequest, checkBackendStatus). No second API layer, axios instance, or Vite proxy change.
- Auth goes through the useAuth() hook from src/auth/AuthContext.jsx.
- The Carbon stylesheet is already configured in src/index.scss as a single `@use '@carbon/react';`. The plan must not add any other Carbon CSS or SCSS import anywhere — that is the one thing that breaks the build.

At build time you'll use the carbon-builder skill and the Carbon MCP to choose components and get their correct import paths for the installed @carbon/react version, so call out in the plan which Carbon components each file needs.

Give me a file-by-file build order:
1. Login.jsx — a polished Carbon login replacing the stub.
2. Layout.jsx — a Carbon UI Shell replacing the temporary nav: GFM Bank branding, the online/offline backend status indicator (using checkBackendStatus), and logout.
3. Then Dashboard, Account Details, Transfer, and Overdraft Request per SPEC.md.
For each file, note which api.js function it calls and which Carbon components it uses.

Don't ask me to choose between options — make the reasonable engineering decision yourself and record it as an assumption in the plan so I can review it. For example, where Account Details needs the IBAN, re-fetch getAccounts() and look it up by accountId (that survives a page refresh or a direct URL).
```

> **Tip:** Read the plan and refine it in chat until you're happy — the same review-before-build discipline as the spec, now applied to the implementation approach. You don't need to flip the mode selector yourself; in the next step you just tell Bob to switch and build. The "make the decision yourself" line keeps Bob from stopping to ask a different batch of questions on every run — the choices it makes land in the plan, where you can change any you disagree with before building.

---

## Step 10 - Build From the Spec and Plan

### Why this step?
The plan you just approved already carries the build order, the plumbing-reuse rules, and the Carbon component choices, so the build prompt becomes short: Bob just executes the plan. Plan mode can't write code, so the prompt opens by asking Bob to switch into **`⬡🐝 Carbon React`** mode for the build.

### Prompt
```
I'm happy with the plan — switch to ⬡🐝 Carbon React mode and implement the teller UI into starter/teller_frontend, following SPEC.md and the plan you just produced.

Build in the plan's order so I can verify as we go, reuse the existing plumbing exactly as the plan specifies (api.js, useAuth(), and the single `@use '@carbon/react';` stylesheet — don't reinvent or duplicate any of it), and use the carbon-builder skill and the Carbon MCP for component choices and import paths. Keep package.json dependencies as they are unless something is genuinely missing.
```

> **Tip:** Because the spec carries the detail, the plan carries the build order and constraints, and the starter carries the plumbing, the build prompt can stay short — Bob already has everything it needs.

> **Check the mode before you build.** When you approve the plan, Bob may switch itself to **Agent** mode rather than Carbon React. If you see it land in **Agent**, switch the mode selector back to **`⬡🐝 Carbon React`** manually — that's the mode wired to the `carbon-builder` skill and the Carbon MCP for the build.

### Expected Outcome
Bob should:
- Replace the login and shell, then build the four teller pages, all with IBM Carbon components
- Reuse the provided `api.js` and `useAuth()` rather than writing new backend code
- Leave the Carbon stylesheet setup untouched (so the build keeps working)
- Produce a responsive, accessible banking interface

---

## Step 11 - Try the Application

### Why this step?
Now click through the teller app yourself and see what you built.

Start the dev server the same way as in Step 8 — in the terminal:

```
cd starter/teller_frontend
npm run dev
```

It serves at **http://localhost:3000** and hot-reloads as you go. Open it in a browser, sign in as the **teller** (`teller` / `teller123`), and try these — they all use real accounts on the shared backend:

- **Log in and out.** After signing in, use the **Log out** button (top right), then sign back in — the session should clear and return you to the login screen.
- **Find an account.** On the Dashboard, paste `DE89545769475769453536` into **Search by IBAN**, then click **View Details**. You'll see the **Balance Summary** (current, available, overdraft limit) and the **Transaction History** — try the **Filter by type** dropdown and the date sort.
- **Make a small transfer.** Open the Transfer page and move **€1.00** from `DE89545769475769453536` to `DE89393352904228421020`, then review and confirm. Watch for the success notification and the updated balance. (Keep the amount tiny — everyone shares these accounts.)
- **See a rejected transfer.** Repeat the transfer but enter a huge amount like `99999999`. It's rejected with a clear error — that's the backend enforcing the available balance, not a bug.
- **Request an overdraft.** On the Overdraft Request page, enter `DE89545769475769453536` and an amount like `500`, then **Generate Request**. This only drafts the request message — a teller can't grant the overdraft itself.

---

## Application Features Checklist

After completing this lab, your application should include:

### Authentication
- [ ] Login page with IBM Carbon form components
- [ ] Environment variable-based credential configuration *(pre-wired in the starter)*
- [ ] Session management with token storage *(pre-wired in the starter)*
- [ ] Logout functionality

### Dashboard
- [ ] GFM Bank branding in header
- [ ] Server status indicator (online/offline)
- [ ] Navigation using Carbon UI Shell
- [ ] Account list / lookup in a Carbon data table

### Teller Operations
- [ ] Balance inquiry with IBAN lookup
- [ ] Transaction history with data tables
- [ ] Money transfer between accounts (by IBAN)
- [ ] Overdraft request functionality

### User Experience
- [ ] Loading skeletons during API calls
- [ ] Success/error notifications
- [ ] Confirmation modals for critical actions
- [ ] Responsive design
- [ ] Accessibility compliance

---

## Next Steps

After completing this lab, proceed to:
- **Part 3**: Discover and fix security issues in banking code
- **Part 4** *(optional)*: Extend and harden this teller app — automated tests, new features, accessibility, resilience, and containerization

---

| [⬅️ Part 1 · Explore the Codebase](<../01_explore_the_codebase/part_1_explore_the_codebase.md>) | [↑ Overview](<../README.md>) | [Part 3 · Security Audit ➡️](<../03_fix_security_issues/part_3_security_audit.md>) |
|:--|:-:|--:|
