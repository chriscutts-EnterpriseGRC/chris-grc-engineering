# StateRAMP Evidence Checklist

Generates comprehensive evidence collection checklists for StateRAMP (State Risk and Authorization Management Program) authorization with state-level compliance requirements.

> **Never commit evidence artifacts to source control.** The outputs below include real usernames, credential reports, MFA device states, and privileged-account inventories. `.gitignore` covers `evidence/` by default so `git add -A` will not sweep it up, but durable storage is your responsibility. Use an encrypted, access-controlled evidence locker (encrypted S3 with least-privilege IAM, a GRC platform, or a shared drive with full-disk encryption and MFA-gated access).

## Usage

```bash
/stateramp:evidence-checklist <control-family> [--baseline <moderate|high>] [--export <format>]
```

## Arguments

- `<control-family>`: NIST 800-53 control family (e.g., "AC", "AU", "SC") or specific control (e.g., "AC-2", "AU-2")
- `--baseline`: StateRAMP baseline (`moderate` or `high`). Default: `moderate`
- `--export`: Export format (`json`, `csv`, `markdown`). Default: `markdown`

## Example: Access Control Evidence (Moderate Baseline)

```bash
/stateramp:evidence-checklist AC-2 --baseline moderate
```

**Output:**

```markdown
StateRAMP Evidence Checklist
Control: AC-2 - Account Management
Baseline: StateRAMP Moderate (based on FedRAMP Moderate + state-specific requirements)
Assessment Type: Third-Party Assessment Organization (3PAO)
Authorization Validity: 3 years
ConMon Frequency: Continuous (monthly reporting)

## Control Requirements

AC-2 Account Management - The organization manages information system accounts, including establishing, activating, modifying, reviewing, disabling, and removing accounts.

### StateRAMP-Specific Requirements

In addition to standard FedRAMP requirements, StateRAMP requires:
- **State data residency**: Data must remain within US borders (some states require in-state residency)
- **State-specific incident reporting**: 24-hour notification to state CISO
- **Enhanced background checks**: Personnel with access to state data require background checks
- **State audit rights**: State agencies retain audit/inspection rights
- **Data return/destruction**: Specific procedures for state data return upon contract termination

## Evidence Requirements

### Required Documentation

□ **System Security Plan (SSP) Section 13.2 - AC-2**
  - Complete AC-2 implementation description
  - Account types supported (user, privileged, service, temporary, emergency)
  - Account establishment procedures
  - Account modification procedures
  - Account disabling/removal procedures (within 24 hours for terminations)
  - Account review procedures (at least quarterly)
  - State-specific requirements addressed:
    - Background check requirements for personnel
    - State data residency commitments
    - State incident notification procedures
  - Evidence: SSP Section 13.2 (AC-2)
  - Frequency: Annual update, or when implementation changes

□ **Account Management Policy**
  - Formal policy governing account lifecycle
  - Required elements:
    - Account approval process (includes state agency approval if applicable)
    - Least privilege enforcement
    - Quarterly access reviews
    - Automated account lifecycle where feasible
    - Emergency account procedures
  - Evidence: Account Management Policy v1.x (approved by Authorizing Official)
  - Frequency: Annual review

□ **Background Check Procedures**
  - Procedures for background checks on personnel with state data access
  - Required elements:
    - Types of background checks required (federal, state, financial)
    - Frequency (initial hire, every 5 years)
    - Documentation retention (per state requirements)
    - Handling of adverse findings
  - Evidence: Background Check Procedure document
  - Frequency: Annual review
  - **StateRAMP-Specific**: Required for state government cloud services

□ **Data Residency Attestation**
  - Written attestation that state data remains in US (or in-state if required)
  - Infrastructure architecture showing data storage locations
  - Evidence: Data residency attestation + architecture diagrams
  - Frequency: Annual attestation
  - **StateRAMP-Specific**: Critical for state government compliance

### Automated Evidence Collection

✓ **Account Inventory**
```bash
# AWS IAM users (cloud service provider perspective)
aws iam list-users --output json > evidence/stateramp-ac2-iam-users-$(date +%Y%m%d).json

# IAM credential report
aws iam generate-credential-report
aws iam get-credential-report --output text | base64 -d \
  > evidence/stateramp-ac2-credential-report-$(date +%Y%m%d).csv

