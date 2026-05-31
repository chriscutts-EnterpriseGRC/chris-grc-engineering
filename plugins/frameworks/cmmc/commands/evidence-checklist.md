# CMMC 2.0 Evidence Checklist

Generates comprehensive evidence collection checklists for CMMC 2.0 practices, organized by Level (1-3) and maturity requirements with Department of Defense contractor-specific guidance.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/cmmc:evidence-checklist <practice-id> [--level <1|2|3>] [--export <format>]
```

## Arguments

- `<practice-id>`: CMMC practice (e.g., "AC.L2-3.1.1", "AU.L2-3.3.1") or domain (e.g., "Access Control", "Audit and Accountability")
- `--level`: Filter by CMMC Level (1, 2, or 3). Default: all applicable
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Level 2 Access Control Evidence

```bash
/cmmc:evidence-checklist AC.L2-3.1.1 --level 2
```

**Output:**

```markdown
CMMC 2.0 Evidence Checklist
Practice: AC.L2-3.1.1 - Limit system access to authorized users
CMMC Level: 2 (Advanced)
Domain: Access Control (AC)
NIST SP 800-171: 3.1.1

## Practice Description

Limit information system access to authorized users, processes acting on behalf of authorized users, or devices (including other information systems).

## CMMC Level 2 Maturity Requirements

Level 2 requires:
✓ **Documented policies** - Access control policy exists and is approved
✓ **Implemented practices** - Technical controls are in place
✓ **Managed implementation** - Controls are monitored and maintained
✓ **Reviewed and updated** - Annual policy review, quarterly access reviews

## Evidence Requirements

### Required Documentation (Policy Layer)

□ **Access Control Policy**
  - Scope: All systems processing CUI (Controlled Unclassified Information)
  - Required elements:
    - Authorized user definition
    - Access approval process
    - Privileged access management
    - Access review procedures (quarterly minimum)
    - Remote access requirements
  - Update frequency: Annually or when requirements change
  - Approver: Authorizing Official (AO) or senior management
  - Evidence: Signed policy document v1.x
  - Storage: Document control system with version history

□ **Access Control Procedures (SOP)**
  - Step-by-step user provisioning procedures
  - Step-by-step user de-provisioning procedures
  - Privileged access request and approval workflow
  - Emergency access procedures
  - Include screenshots or workflow diagrams
  - Evidence: SOP document + workflow diagrams

□ **System Security Plan (SSP) Section**
  - AC.L2-3.1.1 implementation description
  - Technical architecture diagram showing access controls
  - List of authorized users and roles
  - Integration with authentication systems
  - Evidence: SSP section 3.1.1 + architecture diagrams

### Automated Evidence Collection

✓ **User Access Inventory (Monthly)**
```bash
# AWS IAM Users accessing CUI systems
aws iam list-users --output json > evidence/cmmc-ac-3.1.1-iam-users-$(date +%Y%m).json

# Filter for users with access to CUI S3 buckets
aws iam list-users | jq -r '.Users[].UserName' | while read user; do
  aws iam list-attached-user-policies --user-name "$user"
  aws iam list-user-policies --user-name "$user"
done > evidence/cmmc-ac-3.1.1-user-permissions-$(date +%Y%m).json

# Azure AD users with access to CUI resources
az ad user list --output json > evidence/cmmc-ac-3.1.1-azure-users-$(date +%Y%m).json

# GCP IAM bindings for CUI projects
gcloud projects get-iam-policy <CUI-PROJECT-ID> --format=json \
  > evidence/cmmc-ac-3.1.1-gcp-iam-$(date +%Y%m).json
```

Collection Frequency: Monthly snapshot
Retention: 3 years (DFARS requirement)
Purpose: Demonstrates authorized user inventory

✓ **Privileged Access Inventory (Weekly)**

```bash
# AWS Administrator accounts
aws iam list-users | jq '.Users[] | select(.Tags[]? | select(.Key == "PrivilegedAccess" and .Value == "true"))' \
  > evidence/cmmc-ac-3.1.1-privileged-$(date +%Y%m%d).json

# List users with AdministratorAccess policy
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  policies=$(aws iam list-attached-user-policies --user-name "$user" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$user has AdministratorAccess"
  fi
done > evidence/cmmc-ac-3.1.1-admin-users-$(date +%Y%m%d).txt

# Azure Global Administrators
az ad directory role member list --role "Global Administrator" --output json \
  > evidence/cmmc-ac-3.1.1-azure-admins-$(date +%Y%m%d).json
```

