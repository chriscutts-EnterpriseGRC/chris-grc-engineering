---
description: State-by-state variations in StateRAMP requirements
---

# StateRAMP State-Specific Requirements

Provides guidance on state-by-state variations, additional requirements, and acceptance criteria for StateRAMP authorizations.

## Arguments

- `$1` - State code (optional: CA, TX, FL, NY, IL, etc. or "all")

## StateRAMP Participating States

**Current Participants** (15+ states as of 2024):

- California (CA)
- Texas (TX)
- Florida (FL)
- New York (NY)
- Illinois (IL)
- Michigan (MI)
- Pennsylvania (PA)
- Ohio (OH)
- Georgia (GA)
- North Carolina (NC)
- Colorado (CO)
- Arizona (AZ)
- Maryland (MD)
- Massachusetts (MA)
- Washington (WA)

**Growing**: New states join regularly, check StateRAMP website for current list

## StateRAMP Impact Council

**Purpose**: Coordinate multi-state reciprocity and authorization acceptance

**Functions**:

- Review and approve StateRAMP authorizations
- Maintain baseline requirements
- Coordinate state participation
- Facilitate reciprocity agreements

**Reciprocity Model**:

- One StateRAMP authorization accepted by multiple states
- Individual states may add supplemental requirements
- Reduces redundant assessments and costs

## Core vs. State-Specific Requirements

### Core StateRAMP Requirements (All States)

**Universal Across States**:

- NIST 800-53 control baselines (Low/Moderate)
- Third-party assessment (3PAO)
- Continuous monitoring
- Required documentation (SSP, SAP, SAR, POA&M)
- Annual assessments
- Significant change notifications (30 days)

### State-Specific Variations

**Common Areas of Variation**:

1. **Additional Controls**: Some states require controls beyond baseline
2. **Data Residency**: Where data can be stored/processed
3. **Privacy Requirements**: State privacy laws
4. **Breach Notification**: State-specific timelines
5. **Records Retention**: State records laws
6. **Legal/Regulatory**: State-specific compliance
7. **Acceptance Process**: Review and approval procedures

## State-by-State Details

### California (CA)

**Additional Requirements**:

- **CCPA Compliance**: California Consumer Privacy Act
- **Data Residency**: May require data stored in US
- **Privacy Controls**: Enhanced privacy protections
- **Breach Notification**: 72 hours to Attorney General if >500 residents

**Participating Agencies**:

- California Department of Technology (CDT)
- Various state departments

**Key Contacts**:

- CDT StateRAMP Program Office

**Notes**:

- Large state market
- Strong privacy requirements
- May require CCPA addendum to contracts

### Texas (TX)

**Additional Requirements**:

- **Data Residency**: Strong preference for Texas or US data centers
- **DIR Compliance**: Department of Information Resources standards
- **Privacy**: Texas Privacy Protection Act considerations
- **Breach Notification**: "Without unreasonable delay"

**Participating Agencies**:

- Texas Department of Information Resources (DIR)
- Multiple state agencies and higher education

**Key Contacts**:

- DIR Security Office

**Notes**:

- Second largest state market
- May require Texas-specific security controls
- Strong focus on data sovereignty

### Florida (FL)

**Additional Requirements**:

- **Public Records**: Florida Sunshine Law compliance
- **Data Residency**: Prefer US-based data centers
- **Breach Notification**: 30 days to Department of Legal Affairs

**Participating Agencies**:

- Florida Digital Service
- Agency for State Technology (AST)

**Key Contacts**:

- AST Security Office

**Notes**:

- Public records law very broad
- Must accommodate public records requests
- Criminal justice information has special requirements

### New York (NY)

**Additional Requirements**:

- **SHIELD Act**: Stop Hacks and Improve Electronic Data Security Act
- **Data Encryption**: Specific encryption requirements
- **Privacy**: NY Privacy Act considerations
- **Breach Notification**: "Without unreasonable delay" to Attorney General

**Participating Agencies**:

- NY Office of Information Technology Services (ITS)

**Key Contacts**:

- ITS Security Operations Center

**Notes**:

- SHIELD Act may exceed StateRAMP baseline
- Strong focus on data protection
- Financial services may require NYDFS 23 NYCRR 500 as well

### Illinois (IL)

**Additional Requirements**:

- **BIPA**: Biometric Information Privacy Act (if applicable)
- **Privacy**: Personal Information Protection Act
- **Breach Notification**: Without unreasonable delay

**Participating Agencies**:

- Department of Innovation & Technology (DoIT)

**Key Contacts**:

- DoIT Security Team

**Notes**:

- BIPA is nation's strictest biometric law
- Avoid collecting biometrics if possible

### Colorado (CO)

**Additional Requirements**:

- **CPA**: Colorado Privacy Act compliance
- **Data Residency**: Preference for US data centers
- **Breach Notification**: 30 days to Attorney General

**Participating Agencies**:

- Governor's Office of Information Technology (OIT)

**Key Contacts**:

- OIT Security Office

**Notes**:

- CPA similar to CCPA/GDPR
- Consumer privacy rights must be accommodated

### Other States

**General Patterns**:

- Most states have breach notification laws (timelines vary)
- Many prefer or require US-based data storage
- State privacy laws increasingly common
- Public records laws vary significantly
- Some states have specific sector requirements (education, health, criminal justice)

