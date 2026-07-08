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

### Rule 8 — Block transition to Mitigating if Treatment Plan Due is empty

**Trigger:** Transition — In Review → Mitigating
**Condition:** Treatment Plan Due is empty
**Action:** Block transition with message: "Treatment Plan Due date is required before moving to Mitigating. Set a target date and try again."

> This enforces the rule that every active treatment must have a committed deadline. Without it, risks sit in Mitigating indefinitely with no accountability.

---

### Rule 9 — Owner review reminder on Review Date

**Trigger:** Scheduled — daily at 09:00
**Condition:** JQL: `project = RISK AND "Review Date" = now() AND status in ("Accepting / Monitoring", Monitoring)`
**Action:**
1. Add comment: "This risk is due for scheduled owner review. Please update the Residual Score, confirm the treatment status, and set the next Review Date."
2. Send email to Risk Owner

---

### Rule 10 — Extension Count escalation: auto-create Risk Acceptance at count 2

This rule fires when a Risk Treatment ticket has had its due date pushed twice without completion, forcing a formal acceptance rather than allowing silent extensions to continue.

**Trigger:** Field value changed — Extension Count
**Condition:** Issue type = Risk Treatment AND Extension Count >= 2
**Action (multi-step):**

1. **Add comment to the Risk Treatment ticket:**
   > "This treatment has been extended twice without completion. A formal Risk Acceptance is required. A Risk Acceptance ticket has been created on the parent Risk and assigned to the Risk Owner for approval."

2. **Create linked issue** (use the "Create issue" action):
   - Issue type: Risk Acceptance
   - Project: RISK
   - Summary: `[Auto] Acceptance required — {{issue.linkedIssues("is blocked by").first.summary}}`
   - Link type: relates to → parent Risk issue
   - Acceptance Authority: copy value from parent Risk issue's Risk Rating field (map Critical → C-Suite, Severe → VP+, High → Director+)
   - Acceptance Expiration Date: `{{now.plusDays(90)}}`
   - Why It Matters: `Auto-generated: Treatment for this risk has been extended {{issue.customfield_Extension_Count}} times. Formal acceptance required per Risk Management Framework §7.`

3. **Send email** to Risk Owner and Security GRC lead:
   > "A Risk Acceptance ticket has been automatically created for [Risk key] because the linked treatment has been extended twice without completion. Please review and approve or escalate within 14 days."

> **Important:** Set Extension Count as a read-only field for risk owners — only automation should increment it. If risk owners can edit it manually, the governance signal is lost. Enforce this via Jira field permission: set Extension Count to editable by Jira Automation only, view-only for all other roles.

---

### Rule 11 — Require Extension Rationale when due date is extended

**Trigger:** Field value changed — Treatment Plan Due
**Condition:** Issue type = Risk Treatment AND Extension Count > 0 (i.e. the date has already been set once)
**Action:**
1. Check if Extension Rationale field is empty
2. If empty: add error comment: "Extension Rationale is required when extending a treatment due date. Please document the reason for the extension and save again."
3. Increment Extension Count by 1: edit issue → Extension Count = `{{issue.customfield_Extension_Count + 1}}`

> Jira Automation cannot natively block a field save the way it can block a status transition. The practical enforcement is: (a) make Extension Rationale a required field on the Risk Treatment Edit Screen (enforced at the screen level), and (b) use this rule to auto-increment the count and flag the ticket if the rationale is missing post-save.

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

## Migrating from an Existing Notion Risk Register

If your team already tracks risks in Notion, use that data to seed Jira rather than starting from scratch. The Notion export is the gating dependency — get it before finalising your Jira field configuration. What Notion is actually tracking may differ from what we designed, and the design should follow the data, not the other way around.

### Step A — Export the Notion register

1. Open the Notion risk register database
2. Click the **...** menu in the top right of the database view
3. Select **Export → CSV**
4. Choose **Everything** (not current view) — you want all records including closed and archived risks
5. Download and open in a spreadsheet tool

> Ask your team for the full database export, not a filtered view. A filtered view only gives you open risks — you lose historical context and closed records that may inform scoring decisions.

### Step B — Audit the Notion fields before touching Jira

Open the CSV and answer these questions before finalising your Jira custom fields:

