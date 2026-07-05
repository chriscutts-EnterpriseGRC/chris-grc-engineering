# Jira Risk Project — Step-by-Step Build Guide
## Docker Hull Security Risk Programme

**Time to complete:** approximately 3–4 hours for full setup, 30 minutes for MVP
**Access required:** Jira Cloud administrator
**Reference:** `JIRA-RISK-PROJECT-SETUP.md` — field values, dropdown options, JQL filters, and automation rules

---

## Before You Start

You need Jira admin permissions for steps 2–6. If you only have project admin, you can still complete steps 1, 7, 8, and 9 — ask your Jira admin to handle the rest.

Have `JIRA-RISK-PROJECT-SETUP.md` open alongside this guide. This guide tells you where to click. That doc tells you what values to enter.

---

## Step 1 — Create the Project

**Navigation:** Projects → Create project

1. Click **Projects** in the top nav
2. Click **Create project**
3. Select **Scrum** or **Kanban** — choose **Kanban**
4. Select **Company-managed project** (not team-managed)

> Jira may call this "Classic project" in some versions. If you see the option for "Team-managed" vs "Company-managed", always choose company-managed. Team-managed projects cannot share workflows or field configurations across teams.

5. Fill in:
   - **Name:** Security Risk Register
   - **Key:** RISK
   - **Project lead:** your name or the Security GRC team lead
6. Click **Create**

---

## Step 2 — Create Issue Types (Work Types)

**Navigation:** Jira Settings → Work items → Work types

> Jira Cloud now calls issue types "work types" in some plans. If you don't see Work types, go to Jira Settings → Issues → Issue types instead — both paths lead to the same place.

### 2a — Create the Risk work type

1. Click **Add work type**
2. Name: `Risk`
3. Description: `A documented security exposure with a likelihood, impact, owner, and treatment path`
4. Icon: choose the shield or warning icon
5. Click **Create**

### 2b — Create the Risk Treatment work type

1. Click **Add work type**
2. Name: `Risk Treatment`
3. Description: `A specific action taken to mitigate, avoid, or transfer a risk. Always linked to a parent Risk issue.`
4. Click **Create**

### 2c — Create the Risk Acceptance work type

1. Click **Add work type**
2. Name: `Risk Acceptance`
3. Description: `A formal record of a risk accepted without active treatment. Captures approver, rationale, and expiry date.`
4. Click **Create**

### 2d — Add work types to your project

**Navigation:** Your project → Project settings → Issue types

1. Go to your RISK project
2. Click **Project settings** (bottom left)
3. Click **Issue types**
4. Click **Add issue type**
5. Add Risk, Risk Treatment, Risk Acceptance from the list
6. Remove any default types you won't use (Story, Epic, Bug, Task) — click the three dots next to each and select Remove

---

## Step 3 — Create Custom Fields

**Navigation:** Jira Settings → Work items → Fields → Create custom field

You will create each field here, then associate it with screens in Step 5.

Work through this list in order. For each field:
1. Click **Create custom field**
2. Select the field type listed
3. Enter the name and description
4. Click **Create** — do not associate with screens yet, that comes in Step 5

### Core Risk Fields

| # | Field name | Field type | Notes |
|---|---|---|---|
| 1 | Risk ID | Text field (single line) | Mark as read-only if possible |
| 2 | Risk Category | Select list (single choice) | Add options from §4 of JIRA-RISK-PROJECT-SETUP.md |
| 3 | Affected Asset | Text field (single line) | Free text |
| 4 | Threat Source | Select list (single choice) | Add options from §4 |
| 5 | Threat Event | Select list (single choice) | Add options from §4 |
| 6 | Asset Criticality | Select list (single choice) | Options: Critical, High, Medium, Low |
| 7 | Likelihood | Number field | Add description: "Score 1–5 using high water mark rule. See Risk Management Framework." |
| 8 | Impact | Number field | Add description: "Score 1–5. See impact scale in Risk Management Framework." |
| 9 | Inherent Score | Number field | Add description: "Likelihood × Impact. Range 1–25." |
| 10 | Risk Rating | Select list (single choice) | Options: Critical, Severe, High, Moderate, Low |
| 11 | Residual Score | Number field | Add description: "Score after control effectiveness applied." |
| 12 | Risk Appetite Status | Select list (single choice) | Options: Within Appetite, Approaches Appetite, Exceeds Appetite, Significantly Exceeds Appetite |
| 13 | Treatment | Select list (single choice) | Options: Mitigate, Avoid, Transfer, Accept / Monitor |
| 14 | Risk Owner | User picker (single user) | — |
| 15 | Response Decision Due | Date picker | Add description: "SLA deadline to select a treatment path. Set automatically based on Risk Rating." |
| 16 | Treatment Plan Due | Date picker | Add description: "SLA deadline to have a treatment plan approved and active." |
| 17 | Signal Source | Select list (single choice) | Add options from §4 |

