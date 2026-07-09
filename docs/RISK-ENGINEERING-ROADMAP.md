# RISK ENGINEERING ROADMAP: WORKING HYPOTHESIS
### Personal pre-start thinking, not a proposal. To be tested, corrected, and reshaped in conversation with the GRC Engineer and Chad once I actually understand Docker's environment.

---

## THE PRINCIPLE THIS IS BUILT ON

Discovery before claims. This document is not a plan I'm walking in to present — it's a hypothesis I'm using to organize my own thinking before day one. Every phase below should be treated as a starting point for a real conversation, not a commitment. I expect this to change once I actually see the environment, meet the GRC Engineer, and understand what's already built.

---

## THE CORE IDEA

Not three separate projects. One risk register, maturing through three signal sources, added in the order Chad already told me things are prioritized: core risk program first, AI/MCP governance once that foundation exists.

The register schema matters more than the phases. If Phase 1 is built narrowly — only for the risks that exist today — Phases 2 and 3 require a rebuild rather than an extension. The goal is to design the register once, with fields that can accommodate container image signals and MCP server inventory without structural changes later. That means including asset criticality classification, signal source tracking, and a linked-control structure from the start, even if most fields sit empty until Phase 2 gives them something to hold.

---

## PHASE 1: FOUNDATION (roughly first 60–90 days)

**Jira Cloud risk register with ISO 27005-aligned automation.**

Why first: every later phase depends on a working register existing. This is also the safest first thing to pair with the GRC Engineer on — process automation, not deep security tooling, low risk of stepping on anything sensitive while I'm still building trust and understanding the environment.

What this likely includes: ISO 27005-aligned scoring built into the register structure, ownership and treatment-plan fields, SLA tracking with the default-acceptance-on-breach rule, and whatever automation makes sense once I understand Docker's actual ticket volume and workflow patterns.

**What Phase 1 is complete looks like:** The register has active risks with ownership assigned, SLA automation running without manual intervention, and the GRC Engineer has signed off on the workflow. That's the trigger for Phase 2 — not a calendar date. If adoption is partial or the automation is fragile, Phase 2 waits.

**Open questions for week one — before assuming anything:**
- What's the state of Docker's Jira instance? Enterprise Jira environments almost always have existing governance — a platform team that owns the instance, field naming conventions from a previous admin, automation limits on the plan tier. Verify before configuring anything.
- What's already been built ad hoc that I'd be replacing or formalizing? The most common way new hires create friction is building something that already half-exists without knowing it.
- What does the GRC Engineer see as the biggest technical constraint I don't know about yet?

---

## PHASE 2: EXTEND (once Phase 1 is live and adopted)

**Container image risk signals via Docker Scout, feeding into the Phase 1 register.**

Why second: this isn't a new system, it's a new signal source feeding the same pipeline. Docker Scout is Docker's own product — using it is both practically useful and the most credible, on-brand choice for a risk tool at this company specifically. This also directly operationalizes the image provenance and supply chain risks already in the register, turning a written risk ticket into a real, running control with evidence.

The register schema built in Phase 1 needs to carry this signal natively. That means the asset criticality field, signal source field, and linked-control structure from Phase 1 must be designed to accept container image findings without modification — not retrofitted when Phase 2 starts.

**What Phase 2 is complete looks like:** Docker Scout findings are flowing automatically into the register with correct severity mapping, SLA dates set, and ownership assigned. No manual triage step between scanner output and Jira ticket.

**Open questions:**
- What's Docker's current state of image signing and provenance enforcement, if any? Is there already Scout tooling I'd be extending rather than starting fresh?
- What does the GRC Engineer already have on the supply chain risk side? This is the most likely area where prior work exists that I don't know about.

---

## PHASE 3: MATURE (once AI/MCP becomes the active priority, per Chad's stated sequencing)

**MCP server inventory and risk classification, feeding into the same register.**

Why third, not first: Chad was explicit that AI/MCP governance falls into place once the core risk program is properly stood up. This phase is where AI governance gets a technical backbone — inventorying which MCP servers are in use, classifying each by blast radius (read-only vs. write/execute capability, data scope, external connectivity), and feeding that classification into the register automatically.

This is not a framework import. Prior work on AI governance from earlier roles gives me a starting vocabulary — categories like tool scope, data access, and bypass vectors — but those need to be validated against Docker's actual MCP server inventory before any of it gets applied. The inventory comes first. The framework emerges from what's actually there, not the other way around.

**The AI Gov program manager question is the most important unknown in this phase.** If she's already heading somewhere that overlaps with this, Phase 3 changes shape entirely — the goal is to extend her work, not duplicate it. That conversation happens before any Phase 3 work starts. If there's genuine overlap, the right output may be a technical implementation of her existing framework rather than something new. If the overlap is minimal, the two workstreams are additive. Either outcome is fine; the conversation determines which.

**What Phase 3 is complete looks like:** Every MCP server in use has an entry in the risk register with a classification, a risk score, and an owner. New MCP servers trigger an automatic intake flow rather than being added ad hoc.

**Open questions:**
- What does the AI Gov program manager already have in place, and where is she already headed?
- What's the current MCP server inventory at Docker — formal or informal? Does one exist at all?
- Is there a definition of acceptable MCP use that already exists, or is that part of what needs to be built?

---

## WHAT THIS DOCUMENT IS NOT

Not a commitment to timelines. Not something to present as a finished roadmap in an early meeting. Not a signal that I've already decided how Docker's environment works before I've seen it. It's a personal starting point, meant to be corrected quickly and often once real information replaces assumption.

The most important update this document needs is the one that comes after the first conversation with the GRC Engineer.