# Filter for state government users (by tags or OU)
aws organizations list-accounts-for-parent --parent-id <STATE-OU-ID> \
  --output json > evidence/stateramp-ac2-state-accounts-$(date +%Y%m%d).json

# Azure AD users (if using Azure Government)
az ad user list --output json > evidence/stateramp-ac2-azure-users-$(date +%Y%m%d).json

# GCP users (if using GCP)
gcloud identity groups memberships list --group-email=state-users@agency.gov \
  --format=json > evidence/stateramp-ac2-gcp-users-$(date +%Y%m%d).json
```

Collection Frequency: Monthly (for ConMon reporting)
Retention: 7 years (state record retention requirements)
Purpose: Account inventory per AC-2(1)

✓ **Account Creation/Modification/Deletion Logs**

```bash
# AWS CloudTrail - Account lifecycle events (last 30 days)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/stateramp-ac2-user-creation-$(date +%Y%m).json

aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteUser \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --max-items 1000 \
  --output json > evidence/stateramp-ac2-user-deletion-$(date +%Y%m).json

for event in AttachUserPolicy DetachUserPolicy PutUserPolicy DeleteUserPolicy; do
  aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=$event \
    --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
    --max-items 1000 \
    --output json >> evidence/stateramp-ac2-policy-changes-$(date +%Y%m).json
done

# Azure AD audit logs
az monitor activity-log list \
  --caller 'Microsoft.Authorization' \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --output json > evidence/stateramp-ac2-azure-audit-$(date +%Y%m).json
```

Collection Frequency: Monthly
Retention: 7 years
Purpose: Account lifecycle audit trail per AC-2(4)

✓ **Privileged Account Inventory**

```bash
# AWS - Users with AdministratorAccess
for user in $(aws iam list-users --query 'Users[].UserName' --output text); do
  policies=$(aws iam list-attached-user-policies --user-name "$user" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$user,AdministratorAccess,$(date +%Y-%m-%d)" >> evidence/stateramp-ac2-privileged-users-$(date +%Y%m%d).csv
  fi
done

# IAM roles with admin privileges
aws iam list-roles | jq -r '.Roles[].RoleName' | while read role; do
  policies=$(aws iam list-attached-role-policies --role-name "$role" --query 'AttachedPolicies[?PolicyName==`AdministratorAccess`]')
  if [ "$policies" != "[]" ]; then
    echo "$role,AdministratorAccess,$(date +%Y-%m-%d)" >> evidence/stateramp-ac2-privileged-roles-$(date +%Y%m%d).csv
  fi
done
```

Collection Frequency: Weekly
Retention: 7 years
Purpose: Privileged account monitoring per AC-2(7)

✓ **Automated Account Disabling Evidence**

```bash
# Check for inactive accounts (no access in 90 days)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$4 == "true" {
    split($5,a,"T");
    if ((systime() - mktime(gensub(/[-:]/," ","g",a[1]" "substr(a[2],1,8)))) > 90*86400)
      print $1","$5",INACTIVE_90_DAYS"
  }' > evidence/stateramp-ac2-inactive-accounts-$(date +%Y%m%d).csv

# Check for unused IAM access keys (>90 days)
aws iam get-credential-report --output text | base64 -d | \
  awk -F',' '$10 == "true" && $12 == "N/A" {print $1",access_key_1,NEVER_USED"}' \
  >> evidence/stateramp-ac2-unused-keys-$(date +%Y%m%d).csv
```

Collection Frequency: Weekly
Retention: 7 years
Purpose: Inactive account detection per AC-2(3)

✓ **Data Residency Evidence**

```bash
# AWS - Verify all resources in US regions only
aws ec2 describe-regions --all-regions --output json | \
  jq '.Regions[] | select(.RegionName | startswith("us-"))' \
  > evidence/stateramp-ac2-us-regions-$(date +%Y%m%d).json

# S3 buckets location verification
aws s3api list-buckets --output json | jq -r '.Buckets[].Name' | while read bucket; do
  location=$(aws s3api get-bucket-location --bucket "$bucket" --output text)
  echo "$bucket,$location" >> evidence/stateramp-ac2-s3-locations-$(date +%Y%m%d).csv
done

# Filter for non-US buckets (should be none for state data)
cat evidence/stateramp-ac2-s3-locations-$(date +%Y%m%d).csv | \
  grep -v "us-" | grep -v "None" > evidence/stateramp-ac2-non-us-buckets-$(date +%Y%m%d).csv