Collection Frequency: Weekly snapshot
Retention: 3 years
Purpose: Tracks privileged access for CUI systems

✓ **Access Grant/Revocation Logs (Monthly)**

```bash
# AWS CloudTrail IAM events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/cmmc-ac-3.1.1-user-creation-$(date +%Y%m).json

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/cmmc-ac-3.1.1-user-deletion-$(date +%Y%m).json

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AttachUserPolicy \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/cmmc-ac-3.1.1-permission-changes-$(date +%Y%m).json

# Azure AD Audit Logs
az monitor activity-log list \
  --caller 'Microsoft.Authorization' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cmmc-ac-3.1.1-azure-access-changes-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: 3 years
Purpose: Audit trail of access changes

✓ **Authentication Logs (Daily for CUI access)**

```bash
# AWS CloudTrail console logins (last 24 hours)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cmmc-ac-3.1.1-console-logins-$(date +%Y%m%d).json

# Failed authentication attempts (potential unauthorized access)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=ConsoleLogin \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --output json | jq '.Events[] | select(.CloudTrailEvent | fromjson | .errorCode != null)' \
  > evidence/cmmc-ac-3.1.1-failed-logins-$(date +%Y%m%d).json

# Azure Sign-in Logs
az monitor activity-log list \
  --caller 'Microsoft.Azure.ActiveDirectory' \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/cmmc-ac-3.1.1-azure-signins-$(date +%Y%m%d).json
