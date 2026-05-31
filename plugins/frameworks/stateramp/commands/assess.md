---
description: StateRAMP authorization readiness assessment
---

# StateRAMP Assessment

Evaluates organizational readiness for StateRAMP (State Risk and Authorization Management Program) authorization to provide cloud services to state and local governments.

## Arguments

- `$1` - Impact level (required: low, moderate)
- `$2` - Target state (optional: specific state or "multi-state")

## StateRAMP Overview

**Purpose**: Standardized security framework for state and local government cloud services
**Based On**: FedRAMP framework, adapted for state/local needs
**Benefit**: Single authorization accepted by multiple states
**Participants**: 15+ states and growing (CA, TX, FL, NY, IL, etc.)

## Impact Levels

### StateRAMP Low (~125 controls)

- **Data Type**: Low-impact public information
- **Systems**: Non-sensitive applications, public-facing services
- **Examples**: Event calendars, public forms, general information systems
- **Assessment**: Third-party assessor required
- **Timeline**: 6-12 months typical
- **Cost**: $50K-$150K assessment + remediation

### StateRAMP Moderate (~325 controls)

- **Data Type**: Controlled Unclassified Information (CUI), PII, sensitive data
- **Systems**: Finance, HR, law enforcement, healthcare, licensing
- **Examples**: Tax systems, benefits administration, case management
- **Assessment**: Third-party assessor required
- **Timeline**: 12-18 months typical
- **Cost**: $150K-$400K assessment + remediation

## StateRAMP vs FedRAMP Differences

**Similarities**:

- Based on NIST 800-53 controls
- Continuous monitoring required
- Third-party assessment organization (3PAO)
- Similar documentation (SSP, SAP, SAR, POA&M)

**Key Differences**:

1. **Scope**: State/local government (not federal)
2. **Reciprocity**: State-level acceptance (not federal agencies)
3. **Control Set**: Tailored for state needs (fewer federal-specific requirements)
4. **Cost**: Generally 20-30% lower than FedRAMP
5. **Timeline**: Slightly faster (no JAB option, state-sponsored only)
6. **Flexibility**: States may add specific requirements

## Authorization Process

### Phase 1: Preparation (3-6 months)

1. Determine impact level (Low vs Moderate)
2. Define system boundaries and data flows
3. Gap assessment against StateRAMP controls
4. Remediation planning and implementation
5. Policy and procedure documentation

### Phase 2: Documentation (2-4 months)

1. **System Security Plan (SSP)**: Comprehensive security documentation
2. **Security Assessment Plan (SAP)**: Testing methodology
3. **Privacy Impact Assessment (PIA)**: For PII/sensitive data
4. **Contingency Plan**: Business continuity and disaster recovery
5. **Incident Response Plan**: Security event handling

### Phase 3: Assessment (2-3 months)

1. Select StateRAMP-recognized 3PAO
2. Readiness assessment review
3. On-site security assessment
4. Penetration testing and vulnerability scanning
5. Control validation and evidence review

### Phase 4: Authorization (1-2 months)

1. Security Assessment Report (SAR) delivery
2. Plan of Action & Milestones (POA&M) for deficiencies
3. State authorization official review
4. Authorization to Operate (ATO) issuance
5. Continuous monitoring activation

## Assessment Output

1. **Readiness Score**: Overall compliance percentage by impact level
2. **Control Family Gaps**: Which NIST 800-53 families need work
   - Access Control (AC)
   - Awareness and Training (AT)
   - Audit and Accountability (AU)
   - Security Assessment and Authorization (CA)
   - Configuration Management (CM)
   - Contingency Planning (CP)
   - Identification and Authentication (IA)
   - Incident Response (IR)
   - Maintenance (MA)
   - Media Protection (MP)
   - Physical and Environmental Protection (PE)
   - Planning (PL)
   - Personnel Security (PS)
   - Risk Assessment (RA)
   - System and Communications Protection (SC)
   - System and Information Integrity (SI)

3. **State-Specific Requirements**: Variations by target state(s)
4. **Documentation Readiness**: SSP, SAP, POA&M completion status
5. **Technical Gaps**: Security controls requiring implementation
6. **Timeline Projection**: Estimated time to ATO
7. **Cost Estimate**: Assessment, remediation, and ongoing monitoring
8. **3PAO Recommendations**: Qualified assessor organizations

## Common Implementation Gaps

1. **Multi-Factor Authentication (IA-2)**:
   - Not implemented for all users
   - Legacy systems without MFA support
   - Inconsistent enforcement

2. **Encryption (SC-8, SC-13, SC-28)**:
   - Data at rest not encrypted
   - Transit encryption gaps
   - Weak cryptographic algorithms

3. **Continuous Monitoring (CA-7, SI-4)**:
   - Manual processes instead of automated
   - Insufficient log aggregation
   - No SIEM or security monitoring platform

4. **Incident Response (IR family)**:
   - No formal IR plan
   - Untested procedures
   - Unclear escalation paths

5. **Vulnerability Management (RA-5)**:
   - Irregular scanning
   - Slow patching processes
   - No vulnerability remediation tracking

6. **Access Control (AC-2, AC-6)**:
   - Excessive privileged accounts
   - No periodic access reviews
   - Lack of least privilege implementation

## Multi-State Considerations

**StateRAMP Impact Council**:

- Coordinates across participating states
- Reviews and approves authorizations
- Maintains reciprocity agreements

**State Acceptance**:

- Individual states may accept StateRAMP ATO
- Some states require supplemental reviews
- State-specific addendums possible

**Continuous Monitoring**:

- Monthly deliverables to states
- Annual assessment required
- Significant change notifications within 30 days

## Examples

```bash
# Full Low impact assessment
/stateramp:assess low

# Moderate impact for California
/stateramp:assess moderate CA

# Multi-state Moderate assessment
/stateramp:assess moderate multi-state
```

## Next Steps

After assessment:

1. Use `/stateramp:impact-select` to validate impact level choice
2. Use `/stateramp:documentation` for ATO package guidance
3. Use `/stateramp:state-specific` to understand state variations
4. Engage stateramp-expert skill for detailed implementation guidance