# RDS instances location verification
aws rds describe-db-instances \
  --query 'DBInstances[].[DBInstanceIdentifier,AvailabilityZone]' \
  --output json > evidence/stateramp-ac2-rds-locations-$(date +%Y%m%d).json
```

Collection Frequency: Monthly
Retention: 7 years
Purpose: **StateRAMP-Specific** - Data residency requirement

### Manual Evidence Collection

□ **Quarterly Access Reviews**

- Review all accounts with access to state government data
- Required elements:
  - Complete account list at review start date
  - Manager certification of continued need
  - State agency POC sign-off (if applicable)
  - Identified inappropriate access
  - Remediation within 30 days
  - Authorizing Official sign-off
- Evidence: Quarterly access review reports (Q1-Q4)
- Frequency: Quarterly (every 90 days)
- **StateRAMP**: Required for ConMon reporting

□ **Background Check Records**

- Background check records for all personnel with state data access
- Required elements:
  - Name, date of background check
  - Type of check (federal, state, financial)
  - Result (pass/fail)
  - Next renewal date (every 5 years)
- Evidence: Background check register (sanitized - no detailed results)
- Frequency: Initial hire, every 5 years
- **StateRAMP-Specific**: Required for state government contracts

□ **State Agency Account Approvals**

- Approval from state agency POC before granting access to state data
- Required elements:
  - Account request (name, role, need)
  - State agency POC approval (email/ticket)
  - Cloud service provider approval
  - Access granted date
- Evidence: Sample of 25 account approvals from last quarter
- Frequency: Quarterly review

□ **Emergency Account Usage Logs**

- Log of all emergency/break-glass account usage
- Required elements:
  - Date/time of emergency access
  - Justification for emergency access
  - Actions taken during emergency access
  - Post-incident review
  - State agency notification (within 24 hours)
- Evidence: Emergency access log + state notifications
- Frequency: Ongoing (log all usage)
- **StateRAMP**: State must be notified of emergency access within 24 hours

□ **Data Return/Destruction Evidence**

- Procedures and evidence for returning/destroying state data upon contract termination
- Required elements:
  - Data return procedure
  - Secure deletion procedure (NIST 800-88)
  - Certificate of destruction
  - State agency acknowledgment
- Evidence: Data return/destruction procedure + certificates (if applicable)
- Frequency: Upon contract termination
- **StateRAMP-Specific**: State-specific data handling requirements

## StateRAMP Assessment Expectations

StateRAMP 3PAOs will verify:

### Documentation Review

✓ SSP Section 13.2 (AC-2) complete and accurate
✓ Account management policy comprehensive
✓ Background check procedures documented
✓ Data residency attestation provided
✓ State-specific requirements addressed

### Implementation Review

✓ Account lifecycle automated (provisioning, deprovisioning)
✓ Quarterly access reviews performed (4 consecutive quarters minimum)
✓ Privileged access limited and monitored
✓ Inactive accounts disabled (>90 days)
✓ State data resides only in US regions (or in-state if required)
✓ Background checks current for all personnel with state data access

### Testing Requirements

✓ Sample 25 account creations (test approval process)
✓ Sample 25 account deletions (test <24hr removal)
✓ Review 4 quarterly access review reports
✓ Verify data residency (all resources in US)
✓ Test emergency account procedures

### Continuous Monitoring (ConMon)

✓ Monthly POA&M updates
✓ Monthly vulnerability scan reports
✓ Quarterly access review reports
✓ Incident reports within 24 hours to state
✓ Annual assessment (or more frequent per state requirement)

## Common StateRAMP Assessment Findings

### Critical (Likely to delay ATO)

❌ No SSP or incomplete SSP
❌ State data found outside US regions
❌ No background checks for personnel with state data access
❌ No quarterly access reviews
❌ Inactive accounts not disabled (>90 days)
❌ No state incident notification procedures

### Moderate (Corrective Action Plan required)

⚠️ Access reviews performed but missing state agency sign-off
⚠️ Background checks >5 years old
⚠️ Account approvals missing state agency POC approval
⚠️ Data residency attestation not current (>1 year old)
⚠️ ConMon reporting incomplete or late

### Minor (Observations)

⚠️ SSP could be more detailed
⚠️ Emergency account procedures not tested
⚠️ Some documentation >12 months old

## Remediation Guidance

### If State Data Outside US Regions

1. **Immediate**: Identify all resources with state data outside US
2. **Week 1**: Plan migration to US regions
3. **Weeks 2-4**: Migrate data to US regions (backup first)
4. **Week 5**: Verify no state data remains outside US
5. **Week 6**: Provide updated data residency attestation

**Timeline**: 4-6 weeks
**Priority**: 🔴 CRITICAL (mandatory for StateRAMP)

### If No Background Checks

1. **Week 1**: Identify all personnel with state data access
2. **Week 2**: Engage background check vendor
3. **Weeks 3-8**: Complete background checks for all personnel
4. **Week 9**: Document results, create background check register
5. **Ongoing**: Background checks for new hires, renewals every 5 years

**Timeline**: 8-10 weeks
**Priority**: 🔴 CRITICAL (StateRAMP requirement)

### If No Quarterly Access Reviews

1. **Week 1**: Export all accounts with state data access
2. **Week 2**: Send to managers and state agency POCs for review
3. **Week 3**: Collect sign-offs, identify inappropriate access
4. **Week 4**: Remediate access issues
5. **Ongoing**: Schedule quarterly (every 90 days)

**Timeline**: Establish immediately, need 4 consecutive quarters for ATO
**Priority**: 🔴 CRITICAL (required for ATO and ConMon)

## Cross-References

### Related StateRAMP Controls

- AC-1 - Access Control Policy and Procedures
- AC-3 - Access Enforcement
- AC-6 - Least Privilege
- IA-2 - Identification and Authentication (multi-factor)
- AU-2 - Audit Events (account management events)

### StateRAMP vs FedRAMP Differences

- **Data Residency**: StateRAMP requires US (sometimes in-state), FedRAMP allows any approved region
- **Background Checks**: StateRAMP requires state-specific checks, FedRAMP requires federal
- **Incident Notification**: StateRAMP 24 hours to state, FedRAMP varies
- **ConMon Frequency**: StateRAMP monthly, FedRAMP monthly (High), quarterly (Moderate/Low)
- **Authorization Validity**: StateRAMP 3 years, FedRAMP 3 years
- **State Audit Rights**: StateRAMP includes state inspection rights, FedRAMP federal only

### Maps to Other Frameworks

- **NIST 800-53 Rev 5**: AC-2 (same control)
- **FedRAMP**: AC-2 (with state-specific additions)
- **ISO 27001:2022**: A.5.15, A.5.16, A.5.18 (Access control)
- **SOC 2**: CC6.1, CC6.2 (Access controls)

## Cost Estimates

### StateRAMP Authorization (Moderate Baseline)

- Readiness assessment: 120 hours ($12,000)
- SSP development: 200 hours ($20,000)
- Control implementation: 400 hours ($40,000)
- Background checks: $100-500 per person
- Data residency migration (if needed): 80-200 hours ($8k-$20k)
- 3PAO assessment: $60k-$120k (depends on system complexity)
- **Total Year 1**: ~$140k-$192k (one-time) + ongoing ConMon

### StateRAMP Continuous Monitoring (ConMon)

- Monthly POA&M updates: 8 hours/month ($800/month = $9,600/year)
- Monthly vulnerability scans: $5k-$10k/year
- Quarterly access reviews: 16 hours/quarter ($1,600/quarter = $6,400/year)
- Annual assessment: $40k-$80k/year
- **Ongoing**: ~$61k-$106k/year

### Tools

- GRC platform with StateRAMP templates: $20k-$50k/year
- Vulnerability scanning: $5k-$15k/year
- Background check service: $100-500/person (initial + renewals)

## Evidence Package Structure

```
evidence/
└── stateramp-ac2-account-management/
    ├── ssp/
    │   ├── ssp-section-13.2-ac2-v1.2.docx
    │   └── ssp-annual-review-2024.pdf
    ├── policies/
    │   ├── account-management-policy-v1.1-signed.pdf
    │   ├── background-check-procedure.pdf
    │   └── data-residency-attestation-2024.pdf
    ├── automated/
    │   ├── 2024-01/
    │   │   ├── iam-users-20240131.json
    │   │   ├── credential-report-20240131.csv
    │   │   ├── account-lifecycle-202401.json
    │   │   ├── data-residency-20240131.json
    │   │   └── inactive-accounts-20240131.csv
    │   └── ... (monthly for ConMon)
    ├── quarterly-reviews/
    │   ├── Q1-2024-access-review.pdf
    │   ├── Q1-2024-state-agency-signoff.pdf
    │   ├── Q2-2024-access-review.pdf
    │   ├── Q2-2024-state-agency-signoff.pdf
    │   ├── Q3-2024-access-review.pdf
    │   ├── Q3-2024-state-agency-signoff.pdf
    │   ├── Q4-2024-access-review.pdf
    │   └── Q4-2024-state-agency-signoff.pdf
    ├── background-checks/
    │   ├── background-check-register-2024.xlsx (sanitized)
    │   └── background-check-policy-approval.pdf
    ├── state-approvals/
    │   ├── state-agency-account-approvals-Q1-2024/
    │   │   ├── approval-001.pdf
    │   │   └── ... (25 samples)
    │   └── ... (quarterly)
    ├── emergency-access/
    │   ├── emergency-access-log-2024.xlsx
    │   ├── emergency-access-001-state-notification.pdf
    │   └── ... (all emergency access instances)
    ├── conmon-reports/
    │   ├── 2024-01-conmon-report.pdf
    │   ├── 2024-02-conmon-report.pdf
    │   └── ... (monthly)
    └── README.md (evidence index, 7-year retention)
