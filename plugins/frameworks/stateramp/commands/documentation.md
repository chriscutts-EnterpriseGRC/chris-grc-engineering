---
description: StateRAMP ATO package documentation guidance (SSP, SAP, SAR, POA&M)
---

# StateRAMP Documentation Guidance

Provides comprehensive guidance on creating StateRAMP Authorization to Operate (ATO) package documentation.

## Arguments

- `$1` - Document type (optional: ssp, sap, sar, poam, all)
- `$2` - Impact level (optional: low, moderate)

## Required ATO Package Documents

StateRAMP requires four core documents for authorization:

1. **SSP** - System Security Plan
2. **SAP** - Security Assessment Plan
3. **SAR** - Security Assessment Report
4. **POA&M** - Plan of Action & Milestones

**Plus supporting documents**:

- Privacy Impact Assessment (PIA)
- Contingency Plan (CP)
- Incident Response Plan (IRP)
- Configuration Management Plan
- Rules of Behavior
- Control Implementation Summary (CIS)
- Inventory Workbook

## System Security Plan (SSP)

### Purpose

Comprehensive description of the system, security controls, and implementation details.

### Required Sections

**1. Information System Name/Title**

- Official system name
- Unique identifier
- Version/release

**2. System Categorization**

- FIPS 199 impact level (Low/Moderate)
- Confidentiality/Integrity/Availability ratings
- Justification for categorization

**3. Information System Owner**

- Cloud Service Provider (CSP) organization
- Responsible officials
- Contact information

**4. Authorizing Official**

- State agency sponsor
- Authorization decision authority

**5. System Description**

- Purpose and functionality
- User base and access methods
- System architecture
- Technology stack
- Deployment model (SaaS, PaaS, IaaS)

**6. System Environment**

- **Architecture Diagrams**:
  - Network topology
  - Authorization boundary
  - Data flows
  - External connections
- **Infrastructure**:
  - Data centers and locations
  - Cloud service layers
  - Virtualization details
  - Hardware specifications

**7. Security Control Implementation**

- **For each NIST 800-53 control**:
  - Control baseline (Low: ~125, Moderate: ~325)
  - Implementation status (Implemented/Partially Implemented/Not Implemented)
  - Responsibility (CSP/Customer/Shared)
  - Implementation description (HOW control is met)
  - Evidence artifacts

**8. Attachments**

- System architecture diagrams
- Network diagrams
- Data flow diagrams
- Authorization boundary diagram
- User guides
- Standard Operating Procedures (SOPs)
- Policies and procedures

### SSP Best Practices

**Be Specific**:

- ❌ "We use encryption"
- ✅ "AES-256 encryption for data at rest, TLS 1.2+ for data in transit"

**Show Evidence**:

- Reference specific configurations
- Name security tools and technologies
- Provide version numbers
- Include responsible parties

**Use Control Inheritance**:

- Clearly mark inherited controls (from cloud provider)
- Document shared responsibilities
- Attach provider SSP/compliance docs

**Common SSP Mistakes**:

1. Generic copy/paste from templates
2. No evidence of actual implementation
3. Vague statements without technical details
4. Missing diagrams or outdated diagrams
5. Inconsistent control numbering
6. Not addressing all control enhancements

### SSP Page Count

- **Low**: 150-300 pages typical
- **Moderate**: 300-600+ pages typical

## Security Assessment Plan (SAP)

### Purpose

Defines how the 3PAO will assess security controls during the authorization process.

### Required Sections

**1. Assessment Methodology**

- Testing approach
- Tools to be used
- Sampling methodology

**2. Scope**

- Controls to be assessed
- Systems and components in scope
- Boundaries and limitations

**3. Assessment Procedures**

- **For each control**:
  - Test objectives
  - Examine: Documentation review
  - Interview: Personnel to interview
  - Test: Technical validation methods

**4. Rules of Engagement**

- Assessment schedule
- Access requirements
- Points of contact
- Escalation procedures

**5. Penetration Testing**

- Scope and rules of engagement
- Testing methodology
- Authorized tools
- Reporting requirements

**6. Deliverables**

- Security Assessment Report (SAR)
- Penetration test report
- Vulnerability scan results
- Evidence artifacts

### SAP Timeline

- Developed by 3PAO in collaboration with CSP
- Finalized 2-4 weeks before assessment
- State review and approval required

## Security Assessment Report (SAR)

### Purpose

Documents 3PAO findings from the security assessment.

### Required Sections

**1. Executive Summary**

- Overall assessment results
- Key findings and risks
- Recommendation for authorization

**2. Assessment Results by Control**

- **For each control**:
  - Assessment objective
  - Assessment method (Examine/Interview/Test)
  - Findings (Pass/Fail/Other)
  - Weakness description if not satisfied
  - Risk rating (Low/Moderate/High)

**3. Risk Exposure**

- Summary of deficiencies
- Risk level distribution
- Compensating controls
- Recommendations

**4. Penetration Test Results**

- Methodology
- Findings
- Remediation recommendations

**5. Vulnerability Scan Results**

- Scan methodology
- Identified vulnerabilities (CVSS scores)
- False positive analysis
- Remediation status

**6. Attachments**

- Detailed test evidence
- Interview records
- Examination artifacts
- Technical screenshots

### SAR Findings Classifications

**Satisfied (Pass)**:

- Control fully implemented
- No deficiencies identified
- Evidence supports implementation

**Other Than Satisfied (Fail)**:

- Control not implemented or insufficient
- Becomes POA&M item
- Risk rating assigned