| Question | Why it matters |
|---|---|
| What columns exist? | Maps to your Jira field list — may add or remove fields |
| Which columns are consistently filled in? | Empty Notion columns won't get filled in Jira — mark those as optional |
| Are risks scored (likelihood/impact) or just described? | Determines whether you can import scores or need to re-score |
| Is there an owner field? | Confirms whether you have accountability data or need to assign from scratch |
| Is there a status field with values? | Map these to your Jira workflow states before import |
| Are there columns with no Jira equivalent? | Add them if they're consistently used; drop them if they're mostly empty |

**Do not create your Jira custom fields (Step 3) until this audit is complete.** The Notion export is ground truth.

### Step C — Map Notion columns to Jira fields

Create a mapping table. Example:

| Notion column | Jira field | Action needed |
|---|---|---|
| Risk Name | Summary | Direct map |
| Category | Risk Category | Standardise values to match dropdown |
| Owner | Risk Owner | Must be a Jira user — confirm accounts exist |
| Likelihood | Likelihood | Check scale — Notion may use High/Med/Low rather than 1–5 |
| Impact | Impact | Same as above |
| Risk Score | Inherent Score | Recalculate if Notion scoring differs from L×I |
| Status | Workflow status | Map to: Submitted, In Review, Mitigating, Accepting / Monitoring, Done |
| Treatment Notes | Description | Move to linked Risk Treatment ticket after import |
| Date Identified | Created (set on import) | Use Jira's created date or map to a custom field |
| Review Date | Review Date | Direct map |

For any Notion column with no clear Jira equivalent, decide: is it consistently used? If yes, add a custom field. If mostly empty, drop it.

### Step D — Clean the CSV before importing

Notion exports are messy. Clean the data in your spreadsheet before importing:

1. **Standardise Risk Rating values** to exactly match your Jira dropdown options:
   - Map any "High Risk", "H", "HIGH" → `High`
   - Map any "Medium", "Med", "M" → `Moderate`
   - Map any "Critical Risk" → `Critical`

2. **Standardise Status values** to your workflow states:
   - Map "Open", "Active", "New" → `Submitted` or `In Review`
   - Map "In Progress", "Remediating" → `Mitigating`
   - Map "Accepted", "Risk Accepted" → `Accepting / Monitoring`
   - Map "Closed", "Resolved", "Complete" → `Done`

3. **Assign Risk IDs** to any record missing one:
   - Format: `HULL-{YYYY}-{####}` (e.g. `HULL-2026-0048`)
   - Start numbering after your highest existing ID

4. **Remove** duplicate records and risks you do not want carried forward

5. **Flag records for re-scoring** if Notion used a different scale (e.g. High/Medium/Low) rather than 1–5 numerics — these will need manual scoring in Jira after import

6. **Split treatment notes** into a separate sheet — they become Risk Treatment tickets after import, not field values on the Risk issue

### Step E — Test import with 5 records

**Navigation:** Jira Settings → System → External System Import → CSV

1. Go to **Jira Settings → System → Import and Export → Import issues from CSV**
2. Upload your cleaned CSV
3. On the field mapping screen, map each CSV column to the corresponding Jira field
4. Set for all rows:
   - Project = RISK
   - Issue type = Risk
5. **Run a test import with 5 records only** — do not import the full register yet
6. Open each imported issue and verify:
   - Fields populated correctly
   - Risk Rating matches the record
   - Owner is assigned to the right Jira user
   - Status landed in the correct workflow state

Fix any mapping errors before running the full import.

### Step F — Full import

Once the 5-record test passes:
1. Re-run the import with the full cleaned CSV
2. Verify record count matches: Notion export rows = Jira issues created
3. Check for any import errors in the Jira import log

### Step G — Create Risk Treatment tickets

The Notion register likely stores treatment notes as a text field on the risk record. After import, convert active treatment notes into linked Risk Treatment tickets:

1. Filter for all risks in Mitigating status: `project = RISK AND status = Mitigating`
2. For each risk, read the treatment notes from the Description field
3. Create one Risk Treatment ticket per discrete treatment action
4. Link each treatment to its parent risk: Risk **"is mitigated by"** Risk Treatment
5. Assign Treatment Owner and Treatment Due Date to each ticket
6. Clear the treatment notes from the Risk Description once the tickets are created

### Step H — Build filters and dashboard

Only after the import is complete and treatment tickets are created, proceed to Steps 7 and 8 of the main build guide (JQL filters and dashboard). Building the dashboard with live data confirms the filters return what you expect.

### Full migration sequence