```

## Automation Script

```python
#!/usr/bin/env python3
"""
StateRAMP AC-2 Account Management Evidence Collection
For cloud service providers seeking StateRAMP authorization
"""
import boto3
import json
import csv
from datetime import datetime, timedelta
import os

class StateRAMPAccountManagement:
    def __init__(self, output_dir="evidence/stateramp-ac2-account-management"):
        self.output_dir = f"{output_dir}/automated/{datetime.now().strftime('%Y-%m')}"
        self.timestamp = datetime.now().strftime("%Y%m%d")
        os.makedirs(self.output_dir, exist_ok=True)

    def collect_account_inventory(self):
        """Collect complete account inventory"""
        print("Collecting account inventory...")
        iam = boto3.client('iam')

        users = iam.list_users()['Users']

        # Save inventory
        with open(f"{self.output_dir}/iam-users-{self.timestamp}.json", 'w') as f:
            json.dump(users, f, indent=2, default=str)

        # Generate credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        with open(f"{self.output_dir}/credential-report-{self.timestamp}.csv", 'wb') as f:
            f.write(report['Content'])

        print(f"✓ Total IAM users: {len(users)}")

        return users

    def verify_data_residency(self):
        """Verify all resources are in US regions (StateRAMP requirement)"""
        print("Verifying data residency (US regions only)...")
        ec2 = boto3.client('ec2')
        s3 = boto3.client('s3')

        # Get all enabled regions
        regions = ec2.describe_regions()['Regions']

        # Check for non-US regions with resources
        non_us_resources = []

        for region in regions:
            region_name = region['RegionName']
            if not region_name.startswith('us-'):
                # Check if region has any resources
                ec2_regional = boto3.client('ec2', region_name=region_name)
                try:
                    instances = ec2_regional.describe_instances()
                    if len(instances['Reservations']) > 0:
                        non_us_resources.append({
                            'region': region_name,
                            'resource_type': 'EC2',
                            'count': len(instances['Reservations'])
                        })
                except:
                    pass  # Region might not be enabled

        # Check S3 bucket locations
        buckets = s3.list_buckets()['Buckets']
        for bucket in buckets:
            bucket_name = bucket['Name']
            try:
                location = s3.get_bucket_location(Bucket=bucket_name)
                bucket_region = location['LocationConstraint'] or 'us-east-1'

                if not bucket_region.startswith('us-'):
                    non_us_resources.append({
                        'region': bucket_region,
                        'resource_type': 'S3',
                        'bucket': bucket_name
                    })
            except:
                pass

        # Save results
        with open(f"{self.output_dir}/data-residency-{self.timestamp}.json", 'w') as f:
            json.dump({
                'compliant': len(non_us_resources) == 0,
                'non_us_resources': non_us_resources,
                'timestamp': datetime.now().isoformat()
            }, f, indent=2)

        if len(non_us_resources) > 0:
            print(f"✗ CRITICAL: Found {len(non_us_resources)} resources outside US regions")
            print(f"  StateRAMP requires all state data in US regions")
            for resource in non_us_resources:
                print(f"  - {resource}")
        else:
            print(f"✓ Data residency compliant (all resources in US regions)")

        return non_us_resources

    def check_inactive_accounts(self):
        """Check for inactive accounts (>90 days)"""
        print("Checking for inactive accounts...")
        iam = boto3.client('iam')

        # Get credential report
        iam.generate_credential_report()
        report = iam.get_credential_report()

        # Parse for inactive accounts
        inactive_accounts = []
        for line in csv.DictReader(report['Content'].decode('utf-8').splitlines()):
            if line.get('password_enabled') == 'true':
                password_last_used = line.get('password_last_used')

                if password_last_used and password_last_used != 'N/A':
                    try:
                        last_used = datetime.fromisoformat(password_last_used.replace('Z', '+00:00'))
                        days_inactive = (datetime.now(last_used.tzinfo) - last_used).days

                        if days_inactive > 90:
                            inactive_accounts.append({
                                'user': line['user'],
                                'password_last_used': password_last_used,
                                'days_inactive': days_inactive
                            })
                    except:
                        pass  # Skip parsing errors

        # Save results
        with open(f"{self.output_dir}/inactive-accounts-{self.timestamp}.json", 'w') as f:
            json.dump(inactive_accounts, f, indent=2)

        if len(inactive_accounts) > 0:
            print(f"⚠️  WARNING: {len(inactive_accounts)} accounts inactive >90 days (AC-2(3) requirement)")
        else:
            print(f"✓ No inactive accounts found")

        return inactive_accounts

    def generate_conmon_report(self, users, non_us_resources, inactive_accounts):
        """Generate monthly ConMon report"""
        report = f"""
StateRAMP Continuous Monitoring (ConMon) Report
Month: {datetime.now().strftime('%B %Y')}
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

AC-2 ACCOUNT MANAGEMENT STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Accounts:         {len(users)}
Inactive Accounts (>90d): {len(inactive_accounts)} {'✓' if len(inactive_accounts) == 0 else '⚠️  ACTION REQUIRED'}

DATA RESIDENCY (StateRAMP Requirement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compliance Status:      {'✓ COMPLIANT - All resources in US regions' if len(non_us_resources) == 0 else f'✗ NON-COMPLIANT - {len(non_us_resources)} resources outside US'}

REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        if len(inactive_accounts) > 0:
            report += f"□ Disable {len(inactive_accounts)} inactive accounts (within 30 days)\n"
        if len(non_us_resources) > 0:
            report += f"□ Migrate {len(non_us_resources)} resources to US regions (IMMEDIATE)\n"

        report += f"""