```

Collection Frequency: Daily
Retention: 3 years
Purpose: Authentication audit trail for CUI access

### Manual Evidence Collection

□ **Access Request Approvals (Quarterly Sample)**

- Sample size: 25 access grants in last quarter (or 100% if <25)
- Required elements for each sample:
  - Original access request (ticket/email)
  - Business justification for access
  - Manager approval (signed/timestamped)
  - Security team approval (for privileged access)
  - Date access granted (within 5 days of approval)
  - Least privilege validation (appropriate role assigned)
- Evidence: Folder of 25 approval tickets with screenshots
- Frequency: Quarterly review
- Sampling method: Random selection using NIST SP 800-53A guidance

□ **Quarterly Access Reviews**

- Review all user access to CUI systems
- Required elements:
  - Complete user access list at review start date
  - Manager sign-off for each user's continued need for access
  - Identification of inappropriate access
  - Remediation of access issues within 30 days
  - Senior management sign-off on review completion
- Evidence:
  - Access review report (Q1, Q2, Q3, Q4 2024/2025)
  - Manager sign-off emails/forms
  - Remediation tickets for access issues
- Frequency: Quarterly (90-day maximum interval)
- **CRITICAL**: CMMC Level 2 requires 4 consecutive quarterly reviews

□ **Privileged Access Justifications**

- Document business need for all privileged accounts
- Required for: Administrators, root/sudo, service accounts with elevated privileges
- Required elements:
  - User name and role
  - Business justification for privileged access
  - Alternative controls (e.g., just-in-time access, MFA)
  - Annual re-certification
- Evidence: Privileged Access Register (spreadsheet or database)
- Frequency: Annual review, monthly updates

□ **Termination/Transfer Access Revocation**

- Sample size: All terminations/transfers in last quarter (or 25 if >25)
- Required elements:
  - HR termination/transfer notice
  - Access revoked within 24 hours (termination) or 5 days (transfer)
  - Confirmation from IT that all access removed
  - CloudTrail/Azure AD logs showing account disabled
- Evidence:
  - HR notices
  - IT revocation tickets
  - Access removal confirmation logs
- Frequency: Quarterly review

□ **Unauthorized Access Attempts Review**

- Review failed authentication logs monthly
- Document investigation of repeated failures (>5 attempts in 24 hours)
- Evidence:
  - Monthly failed login report
  - Investigation notes for anomalies
  - Remediation actions (account lockouts, security incidents)
- Frequency: Monthly

## CMMC Level 2 Assessment Objectives

The CMMC Certified Assessor (C3PAO) will verify:

### Documentation Review (Level 2 Process Maturity)

✓ Access Control Policy exists, is approved, and covers all required elements
✓ Procedures documented with screenshots/workflows
✓ SSP accurately describes AC.L2-3.1.1 implementation
✓ Policy reviewed annually (evidence of annual review)
✓ Quarterly access reviews documented (4 consecutive quarters minimum)

### Implementation Review (Technical Controls)

✓ Access controls are implemented on all CUI systems
✓ Authentication required for all access
✓ Unauthorized users cannot access CUI systems
✓ Service accounts properly secured
✓ Privileged access limited to authorized users only

### Interview Questions (Expect These)

- "Walk me through how a new employee gets access to CUI systems"
- "Show me evidence of your last quarterly access review"
- "How do you ensure contractors/third parties only access what they need?"
- "What happens when an employee is terminated?"
- "How do you track privileged access?"

### Artifact Inspection

✓ Assessor will select random samples (typically 10-25 items):

- Access request tickets
- Quarterly access review reports
- Termination access revocation tickets
✓ Assessor will log into systems and verify:
- Test unauthorized access (should be blocked)
- Review user lists match documented inventory
- Check privileged users match justifications

## Common CMMC Assessment Findings

### Critical (Level 2 Failure)

❌ No quarterly access reviews performed (show 4 consecutive quarters)
❌ Policy not documented or not approved by management
❌ Unauthorized users can access CUI systems
❌ No access approval process exists
❌ Privileged access not tracked or monitored

### Moderate (Gaps requiring remediation)

⚠️ Quarterly access reviews incomplete (missing manager sign-offs)
⚠️ Access granted without documented approval (samples failed)
⚠️ Privileged access not justified
⚠️ Evidence retention <3 years
⚠️ Policy not reviewed annually

### Minor (Best practice recommendations)

⚠️ Procedures lack screenshots/diagrams
⚠️ Access approval turnaround time >5 days
⚠️ Orphaned accounts exist (inactive >90 days)
⚠️ No automation for access reviews

## Remediation Guidance

### If No Quarterly Access Reviews

1. **Immediate (Week 1)**: Run first quarterly access review
   - Export all user access from all CUI systems
   - Send to managers for validation
   - Document process and obtain sign-offs

2. **Ongoing (Next 3 quarters)**: Establish quarterly schedule
   - Q1: March 31
   - Q2: June 30
   - Q3: September 30
   - Q4: December 31

3. **Automation (Month 4)**: Implement automated tools
   - AWS IAM Access Analyzer
   - Azure AD Access Reviews
   - Automated manager notification emails

**IMPORTANT**: Level 2 assessment requires proof of 4 consecutive quarterly reviews. Plan your assessment date accordingly.

### If Policy Missing or Incomplete

1. Use DOD template (available at cyber.mil)
2. Customize for your organization and CUI systems
3. Get senior management approval (Authorizing Official)
4. Distribute to all staff processing CUI
5. Include in annual security awareness training

## Cross-References

### Related CMMC Practices

- AC.L2-3.1.2 - Limit system access to types of transactions and functions
- AC.L2-3.1.20 - External connections to CUI systems
- AC.L2-3.1.22 - Control CUI in accordance with approved authorizations
- IA.L2-3.5.1 - Identify users and authenticate (or verify)
- IA.L2-3.5.2 - Multi-factor authentication (MFA)

### Maps to Other Frameworks

- **NIST SP 800-171**: 3.1.1 (direct mapping)
- **NIST 800-53**: AC-2, AC-3, AC-6 (Account/Access Management)
- **ISO 27001:2022**: A.5.15, A.5.16, A.5.18 (Access control)
- **SOC 2**: CC6.1 (Logical and physical access controls)
- **PCI-DSS v4**: 7.1 (Limit access to system components)
- **FedRAMP**: AC-2, AC-3 (same controls required)

## Cost Estimates

### Level 2 Implementation (from scratch)

- Policy/procedure development: 40 hours ($4,000)
- Technical implementation (AWS/Azure IAM): 80 hours ($8,000)
- First quarterly access review: 16 hours ($1,600)
- Ongoing quarterly reviews: 8 hours/quarter ($800/quarter)
- Annual policy review: 8 hours ($800/year)
- **Total Year 1**: ~$18k
- **Ongoing**: ~$4k/year

### Tools/Services

- Identity governance platform (optional): $5k-$20k/year
- C3PAO assessment (Level 2): $15k-$45k (one-time)
- Annual surveillance (if required): $5k-$15k/year

## Evidence Package Structure

```
evidence/
└── cmmc-ac-3.1.1/
    ├── policies/
    │   ├── access-control-policy-v1.2-signed.pdf
    │   ├── access-control-procedures-v1.1.docx
    │   └── ssp-section-3.1.1.pdf
    ├── automated/
    │   ├── 2024-Q1/
    │   │   ├── iam-users-202401.json
    │   │   ├── privileged-users-202401.json
    │   │   ├── access-grants-202401.json
    │   │   └── authentication-logs-202401/
    │   ├── 2024-Q2/
    │   ├── 2024-Q3/
    │   └── 2024-Q4/
    ├── quarterly-reviews/
    │   ├── Q1-2024-access-review.pdf
    │   ├── Q2-2024-access-review.pdf
    │   ├── Q3-2024-access-review.pdf
    │   └── Q4-2024-access-review.pdf (4 REQUIRED)
    ├── samples/
    │   ├── access-approvals-Q4-2024/
    │   │   ├── approval-001-john-doe.pdf
    │   │   ├── approval-002-jane-smith.pdf
    │   │   └── ... (25 samples)
    │   └── terminations-Q4-2024/
    │       ├── termination-001-exit-revocation.pdf
    │       └── ... (all terminations)
    └── README.md (evidence index with retention dates)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