## Common State Requirements

### Data Residency

**Strict (Data Must Remain in State)**:

- Rare, but some states for specific data types

**US-Based (Data Must Remain in US)**:

- Common requirement
- Impacts choice of cloud regions
- Backup/DR locations also restricted

**No Restriction**:

- Some states allow international if adequate protections

**Impact on CSPs**:

- Must document data storage locations
- Compliance with state restrictions
- May need state-specific deployments

### Privacy and Breach Notification

**State Privacy Laws**:

- CCPA (California)
- SHIELD Act (New York)
- CPA (Colorado)
- VCDPA (Virginia)
- Others emerging

**Breach Notification Variations**:

- Timelines: 24 hours to 90 days
- Thresholds: >500 residents, >1000 residents, any breach
- Recipients: Attorney General, residents, media
- Content requirements vary

**CSP Obligations**:

- Know requirements for states served
- Incident response plan must address state laws
- Breach notification procedures documented
- May require state-specific addendums

### Records Management

**Public Records Laws**:

- All states have some form
- "Sunshine laws" require disclosure
- Records retention requirements
- E-discovery obligations

**CSP Implications**:

- Must support public records requests
- Data retention capabilities
- Search and export functionality
- Legal hold processes

**Common Issues**:

- Automatic data deletion conflicts with retention
- Backup tapes may contain old records
- Multi-tenant environments complicate retrieval

## State Acceptance Process

### StateRAMP Path

**1. Initial Authorization**:

- CSP obtains StateRAMP authorization through one state
- Submits ATO package to StateRAMP Impact Council
- Council reviews and approves

**2. Additional State Acceptance**:

- Other states review StateRAMP authorization
- May request supplemental information
- May require state-specific addendums
- Grants acceptance (not new ATO)

**3. State Reciprocity**:

- Participating states agree to accept StateRAMP ATO
- Reduces redundant assessments
- May have conditions or limitations

### State-Direct Path

**Some states may**:

- Conduct own authorization outside StateRAMP
- Require separate assessment
- Use StateRAMP as input but not final decision
- Have agency-specific requirements

**When This Happens**:

- Specialized systems (law enforcement, health)
- State has unique requirements
- Pilot programs or new initiatives
- Higher-than-moderate impact

## Multi-State Strategy

### Planning for Multiple States

**Best Practices**:

1. **Start with strictest requirements**: Satisfies all states
2. **Document state-specific controls**: Track variations
3. **Use "most common denominator"**: US data residency, strong encryption
4. **Build flexibility**: Support state-specific configurations
5. **Engage early**: Talk to state authorizing officials

### State-Specific Deployments

**When Needed**:

- Data residency requirements
- State-unique integrations
- Legal/regulatory isolation
- Performance/latency optimization

**Architectures**:

- Multi-region cloud (state-specific regions)
- Data partitioning (logical separation)
- Dedicated tenants (physical separation)

**Tradeoffs**:

- Higher cost and complexity
- Easier compliance and acceptance
- Better performance for state users

## State Contacts and Resources

### Primary Resources

**StateRAMP PMO**:

- Website: stateramp.org
- Email: info@stateramp.org
- Guidance documents and templates

**State-Specific Contacts**:

- Each state has designated StateRAMP coordinator
- Usually within state IT or security office
- Check StateRAMP website for current contacts

### State Authorization Officials

**Who They Are**:

- Chief Information Security Officer (CISO)
- Chief Information Officer (CIO)
- Designated agency official
- Risk acceptance authority

**What They Do**:

- Review ATO packages
- Accept risk and grant ATO
- Ongoing authorization decisions
- Significant change approvals

## Emerging Trends

**Increasing Participation**:

- More states joining StateRAMP
- Reciprocity agreements expanding
- Market adoption growing

**Privacy Focus**:

- State privacy laws proliferating
- GDPR-style requirements common
- Consumer rights expanding

**Data Sovereignty**:

- Increasing data residency requirements
- US-based cloud preference
- Foreign adversary restrictions (TikTok laws, etc.)

**Sector-Specific**:

- Criminal justice (CJIS)
- Education (FERPA, state laws)
- Health (HIPAA + state)
- Each may have unique requirements

## Risk and Considerations

### Expansion Risk

- Start with one state
- Prove model works
- Expand to additional states
- Don't over-commit initially

### Variation Risk

- State requirements may conflict
- Must track and manage differences
- Documentation burden increases
- Testing complexity grows

### Legal Risk

- Multi-state legal compliance
- Contract terms vary by state
- Liability and indemnification
- Insurance requirements

## Examples

```bash
# General state variations overview
/stateramp:state-specific all

# California-specific requirements
/stateramp:state-specific CA

# Compare multiple states
/stateramp:state-specific "CA, TX, NY"

# Multi-state planning guidance
/stateramp:state-specific multi-state
```

## Next Steps

After understanding state requirements:

1. Use `/stateramp:assess` to evaluate readiness
2. Use `/stateramp:impact-select` to validate impact level
3. Use `/stateramp:documentation` for ATO package prep
4. Engage stateramp-expert skill for state-specific control guidance
5. Contact state coordinators early in process