### Enrichment Fields

| # | Field name | Field type | Notes |
|---|---|---|---|
| 18 | Mitigation Owner | User picker (single user) | — |
| 19 | Linked Controls | Text field (single line) | Example: UCF.06.01, UCF.07.01 |
| 20 | Acceptance Authority | Select list (single choice) | Options: Manager+, Senior Manager+, Director+, VP+, C-Suite / SVP+ |
| 21 | Acceptance Expiration Date | Date picker | Add description: "Required for all accepted risks. Date when acceptance must be re-approved." |
| 22 | Review Date | Date picker | — |
| 23 | Why It Matters | Text field (multi-line) | Add description: "2–4 sentences. Plain English. No jargon." |
| 24 | Linked Risk Record | URL field | Link to GRC dashboard record |

### Risk Treatment Fields

| # | Field name | Field type | Notes |
|---|---|---|---|
| 25 | Treatment Owner | User picker (single user) | The person doing the work — may differ from Risk Owner |
| 26 | Treatment Due Date | Date picker | When this specific treatment action must be complete |

---

## Step 4 — Create the Custom Link Type

**Navigation:** Jira Settings → Issues → Issue linking → Add

1. Go to **Jira Settings → Issues → Issue linking**
2. Click **Add**
3. Fill in:
   - **Name:** is mitigated by
   - **Inward description:** is mitigated by
   - **Outward description:** mitigates
4. Click **Save**

This link type connects Risk issues (parent) to Risk Treatment issues (child). Keep the direction consistent: Risk "is mitigated by" Risk Treatment. Never link it the other way.

---

## Step 5 — Create Screens

Screens control which fields appear when creating, editing, or transitioning an issue.

**Navigation:** Jira Settings → Issues → Screens → Add screen

### 5a — Create four screens

Create these screens (you will add fields to them next):

1. `RISK - Create Screen`
2. `RISK - Edit Screen`
3. `RISK - Transition Screen`
4. `RISK TREATMENT - Screen`

### 5b — Add fields to RISK - Create Screen

**Navigation:** Jira Settings → Issues → Screens → click RISK - Create Screen → Add field

Add these fields in this order:

**Section: Risk Identity**
- Summary *(Jira default — already there)*
- Risk Category
- Affected Asset
- Threat Source
- Threat Event
- Asset Criticality
- Signal Source
- Risk Owner

**Section: Scoring**
- Likelihood
- Impact
- Inherent Score
- Risk Rating

**Section: Treatment**
- Treatment
- Response Decision Due

**Section: Description**
- Why It Matters *(mark as optional)*

### 5c — Add fields to RISK - Edit Screen

Add all fields from the Create Screen, plus:
- Risk ID
- Residual Score
- Risk Appetite Status
- Treatment Plan Due
- Mitigation Owner
- Linked Controls
- Acceptance Authority
- Acceptance Expiration Date
- Review Date
- Linked Risk Record

### 5d — Add fields to RISK - Transition Screen

This is a lightweight screen used only during workflow transitions. Add:
- Acceptance Authority
- Acceptance Expiration Date
- Residual Score
- Review Date

### 5e — Add fields to RISK TREATMENT - Screen

- Summary *(Jira default)*
- Treatment Owner
- Treatment Due Date
- Description *(Jira default — use for progress notes)*