**Not Applicable (N/A)**:

- Control not relevant to system
- Justification required

### Risk Ratings

**Low Risk**:

- Minor impact if exploited
- Unlikely to cause serious harm
- May be acceptable with POA&M

**Moderate Risk**:

- Could cause serious adverse effects
- Requires POA&M with short timeline
- Compensating controls may be needed

**High Risk**:

- Severe impact if exploited
- May block authorization
- Immediate remediation required

## Plan of Action & Milestones (POA&M)

### Purpose

Documents known deficiencies and remediation plan.

### Required Information Per Item

**1. Weakness Identification**

- Control number (e.g., AC-2)
- Weakness description
- Risk rating (Low/Moderate/High)
- Source (SAR finding, vulnerability scan, etc.)

**2. Remediation Plan**

- Specific corrective actions
- Resources required
- Responsible party
- Milestone dates
- Completion criteria

**3. Current Status**

- Ongoing/Completed
- Percent complete
- Status updates

**4. Deviation/Compensating Controls**

- If control cannot be fully implemented
- Justification for deviation
- Compensating controls description
- Residual risk acceptance

### POA&M Requirements

**Timeline Constraints**:

- **High Risk**: 30 days max
- **Moderate Risk**: 90 days max
- **Low Risk**: 180 days max

**State Approval Required**:

- Authorizing official must accept POA&M items
- Excessive POA&Ms may delay authorization
- High-risk items may block ATO

**Monthly Reporting**:

- POA&M status updates required
- Milestone slippage requires justification
- Completed items closed with evidence

### POA&M Best Practices

**Be Realistic**:

- Don't commit to impossible timelines
- Account for procurement, testing, validation
- Include buffer for unexpected issues

**Be Specific**:

- ❌ "Implement MFA"
- ✅ "Deploy Duo Security MFA for all admin accounts, pilot by 1/15, full rollout by 2/1, validation testing by 2/15"

**Limit POA&M Count**:

- Too many POA&Ms = poor readiness
- Aim for <20 items for clean authorization
- Remediate before assessment when possible

## Supporting Documents

### Privacy Impact Assessment (PIA)

**Required if**: System processes PII
**Sections**:

- System and data description
- Data collection and usage
- Data sharing and disclosure
- Data retention and disposal
- Privacy controls implementation
- Privacy risk assessment

### Contingency Plan (CP)

**Required**: All systems
**Sections**:

- Backup and recovery procedures
- Emergency response procedures
- Recovery procedures
- Reconstitution procedures
- Testing and training schedules

### Incident Response Plan (IRP)

**Required**: All systems
**Sections**:

- Incident detection and reporting
- Response procedures by incident type
- Roles and responsibilities
- Communication and escalation
- Post-incident review process

## Documentation Timeline

**Typical Development Schedule**:

1. **SSP Development**: 2-4 months
   - Initial draft
   - Technical review
   - State review and feedback
   - Finalization

2. **SAP Development**: 2-4 weeks
   - 3PAO creates plan
   - CSP review and input
   - State approval

3. **Assessment Execution**: 4-8 weeks
   - Vulnerability scanning
   - Penetration testing
   - Control validation
   - Evidence collection

4. **SAR Development**: 2-4 weeks
   - 3PAO analyzes findings
   - Report drafting
   - CSP review
   - Finalization

5. **POA&M Development**: 1-2 weeks
   - Identify deficiencies
   - Create remediation plans
   - CSP and state negotiation
   - Approval

## StateRAMP Document Templates

**Available Resources**:

- StateRAMP website provides templates
- Based on FedRAMP templates
- State-specific templates may exist
- 3PAO often provides templates

**Template Usage**:

- Use as starting point, not copy/paste
- Customize to actual system
- Remove non-applicable sections
- Add detail and evidence

## Document Maintenance

**Continuous Monitoring Phase**:

- SSP updates for significant changes
- Monthly POA&M updates
- Annual SAR (annual assessment)
- Continuous scanning reports

**Significant Changes**:

- New connections or services
- Major architecture changes
- New data types
- Changed risk profile

**Notification Required**:

- Within 30 days of significant change
- May require supplemental assessment
- Could trigger re-authorization

## Quality Checklist

Before submitting ATO package:

**SSP**:

- [ ] All controls addressed (no TBDs)
- [ ] Diagrams accurate and current
- [ ] Inheritance clearly documented
- [ ] Evidence references included
- [ ] Technical details specific
- [ ] Page numbers and table of contents

**SAP**:

- [ ] Aligned with SSP scope
- [ ] Testing methodology clear
- [ ] Schedule realistic
- [ ] State approved

**SAR**:

- [ ] All controls assessed
- [ ] Findings clearly documented
- [ ] Risk ratings justified
- [ ] Evidence attached
- [ ] 3PAO signed

**POA&M**:

- [ ] All deficiencies included
- [ ] Timelines realistic and compliant
- [ ] Resources identified
- [ ] Milestones specific
- [ ] Risk ratings match SAR

## Examples

```bash
# General documentation guidance
/stateramp:documentation all

# SSP-specific guidance for Moderate
/stateramp:documentation ssp moderate

# POA&M guidance
/stateramp:documentation poam

# SAR review checklist
/stateramp:documentation sar low
```

## Next Steps

After documentation:

1. Engage 3PAO for SAP/SAR development
2. Use `/stateramp:assess` to validate readiness
3. Use `/stateramp:state-specific` for state requirements
4. Engage stateramp-expert skill for control-by-control guidance