```
Get Notion CSV export
  → Audit fields against JIRA-RISK-PROJECT-SETUP.md
  → Update Jira field list if needed
  → Build Jira project (Steps 1–6 of this guide)
  → Clean Notion CSV
  → Test import (5 records)
  → Full import
  → Create Risk Treatment tickets from treatment notes
  → Build filters and dashboard (Steps 7–8)
  → Add automation rules (Step 9)
  → Run refinement at day 30 (Step 11)
```

### What to expect from the Notion data

Most Notion risk registers have these characteristics — plan for them:

| Common Notion pattern | What to do |
|---|---|
| Risks described in prose, not scored numerically | Score each risk manually after import using the Risk Management Framework |
| Owners named as text rather than linked users | Confirm each name has a Jira account before import; fix manually if not |
| Status values inconsistent across records | Standardise in Step D — do not import inconsistent statuses |
| Treatment mixed into risk description | Step G — split into linked treatment tickets |
| Old closed risks with no useful data | Filter them out of the import; keep them in Notion as archive |
| Duplicate or near-duplicate risks | Merge before import — duplicates in Jira inflate metrics |

---

## Step 12 — Add Metrics Automation Rules

These rules generate the data behind leadership metrics. Add them after the core project is stable and at least 10 real risks are in the register. Each rule is labelled with the metric it feeds.

**Before configuring these rules, add two fields to the Risk issue type:**

| Field name | Jira field type | Purpose |
|---|---|---|
| Scored Date | Date picker | Stamped automatically when Residual Score is first populated. Used to calculate time-to-score. |
| Score History | Paragraph (text area) | Appended automatically each time Residual Score changes. Creates an audit trail and trend data. |

---

### Rule 12 — Stamp Scored Date on first residual score entry

**Metric fed:** Time-to-score (risk identification speed)

**Trigger:** Field value changed — Residual Score
**Condition:** Issue type = Risk AND Scored Date is empty
**Action:** Edit issue → set Scored Date = `{{now}}`

> This fires only once — the Scored Date is never overwritten. The gap between Created and Scored Date is your time-to-score metric. JQL to report it: `project = RISK ORDER BY created DESC` — export and calculate the average in a spreadsheet until a Jira chart supports it natively.

---

### Rule 13 — Append score change to Score History

**Metric fed:** Portfolio residual score trend (90-day)

**Trigger:** Field value changed — Residual Score
**Condition:** Issue type = Risk
**Action:** Edit issue → append to Score History field:
```
{{now.format("yyyy-MM-dd")}} | Score changed to {{issue.Residual Score}} | Changed by {{issue.changelog.author.displayName}}
```

> Over time this field builds a dated log of every score movement. Export and chart it monthly to show leadership whether the portfolio is improving. A rising average residual score is the early warning signal that treatment velocity is falling behind risk intake.

---

### Rule 14 — Weekly SLA compliance digest

**Metric fed:** SLA Compliance Rate (% treatments on time)

**Trigger:** Scheduled — every Monday at 08:00
**Condition:** None (runs on a fixed JQL)
**Action:** Send email to Security GRC lead and CISO with:

**Subject:** `Weekly Risk SLA Digest — {{now.format("yyyy-MM-dd")}}`

**Body:**
```
Overdue Risk Treatments (Treatment Plan Due < today, status = Mitigating):
JQL: project = RISK AND issuetype = "Risk Treatment" AND "Treatment Plan Due" < now() AND status = Mitigating

Count by Risk Rating:
  Critical overdue: [manual lookup or scripted]
  Severe overdue:
  High overdue:

Risks approaching SLA breach (due in next 7 days):
JQL: project = RISK AND issuetype = "Risk Treatment" AND "Treatment Plan Due" <= now().plusDays(7) AND status = Mitigating
```

> Jira Automation does not natively count JQL results in email body text. Practical workaround: configure this rule to send the JQL strings and instruct the recipient to run them. For automated counts, use the Jira Dashboard gadget (Step 13 below) as the live view and treat this email as a weekly nudge.

---

### Rule 15 — Risk concentration alert

**Metric fed:** Risk owner load visibility (prevents blind spots)

**Trigger:** Issue created OR Risk Owner field changed
**Condition:** JQL check — `project = RISK AND "Risk Owner" = {{issue.Risk Owner}} AND status not in (Done) AND "Risk Rating" in (Critical, Severe)` returns count > 3
**Action:**
1. Add comment to the newly created or updated issue: "Risk Owner {{issue.Risk Owner}} now has more than 3 open Critical or Severe risks. Security GRC lead notified."
2. Send email to Security GRC lead: "Risk concentration alert: {{issue.Risk Owner}} has 4+ open Critical/Severe risks. Review for resource reallocation or treatment prioritisation."

