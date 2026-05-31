---
description: Determine appropriate StateRAMP impact level (Low vs Moderate)
---

# StateRAMP Impact Level Selection

Helps determine the appropriate StateRAMP impact level based on system characteristics and data sensitivity.

## Arguments

- `$1` - System type (optional: description of system/service)

## Impact Level Decision Framework

StateRAMP uses FIPS 199 categorization based on three security objectives:

### Security Objectives

1. **Confidentiality**: Unauthorized disclosure impact
2. **Integrity**: Unauthorized modification impact
3. **Availability**: System disruption impact

### Impact Ratings

- **Low**: Limited adverse effect
- **Moderate**: Serious adverse effect
- **High**: Severe or catastrophic adverse effect

**Overall Impact Level** = Highest impact across any objective (Confidentiality, Integrity, or Availability)

## StateRAMP Low Impact

### When to Choose Low

- Public information only (no CUI or PII)
- Limited adverse effect if compromised
- Non-critical government operations
- Disruption has minimal impact

### Example Systems

- Public-facing websites (informational)
- Event calendars and scheduling
- Public comment systems
- General constituent communication
- Non-sensitive document management
- Public records (already disclosed)

### Data Types (Low)

- Public information
- Published government data
- General announcements
- Non-sensitive forms

### Control Requirements

- ~125 NIST 800-53 controls
- Lighter compliance burden
- Simpler continuous monitoring

## StateRAMP Moderate Impact

### When to Choose Moderate

- Controlled Unclassified Information (CUI)
- Personally Identifiable Information (PII)
- Protected Health Information (PHI)
- Financial data
- Law enforcement sensitive data
- Serious adverse effect if compromised

### Example Systems

- Tax collection and processing
- Benefits administration (SNAP, Medicaid, etc.)
- Human resources and payroll
- Law enforcement case management
- Licensing and permitting (with PII)
- Financial management systems
- Healthcare portals
- Constituent relationship management (CRM) with PII
- Vital records systems
- Grant management with sensitive data

### Data Types (Moderate)

- Social Security Numbers
- Driver's license numbers
- Financial account information
- Health records
- Criminal justice information
- Protected tax information
- Benefit recipient data
- Employee records

### Control Requirements

- ~325 NIST 800-53 controls
- More rigorous assessment
- Enhanced continuous monitoring
- Stronger security controls

## Decision Tree

```
Does system process/store any of:
├─ PII (SSN, DL#, financial)?          → MODERATE
├─ PHI or health information?           → MODERATE
├─ Financial data (tax, benefits)?      → MODERATE
├─ Law enforcement sensitive?           → MODERATE
├─ CUI designated information?          → MODERATE
└─ Only public information?             → LOW
   └─ Is availability critical?
      ├─ Yes, severe impact if down    → MODERATE
      └─ No, limited impact            → LOW
```

## FIPS 199 Impact Examples

### Confidentiality Impact

**Low**: Public relations system

- Information is already public
- Disclosure has no privacy implications

**Moderate**: Benefits administration

- Contains PII and financial data
- Unauthorized disclosure violates privacy
- Could enable identity theft or fraud

### Integrity Impact

**Low**: Public information website

- Defacement is embarrassing but correctable
- No safety or financial consequences

**Moderate**: Licensing database

- Incorrect licenses could enable fraud
- Could compromise public safety
- Financial harm to individuals/government

### Availability Impact

**Low**: Event calendar

- Citizens can call or visit in person
- Alternative channels exist
- Temporary inconvenience only

**Moderate**: Emergency dispatch system

- Critical for public safety
- Lives at risk if unavailable
- No immediate alternative

## Impact Level Comparison

| Factor | Low | Moderate |
|--------|-----|----------|
| **Controls** | ~125 | ~325 |
| **Cost** | $50K-$150K | $150K-$400K |
| **Timeline** | 6-12 months | 12-18 months |
| **Assessment** | 3PAO required | 3PAO required |
| **Continuous Monitoring** | Basic | Enhanced |
| **Annual Testing** | Lighter | More rigorous |
| **POA&M Scrutiny** | Moderate | Strict |

## Special Considerations

### Data Aggregation

- Individual data points may be low impact
- Aggregated data may elevate to moderate
- Example: Individual addresses (low) vs. database of all addresses (moderate)

### External Interfaces

- Connections to moderate systems may require moderate
- API data exchange considerations
- Integration security requirements

### State-Specific Requirements

Some states may require:

- Higher impact levels for certain data types
- Additional controls beyond baseline
- Specific categorization criteria

**Check** `/stateramp:state-specific` for state variations

### Business Impact Analysis

Consider:

- Mission criticality
- Service disruption cost
- Constituent impact
- Regulatory consequences
- Reputation damage

## Common Mistakes

1. **Underestimating Impact**:
   - "It's just names and addresses" (but SSNs = moderate)
   - Ignoring PII in metadata/logs
   - Not considering data aggregation

2. **Overestimating Impact**:
   - Public data doesn't need moderate
   - Availability concerns alone may not require moderate
   - Consider actual risk, not perceived risk

3. **Ignoring Future State**:
   - Plan for system evolution
   - Adding PII later requires re-authorization
   - Start with appropriate level to avoid rework

## Impact Level Change

**If system changes**:

- New data types added → May require higher impact
- System connections change → Re-evaluate
- Significant change = new authorization required
- StateRAMP requires 30-day notification

## Output

The command provides:

1. **Recommended Impact Level**: Low or Moderate with justification
2. **Data Sensitivity Analysis**: Breakdown of data types
3. **FIPS 199 Assessment**: Confidentiality/Integrity/Availability ratings
4. **Control Count**: Number of controls required
5. **Cost/Timeline Estimate**: Resources needed
6. **Risk Factors**: Considerations and caveats
7. **State Alignment**: Consistency with state requirements

## Examples

```bash
# General impact level guidance
/stateramp:impact-select

# Specific system assessment
/stateramp:impact-select "Benefits eligibility and enrollment system with SSN, income data, and healthcare information"

# Compare system types
/stateramp:impact-select "Public permit search vs. permit application with PII"
```

## Next Steps

After selecting impact level:

1. Use `/stateramp:assess <level>` for readiness assessment
2. Review `/stateramp:documentation` for required packages
3. Engage stateramp-expert skill for control implementation guidance
