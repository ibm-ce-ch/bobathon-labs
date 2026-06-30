# Extend and Harden the Teller Application | Part 4
## Case Study: GFM Bank Teller Interface — Optional Extensions (React / IBM Carbon Design)

### Goal of part 4
Finished with the other parts? Time to bring your own idea or use the suggestions below — to extend the teller app you built in Part 2. Each one practices a different Bob skill: testing, feature delivery, accessibility, resilience, or deployment.

Whichever option you pick, work the way you did in Part 2: **plan first, then code.** Your Part 2 `SPEC.md` stays the baseline each plan builds on.

> **Open the right folder.** Open the same **`02_build_the_teller_app`** folder you used in Part 2 as your Bob workspace root (this guide lives there too) — that is where the app and its `SPEC.md` live, and every option extends it.

---

## Workflow Overview

1. Reopen your Part 2 app folder and start the development
2. Pick **one** extension option below (or bring your own)
3. Have Bob **ask you clarifying questions**, then draft a short plan focused on that topic
4. Review and approve the plan
5. Have Bob implement from the approved plan, then verify it in the embedded browser

---

## Plan First, Then Build

Have Bob plan with you first:

1. Tell Bob which option you are tackling and let it **ask you clarifying questions** — scope, acceptance criteria, edge cases, libraries.
2. Have Bob write a **focused plan for that topic, saved as its own document** (for example `TEST-PLAN.md` for tests, or `SEARCH-EXPORT-SPEC.md` for a feature). Review and adjust it until you agree.
3. Only then have Bob **implement** the change and verify it.

Start the loop with this prompt, pasting in the goal from the option you picked:

```
I want to extend the teller app. The goal:

<paste the prompt from one option below>

Before writing any code, ask me any clarifying questions you need. Then write a short plan for this change, saved as its own document named for the topic (for example TEST-PLAN.md for tests), covering requirements, acceptance criteria, and edge cases. Use the existing SPEC.md as background. Wait for my review, and implement only after I approve the plan.
```

---

## Options

### Option 1 - Add an automated test suite *(testing)*
Have Bob write tests so the app's behavior is verified, not just generated. Good coverage targets: login success/failure, transfer validation, insufficient-balance handling, currency formatting, and the online/offline status indicator. Optionally add a Playwright end-to-end test that drives the login → check-balance flow.

```
Add an automated test suite for this app using React Testing Library and Vitest, with the backend API mocked. Cover login success and failure, transfer validation, insufficient-balance handling, currency formatting, and the server status indicator. Show me how to run the tests.
```

### Option 2 - Add a new feature *(feature)*
Add a genuinely new capability to the app. Ideas: transaction search/filter with CSV export, a dashboard summary with a Carbon chart, print/PDF receipts, or a light/dark theme toggle using Carbon themes.

```
Add a transaction search and export feature: filter the transaction table by date, type, and amount, and export the filtered results to CSV.
```

### Option 3 - Accessibility & responsive hardening *(quality)*
Banking UIs are held to a high accessibility bar. Use Bob with the Carbon MCP to audit and fix the app.

```
Audit this app for accessibility against WCAG using Carbon's guidance: ARIA labels, keyboard navigation, focus order, and color contrast. Fix the issues you find, and verify the layout works across mobile, tablet, and desktop breakpoints.
```

### Option 4 - Resilience & error-handling polish *(robustness)*
Make the app actually behave the way the "Edge Cases & Failure Modes" section of your spec says it should.

```
Using the Edge Cases & Failure Modes section of SPEC.md, harden the app: add retry/backoff to the health-check poll, a graceful "backend offline" state, automatic logout on token expiry, and consistent error notifications instead of silent failures.
```

### Option 5 - Containerize the application *(deployment)*
Package the teller app so it can run anywhere, the same way the backend ships as a container (see `code/Dockerfile` from Part 1). Have Bob produce a production-grade image: a multi-stage build that compiles the React bundle and serves it with a lightweight web server, with configuration injected at runtime rather than baked into the image.

```
Containerize this React teller app for production. Create a multi-stage Dockerfile that builds the app and serves the static bundle with nginx, externalize the backend URL through a runtime environment variable (do not bake it into the image), and add a .dockerignore to keep the build context small. Then give me the docker build and docker run commands, and confirm the running container by loading it in the browser.
```

> **Bring your own idea:** anything that makes the app more useful, more robust, or more polished is fair game — describe it to Bob and iterate.

---

## Next Steps

This is the final part in this lab. From here, carry the techniques back to your own projects:

- **Spec-driven development** — co-author a `SPEC.md`, review it, then have Bob plan and build from it
- **Iterative hardening** — use tests, accessibility audits, and resilience passes to take generated code to production quality
- **Containerization & delivery** — let Bob package and document deployment so your work is reproducible

Revisit **Part 1** (architecture & documentation), **Part 2** (spec-driven build), and **Part 3** (security audit & remediation) any time you want to apply the same patterns to a new codebase.

---

| [⬅️ Part 3 · Security Audit](<../03_fix_security_issues/part_3_security_audit.md>) | [↑ Overview](<../README.md>) |
|:--|--:|