MONTHLY DELIVERABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Account inventory collected
✓ Data residency verified
✓ Inactive accounts identified
□ POA&M updated (due by 5th of month)
□ Vulnerability scan results (due by 10th of month)
□ Submit to state agency POC

Evidence Location: {self.output_dir}
Retention: 7 years (state requirements)
"""

        report_file = f"{self.output_dir}/../conmon-reports/conmon-report-{datetime.now().strftime('%Y-%m')}.txt"
        os.makedirs(os.path.dirname(report_file), exist_ok=True)

        with open(report_file, 'w') as f:
            f.write(report)

        print(f"\n{report}")
        print(f"ConMon report: {report_file}")

        return report_file

if __name__ == "__main__":
    print("StateRAMP AC-2 Account Management Evidence Collection")
    print("=" * 70)
    print("Baseline: Moderate")
    print("ConMon: Monthly reporting required")
    print("=" * 70)

    collector = StateRAMPAccountManagement()

    users = collector.collect_account_inventory()
    non_us_resources = collector.verify_data_residency()
    inactive_accounts = collector.check_inactive_accounts()

    collector.generate_conmon_report(users, non_us_resources, inactive_accounts)

    print("\n✓ StateRAMP evidence collection complete")
    print("⚠️  REMINDER: Submit ConMon report to state agency by 5th of month")
```

---

**StateRAMP Program**: State-level FedRAMP equivalent
**Baseline**: Moderate (most common) or High
**Assessment**: Third-Party Assessment Organization (3PAO)
**Authorization Validity**: 3 years
**ConMon**: Monthly reporting required
**Evidence Retention**: 7 years (state record retention)
**Priority**: 🔴 CRITICAL (US state government cloud services)

**Key StateRAMP Differences**:

- Data residency requirements (US or in-state)
- State-specific background checks
- 24-hour incident notification to state
- State audit/inspection rights
- Enhanced data return/destruction procedures
