# Core Banking Architecture & Code Understanding | Part 1
## Case Study: GFM Bank Core Banking System (Python / FastAPI)

### Goal of part 1
Demonstrate how **IBM Bob** can:
- Understand complex banking system codebases
- Analyze API architecture and data flows
- Generate comprehensive engineering artifacts (diagrams, documentation)
- Reason about financial transaction logic and data integrity
- Produce architecture documentation suitable for stakeholders

We use the **GFM Bank Core Banking System**, a banking demo with a FastAPI backend, teller client, and back-office client.

### Outcomes
- **Explore through conversation**: Chat to explore the system's purpose, roles, and core operations. Bob will produce inline Mermaid diagrams and clickable code citations.
- **`ARCHITECTURE.md`**: A reference document with an executive summary, component diagram, API reference table, ER diagram, transfer sequence diagram, and the security and business rules.

Along the way you'll see how Bob handles this workflow: exploring safely in **Ask** mode, switching to **Agent** mode to take action, and doing the reading, diagramming, and documentation throughout.

---

## Before you start

> **1. Open the right folder.** Open the **`01_explore_the_codebase`** folder as your Bob workspace root. Every path below (like `code/demo_api.py`) is relative to that folder.

> **2. Start in Ask mode.** At the bottom of the chat panel, open the mode selector and choose **`Ask`**. Ask mode is **read-only** — Bob can read and explain the code but *cannot* change or create files. Perfect for exploring, and it guarantees we don't generate any documents until we're ready.
>
> *What's a mode?* A mode is a persona that sets how Bob behaves and what it's allowed to do. Bob ships with three: **Ask** (read-only, for exploring and explaining), **Plan** (designs an approach before any code), and **Agent** (full access to write, edit, and run). You switch modes with the selector throughout the labs, and Bob can also switch modes on its own when that's enabled in Permissions.

> **3. Glance at Permissions.** At the bottom of the chat panel, open the **Permissions** menu. There you can decide exactly which kinds of actions Bob may take without asking — toggle each category on or off (**Read**, **Edit**, **Execute**, **MCP**, **Skill**, **Todo**, **Subtask**, **Subagent**, **Mode**), with a master **Auto-approve** switch at the bottom. 

> **Note — recommended for this part:** enable **Read** for this part — that way you can first learn about the other actions Bob can take before enabling them.

---

## Step 1 — Explore the System (Ask mode)

### Why this step?
Before documenting a financial system, an engineer must first understand what it does — its purpose, its users, and its core operations. Ask mode lets Bob read and explain the codebase without modifying it, which is ideal for this initial exploration. The prompts below are intentionally short; ask each one in turn and review the response before continuing.

Begin by instructing Bob to keep its responses concise:

```
For our conversation, answer in chat and be concise. Focus on the files in the code folder. Understand?
```

Then open with a high-level question:

```
Explain the overall project in simple terms.
```

Continue with the following questions, asking each in turn:

```
What does Teller and back-office mean — what's the difference?
```

```
What is the API, and what does its attached database look like?
```

```
How is an account balance calculated? Be specific
```

Feel free to look through the code yourself or ask Bob any further questions to deepen your understanding of the project.

---

## Step 2 — Locate the Supporting Code

### Why this step?
When a detail matters, it should be verified against the source rather than taken on trust. Bob cites the file paths behind its answers, and in the IDE these citations are clickable, taking you directly to the relevant code.

```
Show me where roles are enforced.
```

---

## Step 3 — Generate Diagrams in the Chat

### Why this step?
Bob can render Mermaid diagrams directly in the chat, allowing you to review and refine them before they are committed to a document. Request each diagram in plain language:

```
Sketch the main system components as a Mermaid diagram; quote every node label individually.
```

```
Draw the data model.
```

Click on the diagrams to expand them.

---

## Step 4 — Produce the Architecture Document (Agent mode)

### Why this step?
The exploration so far has been read-only. This step consolidates the entire conversation into a single architecture reference.

Instruct Bob to consolidate the discussion into one document, specifying the sections it should contain:

```
Using parallel agents, draft each section below at the same time, then combine
them into one document, ARCHITECTURE.md, capturing what we explored:

1. Executive summary — one paragraph
2. Components — a Mermaid diagram
3. API reference — endpoints, purpose, who can call them (table)
4. Data model — a Mermaid ER diagram
5. Transfer flow — a Mermaid sequence diagram
6. Roles & security — how auth and access control work
7. Key business rules — overdraft, balances, who-can-do-what

Keep it concise: tables and short bullets over prose. Put the doc in the project root.
```
> **Note:** Bob will switch to Agent mode to write your documents.

Then have Bob double-check the diagrams in the document:

```
Double-check ARCHITECTURE.md and make sure that, in every Mermaid diagram, you quote each node label individually.
```

To see the diagrams rendered, left-click the newly created **`ARCHITECTURE.md`** file and choose **Open in Preview**.

---

## Next steps

After this lab, continue to:
- **Part 2**: Build a new Carbon React Teller Application against this API
- **Part 3**: Find and fix security issues in the banking code
- **Part 4** *(optional)*: Extend and harden the teller app — tests, features, accessibility, resilience, containerization

---

| [↑ Overview](<../README.md>) | [Part 2 · Build the Teller App ➡️](<../02_build_the_teller_app/part_2_build_the_teller_app.md>) |
|:--|--:|