### 5f — Create a Screen Scheme

**Navigation:** Jira Settings → Issues → Screen schemes → Add screen scheme

1. Click **Add screen scheme**
2. Name: `RISK Screen Scheme`
3. Set Default Screen = `RISK - Edit Screen`
4. Click **Save**
5. Click **Associate an issue operation with a screen**
6. Map:
   - Create issue → `RISK - Create Screen`
   - Edit issue → `RISK - Edit Screen`
   - View issue → `RISK - Edit Screen`

### 5g — Associate Screen Scheme with the project

**Navigation:** Jira Settings → Issues → Issue type screen schemes → Add

1. Create an issue type screen scheme: `RISK Issue Type Screen Scheme`
2. Set Default = `RISK Screen Scheme`
3. Apply this scheme to your RISK project:
   - Go to **Project settings → Issue type screen schemes**
   - Select `RISK Issue Type Screen Scheme`

---

## Step 6 — Create the Workflow

**Navigation:** Jira Settings → Issues → Workflows → Add workflow

### 6a — Create a new workflow

1. Click **Add workflow**
2. Name: `RISK Workflow`
3. Description: `Docker Hull Security Risk Programme — ISO 27005/31000 aligned lifecycle`
4. Click **Add**

### 6b — Add statuses

In the workflow diagram editor, add these statuses. For each one, click **Add status** or drag from the panel:

| Status name | Category |
|---|---|
| Submitted | To Do |
| In Review | In Progress |
| Risk Assessment | In Progress |
| Mitigating | In Progress |
| Avoiding | In Progress |
| Transferring | In Progress |
| Accepting / Monitoring | In Progress |
| Pending Validation | In Progress |
| Done | Done |
| Reopened | To Do |

### 6c — Add transitions

Add these transitions between statuses:

| From | To | Transition name |
|---|---|---|
| Submitted | In Review | Start Review |
| In Review | Risk Assessment | Needs More Information |
| Risk Assessment | In Review | Return to Review |
| In Review | Mitigating | Approve — Mitigate |
| In Review | Avoiding | Approve — Avoid |
| In Review | Transferring | Approve — Transfer |
| In Review | Accepting / Monitoring | Accept Risk |
| Risk Assessment | Accepting / Monitoring | Accept Risk |
| Mitigating | Pending Validation | Mark Treatment Complete |
| Avoiding | Pending Validation | Mark Treatment Complete |
| Transferring | Pending Validation | Mark Treatment Complete |
| Pending Validation | Done | Validate and Close |
| Pending Validation | Mitigating | Return to Treatment |
| Done | Reopened | Reopen |
| Accepting / Monitoring | Reopened | Reopen |
| Reopened | In Review | Start Review |

### 6d — Add transition conditions and validators

For the following transitions, add validators to block the transition if required fields are empty:

**Start Review (Submitted → In Review)**
Add validator: Field Required
- Likelihood must not be empty
- Impact must not be empty
- Affected Asset must not be empty
- Risk Owner must not be empty

**Approve — Mitigate (In Review → Mitigating)**
Add validator: Field Required
- Treatment must not be empty
- Response Decision Due must not be empty

**Mark Treatment Complete (Mitigating → Pending Validation)**
Add validator: Comment Required
- User must enter a comment describing what was completed

**Validate and Close (Pending Validation → Done)**
Add validator: Field Required
- Residual Score must not be empty
Add validator: Comment Required
- Security GRC must record evidence location

**Accept Risk (any → Accepting / Monitoring)**
Add validator: Field Required
- Acceptance Authority must not be empty
- Acceptance Expiration Date must not be empty
Add validator: Comment Required
- User must record approver name and date in a comment

### 6e — Associate workflow with the project

**Navigation:** Project settings → Workflows

1. Go to your RISK project → **Project settings → Workflows**
2. Click **Switch Scheme**
3. Create a new workflow scheme: `RISK Workflow Scheme`
4. Map `Risk` issue type → `RISK Workflow`
5. Click **Publish**

---

## Step 7 — Configure Required Fields