CMMC 2.0 AC.L2-3.1.1 Evidence Collection
Automates monthly evidence collection for DOD contractors
"""
import boto3
import json
import os
from datetime import datetime, timedelta

class CMMCAccessControlEvidence:
    def __init__(self, cui_systems=None):
        """
        Initialize evidence collector
        :param cui_systems: List of AWS account IDs or resource tags containing CUI
        """
        self.cui_systems = cui_systems or []
        self.timestamp = datetime.now().strftime("%Y%m")
        self.output_dir = f"evidence/cmmc-ac-3.1.1/{datetime.now().year}-Q{(datetime.now().month-1)//3+1}"
        os.makedirs(self.output_dir, exist_ok=True)

    def collect_user_inventory(self):
        """Collect monthly user inventory for CUI systems"""
        iam = boto3.client('iam')

        # Get all IAM users
        users = iam.list_users()['Users']

        # Filter users with CUI access (based on tags or policies)
        cui_users = []
        for user in users:
            username = user['UserName']

            # Check user tags for CUI access
            tags = iam.list_user_tags(UserName=username).get('Tags', [])
            if any(tag['Key'] == 'CUI-Access' and tag['Value'] == 'true' for tag in tags):
                cui_users.append({
                    'username': username,
                    'created': user['CreateDate'].isoformat(),
                    'arn': user['Arn'],
                    'tags': tags
                })

        # Save evidence
        output_file = f"{self.output_dir}/cui-user-inventory-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(cui_users, f, indent=2)

        print(f"✓ Collected {len(cui_users)} CUI users -> {output_file}")
        return cui_users

    def collect_access_changes(self):
        """Collect access grant/revocation logs (last 30 days)"""
        cloudtrail = boto3.client('cloudtrail')

        end_time = datetime.now()
        start_time = end_time - timedelta(days=30)

        # Events to track
        events = ['CreateUser', 'DeleteUser', 'AttachUserPolicy',
                  'DetachUserPolicy', 'PutUserPolicy', 'DeleteUserPolicy']

        all_events = []
        for event_name in events:
            response = cloudtrail.lookup_events(
                LookupAttributes=[{
                    'AttributeKey': 'EventName',
                    'AttributeValue': event_name
                }],
                StartTime=start_time,
                EndTime=end_time,
                MaxResults=1000
            )
            all_events.extend(response.get('Events', []))

        # Save evidence
        output_file = f"{self.output_dir}/access-changes-{self.timestamp}.json"
        with open(output_file, 'w') as f:
            json.dump(all_events, f, indent=2, default=str)

        print(f"✓ Collected {len(all_events)} access change events -> {output_file}")
        return len(all_events)

    def generate_quarterly_review_template(self, cui_users):
        """Generate template for quarterly access review"""
        review_quarter = f"{datetime.now().year}-Q{(datetime.now().month-1)//3+1}"

        template = f"""