> This is the single most underused governance check in most risk registers. One person quietly accumulating 6 critical risks is invisible until something breaks. This rule makes it visible automatically.

---

### Rule 16 — New risk spike detection

**Metric fed:** Risk intake velocity (signals emerging threat or post-incident surge)

**Trigger:** Issue created
**Condition:** Issue type = Risk. Jira does not natively count issues created in a rolling 24-hour window in automation conditions — implement as: Scheduled daily at 09:00 with JQL: `project = RISK AND issuetype = Risk AND created >= -1d`
**Action:** If count > 3, send email to CISO: "Risk spike detected: {{count}} new risks were logged in the last 24 hours. This may indicate an emerging threat, active incident, or audit finding. Review the register."

> Adjust the threshold based on your normal intake volume. In the first 30 days while the register is being populated, suppress this rule or set a higher threshold (>10) to avoid false positives.

---

### Rule 17 — Monthly acceptance expiry forecast

**Metric fed:** Acceptance pipeline (leadership prep for upcoming reviews)

**Trigger:** Scheduled — first working day of each month at 08:00
**Condition:** JQL: `project = RISK AND issuetype = "Risk Acceptance" AND "Acceptance Expiration Date" <= now().plusDays(30) AND status = "Accepting / Monitoring"`
**Action:** Send email to Risk Owners (of matching issues) and Security GRC lead:

**Subject:** `Risk Acceptance Expiry Forecast — {{now.format("MMMM yyyy")}}`

**Body:**
```
The following risk acceptances expire within the next 30 days.
Risk Owner action required: re-approve acceptance or initiate treatment.

[Jira link to filter: project = RISK AND issuetype = "Risk Acceptance" AND "Acceptance Expiration Date" <= now().plusDays(30)]
```

---

### Rule 18 — Weekly register health score

**Metric fed:** Data quality score (leadership metrics are only trustworthy if the register is complete)

**Trigger:** Scheduled — every Friday at 17:00
**Condition:** None
**Action:** Send email to Security GRC lead with the following JQL links to run:

```
Risks missing Residual Score:
project = RISK AND issuetype = Risk AND "Residual Score" is EMPTY AND status != Done

Risks missing Risk Owner:
project = RISK AND issuetype = Risk AND "Risk Owner" is EMPTY AND status != Done

Risks with overdue Review Date:
project = RISK AND issuetype = Risk AND "Review Date" < now() AND status != Done
```

**Health score formula (calculate manually from results):**
```
Complete records = Total open risks − (missing score + missing owner + overdue review)
Health score % = Complete records ÷ Total open risks × 100
```

Target: ≥ 85%. Below 80% — metrics reported to leadership should include a data quality caveat.

> At day 30, once the register is stable, build a Jira dashboard gadget (Step 13) that shows these counts live so the health score is visible without a weekly email.

---

## Step 13 — Team and Executive Dashboard Views

Build these dashboards after the core project is live and at least 10 risks are entered. Each team gets a three-metric view — the minimum number of numbers a leader needs to make a resource or prioritisation decision.

**Navigation:** Dashboards → Create dashboard (top nav)

For each dashboard:
1. Click **Dashboards → Create dashboard**
2. Name it: `Risk — [Team Name] View`
3. Set visibility: **Private** (share with named individuals once validated)
4. Add gadgets using the instructions below
5. Share with relevant team lead when ready

---

### Executive / CISO Dashboard

Three numbers. One trend. One action required.

**Gadget 1 — Portfolio Residual Score (Filter Results)**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = Risk AND status != Done ORDER BY "Residual Score" DESC`
- Columns: Summary · Risk Rating · Residual Score · Risk Appetite Status · Risk Owner
- Max results: 10
- Label: "Top open risks by residual score"

**Gadget 2 — SLA Breach Count (Issue Statistics)**
- Gadget type: Issue Statistics
- JQL: `project = RISK AND issuetype = "Risk Treatment" AND "Treatment Plan Due" < now() AND status = Mitigating`
- Statistic type: Count by Risk Rating
- Label: "Overdue treatments by rating"

**Gadget 3 — Risk Appetite Status Breakdown (Pie Chart)**
- Gadget type: Two Dimensional Filter Statistics
- JQL: `project = RISK AND issuetype = Risk AND status != Done`
- X-axis: Risk Appetite Status
- Y-axis: Count
- Label: "Portfolio by appetite status"

**Gadget 4 — Risks Exceeding Appetite (Filter Results)**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = Risk AND "Risk Appetite Status" in ("Exceeds Appetite", "Significantly Exceeds Appetite") AND status != Done ORDER BY "Residual Score" DESC`
- Columns: Summary · Risk Owner · Residual Score · Treatment Plan Due
- Label: "Action required — risks outside appetite"