**Navigation:** Project settings → Fields (or use workflow validators from Step 6d)

Jira enforces required fields either through workflow validators (Step 6d) or through field configuration schemes. The workflow validator approach from Step 6d is more flexible — it only enforces requirements at the point of transition, not on every save.

For fields that should always be populated (not just at transition), use a field configuration:

**Navigation:** Jira Settings → Issues → Field configurations → Add field configuration

1. Create: `RISK Field Configuration`
2. Find each field listed as Required in `JIRA-RISK-PROJECT-SETUP.md` §7
3. Click **Required** next to each field
4. Associate this configuration with your project via a Field Configuration Scheme

---

## Step 8 — Create Saved JQL Filters

**Navigation:** Jira top nav → Filters → Create filter (or use the search bar)

For each filter:
1. Go to **Issues → Search for issues**
2. Switch to **Advanced** (JQL) view
3. Paste the JQL from `JIRA-RISK-PROJECT-SETUP.md` §8
4. Click **Save as** and name it as listed below
5. Set permissions: share with your project or Security GRC team

### Filter names and JQL

**Filter 1: RISK — Exceeds Appetite**
```jql
project = RISK AND "Risk Appetite Status" in ("Exceeds Appetite", "Significantly Exceeds Appetite") AND status not in (Done) ORDER BY "Risk Rating" DESC
```

**Filter 2: RISK — Response Decision SLA Breach**
```jql
project = RISK AND "Response Decision Due" < now() AND status not in (Done, "Mitigating", "Avoiding", "Transferring", "Accepting / Monitoring") ORDER BY "Response Decision Due" ASC
```

**Filter 3: RISK — Treatment Plan SLA Breach**
```jql
project = RISK AND "Treatment Plan Due" < now() AND status = Mitigating ORDER BY "Treatment Plan Due" ASC
```

**Filter 4: RISK — Open Critical and Severe**
```jql
project = RISK AND "Risk Rating" in (Critical, Severe) AND status not in (Done) ORDER BY "Risk Rating" DESC, created ASC
```

**Filter 5: RISK — Accepted Risks Register**
```jql
project = RISK AND status = "Accepting / Monitoring" ORDER BY "Risk Rating" DESC
```

**Filter 6: RISK — Treatment Velocity**
```jql
project = RISK AND status = Mitigating AND assignee is not EMPTY ORDER BY "Treatment Plan Due" ASC
```

**Filter 7: RISK — Due for Review This Month**
```jql
project = RISK AND "Review Date" >= startOfMonth() AND "Review Date" <= endOfMonth() ORDER BY "Risk Rating" DESC
```

**Filter 8: RISK — New This Quarter**
```jql
project = RISK AND created >= startOfQuarter() ORDER BY created DESC
```

**Filter 9: RISK — Expired Acceptances**
```jql
project = RISK AND status = "Accepting / Monitoring" AND "Acceptance Expiration Date" < now() ORDER BY "Risk Rating" DESC
```

**Filter 10: RISK — No Treatment Owner**
```jql
project = RISK AND "Mitigation Owner" is EMPTY AND status not in (Done, "Accepting / Monitoring") ORDER BY "Risk Rating" DESC
```

**Filter 11: RISK — Treatment Actions by Due Date**
```jql
project = RISK AND issuetype = "Risk Treatment" AND statusCategory != Done ORDER BY "Treatment Due Date" ASC
```

**Filter 12: RISK — By Threat Source**
```jql
project = RISK AND issuetype = Risk AND "Threat Source" is not EMPTY AND statusCategory != Done ORDER BY "Threat Source" ASC, "Risk Rating" DESC
```

---

## Step 9 — Build the Dashboard

**Navigation:** Jira top nav → Dashboards → Create dashboard

### 9a — Create the dashboard

1. Click **Dashboards → Create dashboard**
2. Name: `Security Risk — Leadership View`
3. Sharing: Security GRC team + relevant leadership
4. Click **Create**

### 9b — Add gadgets

Click **Add gadget** for each section below. The most useful gadgets for risk reporting are:

- **Filter Results** — displays issues matching a saved filter as a table
- **Pie Chart** — distribution by field value (Risk Rating, Risk Category, Threat Source)
- **Two-Dimensional Filter Statistics** — cross-tab of two fields (e.g. Risk Owner vs Risk Rating)
- **Created vs Resolved Chart** — intake and closure velocity over time

### Section 1 — Executive Risk Overview (top of dashboard)

| Gadget | Filter / Field | What it shows |
|---|---|---|
| Filter Results | Filter 4 (Open Critical and Severe) | The risks leadership needs to know about |
| Filter Results | Filter 1 (Exceeds Appetite) | Risks outside tolerance |
| Filter Results | Filter 2 (Response Decision SLA Breach) | Governance failures requiring escalation |
| Filter Results | Filter 9 (Expired Acceptances) | Accepted risks that need re-approval |

### Section 2 — Risk Movement

| Gadget | Filter / Field | What it shows |
|---|---|---|
| Created vs Resolved Chart | RISK project, issuetype = Risk | Intake vs closure velocity over time |
| Filter Results | Filter 8 (New This Quarter) | New risks this quarter |
| Filter Results | Filter 3 (Treatment Plan SLA Breach) | Treatments running over SLA |

### Section 3 — Threat View

| Gadget | Filter / Field | What it shows |
|---|---|---|
| Pie Chart | Filter 12, grouped by Threat Source | Where risks are coming from |
| Pie Chart | All open risks, grouped by Threat Event | What adversary actions are driving the register |
| Pie Chart | All open risks, grouped by Risk Category | Risk by domain |

### Section 4 — Ownership View

| Gadget | Filter / Field | What it shows |
|---|---|---|
| Two-Dimensional Filter Statistics | Risk Owner vs Risk Rating | Who owns what severity |
| Filter Results | Filter 6 (Treatment Velocity) | Active mitigations with due dates |
| Filter Results | Filter 10 (No Treatment Owner) | Risks missing an owner |
| Filter Results | Filter 11 (Treatment Actions by Due Date) | All open treatment tickets |

### 9c — Arrange the layout

Set the dashboard to a two-column layout:
- Left column (wider): Filter Results tables
- Right column (narrower): Pie charts and distribution gadgets

Pin the Executive Risk Overview section at the top — it should be the first thing visible without scrolling.

---

## Step 10 — Configure Automation Rules

**Navigation:** Project settings → Automation → Create rule

For each rule:
1. Click **Create rule**
2. Set the **Trigger** as listed
3. Add **Conditions** if listed
4. Add the **Action**
5. Name the rule clearly and enable it

### Rule 1 — Set Response Decision Due on creation

**Trigger:** Issue created
**Condition:** Issue type = Risk AND Risk Rating is not empty
**Action:** Edit issue fields
- If Risk Rating = Critical: set Response Decision Due = {{now.plusDays(7)}}
- If Risk Rating = Severe: set Response Decision Due = {{now.plusDays(30)}}
- If Risk Rating = High: set Response Decision Due = {{now.plusDays(60)}}
- If Risk Rating = Moderate: set Response Decision Due = {{now.plusDays(90)}}
- If Risk Rating = Low: set Response Decision Due = {{now.plusDays(180)}}

> Implement as four separate rules (one per rating) or use a branch rule with conditions for each rating value.

### Rule 2 — SLA breach auto-acceptance

**Trigger:** Scheduled — daily at 09:00
**Condition:** JQL: `project = RISK AND "Response Decision Due" < now() AND status in (Submitted, "In Review", "Risk Assessment")`
**Action:**
1. Transition issue to Accepting / Monitoring
2. Add comment: "Response Decision SLA breached. This risk has been deemed accepted by default per the Risk Management Framework §6 Step 3. Risk Owner and manager notified. Acceptance Expiration Date set to 90 days from today."
3. Edit issue: set Acceptance Expiration Date = {{now.plusDays(90)}}
4. Send email to Risk Owner and Risk Owner's manager

### Rule 3 — Treatment Plan SLA alert