CMMC 2.0 Quarterly Access Review
Review Period: {review_quarter}
Review Date: {datetime.now().strftime("%Y-%m-%d")}
Reviewer: [Name/Title]

INSTRUCTIONS FOR MANAGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Review each user listed below and certify:
1. User still requires access to CUI systems
2. Access level is appropriate (least privilege)
3. User has completed required CUI training

For each user, mark:
  ✓ = Access approved (continue)
  ✗ = Access should be revoked
  ↓ = Access should be reduced

USERS REQUIRING REVIEW ({len(cui_users)} total)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"""
        for idx, user in enumerate(cui_users, 1):
            template += f"""
{idx}. {user['username']}
   Created: {user['created']}
   CUI Access: {', '.join(tag['Value'] for tag in user.get('tags', []) if 'CUI' in tag['Key'])}

   Manager Decision: [ ] ✓ Approve  [ ] ✗ Revoke  [ ] ↓ Reduce
   Manager Name: _________________ Date: ___/___/___

"""

        template += """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY
Total Users Reviewed: ______
Approved: ______
Revoked: ______
Reduced: ______

Senior Management Approval:

Name: _________________________ Title: _________________

Signature: _____________________ Date: ___/___/___

Actions Required:
□ Revoke access for users marked ✗ (within 30 days)
□ Reduce access for users marked ↓ (within 30 days)
□ File this review in evidence folder (retain 3 years)
"""

        output_file = f"{self.output_dir}/quarterly-review-template-{review_quarter}.txt"
        with open(output_file, 'w') as f:
            f.write(template)

        print(f"✓ Generated quarterly review template -> {output_file}")
        print(f"  ACTION REQUIRED: Distribute to managers for completion")
        return output_file

if __name__ == "__main__":
    print("CMMC 2.0 AC.L2-3.1.1 Evidence Collection")
    print("=" * 60)

    collector = CMMCAccessControlEvidence()

    # Monthly evidence collection
    cui_users = collector.collect_user_inventory()
    collector.collect_access_changes()

    # Quarterly review template (generate at end of each quarter)
    current_month = datetime.now().month
    if current_month in [3, 6, 9, 12]:  # End of quarter
        collector.generate_quarterly_review_template(cui_users)
        print("\n⚠️  QUARTERLY REVIEW DUE - Complete within 15 days")

    print(f"\n✓ Evidence collection complete")
    print(f"  Evidence stored in: {collector.output_dir}/")
    print(f"  Retention: 3 years minimum (DFARS requirement)")
```

## Quick Reference Table

| Evidence Type | Collection | Frequency | Retention | CMMC Requirement |
|--------------|------------|-----------|-----------|------------------|
| User inventory | Automated | Monthly | 3 years | Level 2 |
| Privileged accounts | Automated | Weekly | 3 years | Level 2 |
| Access changes | Automated | Monthly | 3 years | Level 2 |
| Authentication logs | Automated | Daily | 3 years | Level 2 |
| **Quarterly access reviews** | **Manual** | **Quarterly** | **3 years** | **Level 2 CRITICAL** |
| Access approvals (sample) | Manual | Quarterly | 3 years | Level 2 |
| Termination evidence | Manual | Quarterly | 3 years | Level 2 |
| Policy/procedures | Manual | Annual review | 3 years | Level 2 |

---

**CMMC Level**: Level 2 (Advanced)
**Assessment Priority**: 🔴 CRITICAL (Foundational practice)
**Typical Assessment Duration**: 2-4 hours
**Estimated Implementation Time**: 6-12 weeks (including 4 quarterly reviews)
**C3PAO Focus Area**: HIGH (always tested in detail)

**NOTE**: To achieve CMMC Level 2 certification, you must demonstrate **4 consecutive quarterly access reviews**. Plan your assessment timeline accordingly.