---

### Security Engineering Dashboard

**Metric 1 — Open Critical/High treatments assigned to security team**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = "Risk Treatment" AND "Business Unit" = Security AND status = Mitigating ORDER BY "Treatment Plan Due" ASC`
- Columns: Summary · Residual Score · Treatment Plan Due · Extension Count

**Metric 2 — Detection gaps (Control Gap issues)**
- Gadget type: Issue Statistics
- JQL: `project = RISK AND issuetype = "Control Gap" AND status != Done`
- Statistic type: Count

**Metric 3 — SLA compliance for security-owned treatments**
- Gadget type: Two Dimensional Filter Statistics
- JQL: `project = RISK AND issuetype = "Risk Treatment" AND "Business Unit" = Security`
- X-axis: Status
- Y-axis: Count

---

### Engineering / Product Dashboard

**Metric 1 — Technology risks linked to product surface**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = Risk AND "Risk Category" = Technology AND status != Done ORDER BY "Residual Score" DESC`
- Columns: Summary · Inherent Score · Residual Score · Risk Appetite Status · Treatment Plan Due

**Metric 2 — Treatments overdue for engineering owners**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = "Risk Treatment" AND "Business Unit" = Engineering AND "Treatment Plan Due" < now() AND status = Mitigating`
- Columns: Summary · Extension Count · Treatment Plan Due · Risk Owner

**Metric 3 — Supply chain and third-party risks**
- Gadget type: Issue Statistics
- JQL: `project = RISK AND issuetype = Risk AND "Risk Category" in ("Third Party", Technology) AND "Threat Source" = "External attacker" AND status != Done`
- Statistic type: Count by Risk Rating

---

### Legal / Compliance Dashboard

**Metric 1 — Compliance risks by regulation**
- Gadget type: Two Dimensional Filter Statistics
- JQL: `project = RISK AND issuetype = Risk AND "Risk Category" = Compliance AND status != Done`
- X-axis: Risk Rating
- Y-axis: Count

**Metric 2 — Acceptances pending legal review**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = "Risk Acceptance" AND "Acceptance Authority" in ("C-Suite / SVP+", "VP+") AND status = "In Review"`
- Columns: Summary · Acceptance Authority · Acceptance Expiration Date · Risk Owner

**Metric 3 — Acceptances expiring in 30 days**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = "Risk Acceptance" AND "Acceptance Expiration Date" <= now().plusDays(30) AND status = "Accepting / Monitoring"`
- Columns: Summary · Acceptance Expiration Date · Risk Owner · Why It Matters

---

### HR Dashboard

**Metric 1 — Insider threat and operational risks**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = Risk AND "Threat Source" in ("Insider — malicious", "Insider — accidental") AND status != Done`
- Columns: Summary · Risk Rating · Residual Score · Risk Owner

**Metric 2 — HR-owned treatments**
- Gadget type: Issue Statistics
- JQL: `project = RISK AND issuetype = "Risk Treatment" AND "Business Unit" = HR AND status != Done`
- Statistic type: Count by status

**Metric 3 — Risks linked to people processes (joiner/mover/leaver)**
- Gadget type: Filter Results
- JQL: `project = RISK AND issuetype = Risk AND "Risk Category" = Operational AND text ~ "offboarding OR onboarding OR access revocation" AND status != Done`
- Columns: Summary · Residual Score · Risk Owner · Review Date

---

### Dashboard sharing sequence

Build dashboards in this order to avoid sharing half-built views:

1. Build all dashboards privately first
2. Validate each with a single test record
3. Share Executive dashboard with CISO for feedback
4. Incorporate feedback, then share team dashboards with respective leads
5. Set a 30-day review: "Are these the right three metrics for your decisions?"

The three-metric rule is intentional. If a team lead asks for a fourth metric, ask what decision it enables. If they can name the decision, add it. If not, it is a reporting metric, not a decision metric — keep it off the dashboard.

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