**Trigger:** Scheduled — daily at 09:00
**Condition:** JQL: `project = RISK AND "Treatment Plan Due" < now() AND status = Mitigating`
**Action:**
1. Add comment: "Treatment Plan SLA has been reached. Notifying Mitigation Owner and Risk Owner."
2. Send email to Mitigation Owner and Risk Owner

### Rule 4 — Acceptance expiration re-review

**Trigger:** Scheduled — daily at 09:00
**Condition:** JQL: `project = RISK AND status = "Accepting / Monitoring" AND "Acceptance Expiration Date" < now()`
**Action:**
1. Transition issue to In Review
2. Add comment: "Acceptance Expiration Date has passed. Risk Owner must re-approve acceptance or select an active treatment path within the standard SLA for this Risk Rating."
3. Send email to Risk Owner and Security GRC lead

### Rule 5 — Block transition to Done if Residual Score is empty

**Trigger:** Transition — Pending Validation → Done
**Condition:** Residual Score is empty
**Action:** Block transition with message: "Residual Score must be updated before this risk can be closed. Update the score and try again."

### Rule 6 — Recalculate Risk Appetite Status when Residual Score changes

**Trigger:** Field value changed — Residual Score
**Action:** Edit issue fields
- If Residual Score <= 11: set Risk Appetite Status = Within Appetite
- If Residual Score >= 12 AND <= 19: set Risk Appetite Status = Approaches Appetite
- If Residual Score >= 20 AND <= 24: set Risk Appetite Status = Exceeds Appetite
- If Residual Score = 25: set Risk Appetite Status = Significantly Exceeds Appetite

### Rule 7 — Notify Security GRC on Pending Validation

**Trigger:** Transition to Pending Validation
**Action:** Send email to Security GRC lead: "A risk has been marked treatment complete and is awaiting your validation before it can be closed. Issue: {{issue.key}} — {{issue.summary}}"

---

## Step 11 — Pilot and Refine

### Week 1–2 — Enter 5–10 real risks

Use the Risk Management Framework to score them. Enter them manually, one by one. Do not import from a spreadsheet for the first batch — entering manually surfaces any field that is confusing or missing.

For each risk:
1. Create a Risk issue using the Create Screen
2. Move it through to In Review
3. Make a treatment decision
4. Create at least one linked Risk Treatment ticket
5. Check that the dashboard filters pick it up correctly

### Week 3–4 — Run a mock monthly review

Run the monthly risk stand-up against the live dashboard. Check:
- Do the JQL filters return what you expect?
- Are any required fields routinely left empty?
- Are the automation rules firing correctly?
- Can leadership read the dashboard without explanation?

### Day 30 — Refinement session

After 30 days and at least 10 real risks entered, run a refinement session:
- Remove any fields that no one fills in
- Add fields that people ask for repeatedly
- Adjust dropdown values based on what's actually being selected
- Add the Control Gap issue type if needed

---

## MVP Build Order

If you need to be up and running today rather than fully configured, build in this order and stop when you have enough:

| Step | Time | What you get |
|---|---|---|
| 1. Create project | 5 min | Somewhere to put risks |
| 2. Add issue types | 10 min | Risk and Risk Treatment |
| 3. Add 10 core fields only | 30 min | Enough to score and own a risk |
| 4. Set up workflow (simplified: Open → In Progress → Done) | 20 min | Basic lifecycle |
| 5. Create Filters 1, 4, 5 only | 15 min | The three leadership views that matter most |
| 6. Build a one-section dashboard with Filter 4 | 10 min | One view of open critical/severe risks |
| 7. Enter your first 3 risks | 20 min | Proof the setup works |

Total MVP time: approximately 90 minutes. Add the full workflow, remaining fields, automation, and additional dashboard sections after the first risks are in and the process is validated.

---

## Related Documents

| Document | Purpose |
|---|---|
| `JIRA-RISK-PROJECT-SETUP.md` | Field values, dropdown options, full JQL library, metric definitions |
| `Risk-Management-Framework.md` | Scoring model, SLAs, approval authorities — governance source |
| `RISK-METHODOLOGY.md` | Inherent vs. residual calculation detail |
| `SMART-BREVITY-GRC.md` | Writing the Why It Matters field |
