-- ─── Demo Seed Data ───────────────────────────────────────────────────────────
-- Run after 001_initial_schema.sql to populate demo data.
-- Safe to re-run — uses INSERT ... ON CONFLICT DO UPDATE.
--
-- Enriched with content from:
--   GRC-Portfolio (ewelina-kowalska-oneill) — IR plan, playbooks, policy docs
--   circleci-aws-opa-lab — OPA control mappings (SC-28, CP-9, AC-3, CM-8)

-- ─── Controls ─────────────────────────────────────────────────────────────────
-- Framework additions vs original:
--   UCF.02.01: confirmed SC-28 via OPA s3/security.rego
--   UCF.05.01: added NIST AC-3 (OPA public-access-restriction rule)
--   UCF.09.01: added NIST CP-9 (OPA versioning/backup rule)
--   UCF.08.02: added NIST CM-8 (OPA asset-tagging rule)
--   Key controls: added PCI DSS 4.0 references (GRC-Portfolio coverage)
INSERT INTO controls (id, name, category, frameworks, effectiveness, score, owner, last_tested, is_ai) VALUES
('UCF.01.01','Multi-Factor Authentication',     'Access Control',     ARRAY['SOC2 CC6.1','ISO A.9.4','NIST IA-5','GDPR Art.32','PCI DSS 8.4'],      'effective',    92,'J. Martinez','2026-05-15',false),
('UCF.01.02','Privileged Access Management',    'Access Control',     ARRAY['SOC2 CC6.3','ISO A.9.2','NIST AC-6','NIST AC-3','PCI DSS 7.2'],         'ineffective',  38,'J. Martinez','2026-03-20',false),
('UCF.02.01','Data Encryption at Rest',         'Data Protection',    ARRAY['SOC2 CC6.7','ISO A.10.1','NIST SC-28','GDPR Art.32','PCI DSS 3.5'],     'partial',      68,'A. Patel',   '2026-04-20',false),
('UCF.02.02','Data Loss Prevention',            'Data Protection',    ARRAY['SOC2 CC6.6','ISO A.8.3','NIST SI-12','PCI DSS 12.3'],                   'ineffective',  45,'A. Patel',   '2026-04-10',false),
('UCF.03.01','Vulnerability Scanning',          'Vulnerability Mgmt', ARRAY['NIST RA-5','ISO A.12.6','SOC2 CC7.1','PCI DSS 11.3'],                  'effective',    88,'T. Williams','2026-05-20',false),
('UCF.03.02','Patch Management Process',        'Vulnerability Mgmt', ARRAY['NIST SI-2','ISO A.12.6','SOC2 CC7.1','PCI DSS 6.3'],                   'ineffective',  41,'T. Williams','2026-05-01',false),
('UCF.04.01','Incident Response Plan',          'Incident Response',  ARRAY['NIST IR-8','ISO A.16.1','SOC2 CC7.3','PCI DSS 12.10'],                 'effective',    87,'K. Thompson','2026-04-30',false),
('UCF.05.01','Network Segmentation',            'Network Security',   ARRAY['NIST SC-7','NIST AC-3','ISO A.13.1','SOC2 CC6.6','PCI DSS 1.3'],       'partial',      71,'A. Patel',   '2026-04-15',false),
('UCF.06.01','Third Party Risk Assessment',     'Vendor Mgmt',        ARRAY['ISO A.15.2','SOC2 CC9.2','GDPR Art.28','PCI DSS 12.8'],                'partial',      63,'S. Chen',    '2026-03-10',false),
('UCF.06.02','Vendor Questionnaire Process',    'Vendor Mgmt',        ARRAY['ISO A.15.1','SOC2 CC9.1','PCI DSS 12.8'],                              'partial',      62,'S. Chen',    '2026-03-15',false),
('UCF.07.01','Policy Review Process',           'Policy Mgmt',        ARRAY['ISO A.5.1','SOC2 CC5.3','PCI DSS 12.1'],                               'partial',      74,'S. Chen',    '2026-04-05',false),
('UCF.07.02','Security Awareness Training',     'HR Security',        ARRAY['ISO A.7.2','SOC2 CC1.4','NIST AT-2','PCI DSS 12.6'],                  'effective',    89,'J. Martinez','2026-05-10',false),
('UCF.08.01','Log Monitoring & SIEM',           'Detection',          ARRAY['NIST SI-4','ISO A.12.4','SOC2 CC7.2','PCI DSS 10.7'],                  'effective',    85,'T. Williams','2026-05-22',false),
('UCF.08.02','Change Management',               'Operations',         ARRAY['SOC2 CC8.1','ISO A.12.1','NIST CM-3','NIST CM-8','PCI DSS 6.5'],       'effective',    91,'K. Thompson','2026-05-18',false),
('UCF.09.01','Business Continuity Plan',        'BCM',                ARRAY['ISO A.17.1','SOC2 A1.2','NIST CP-2','NIST CP-9','PCI DSS 12.10'],      'partial',      69,'K. Thompson','2026-04-25',false),
('UCF.AI.01','AI Model Governance',             'AI Governance',      ARRAY['NIST AI 1.6','ISO/IEC 42001','EU AI Act Art.9'],                        'ineffective',  29,'A. Patel',   '2026-02-10',true),
('UCF.AI.02','AI Data Privacy & Bias Controls', 'AI Governance',      ARRAY['GDPR Art.22','NIST AI 2.2','EU AI Act Art.10'],                        'ineffective',  33,'A. Patel',   '2026-01-20',true),
('UCF.AI.03','AI Security Controls',            'AI Security',        ARRAY['NIST AI 2.5','ISO/IEC 42001','OWASP LLM Top 10'],                      'not_tested',    0,'T. Williams', null,         true),
('UCF.AI.04','AI Vendor Risk Management',       'AI Governance',      ARRAY['ISO A.15.1','NIST AI 1.4','EU AI Act Art.28'],                         'partial',      51,'S. Chen',    '2026-03-05',true),
('UCF.AI.05','AI Incident Response',            'AI Security',        ARRAY['NIST IR-8','NIST AI 2.7','EU AI Act Art.62'],                          'not_tested',    0,'K. Thompson', null,         true),
('UCF.AI.06','AI Risk Categorization & Use Case Register','AI Governance',ARRAY['NIST AI RMF MAP 2.1','EU AI Act Art.6','ISO/IEC 42001 6.1'],       'not_tested',    0,'A. Patel',    null,         true),
('UCF.AI.07','AI Model Performance Monitoring', 'AI Security',        ARRAY['NIST AI RMF MEASURE 3.2','ISO/IEC 42001 9.1','EU AI Act Art.72'],      'not_tested',    0,'T. Williams', null,         true),
('UCF.AI.08','AI Explainability & Transparency','AI Governance',      ARRAY['NIST AI RMF MEASURE 3.4','EU AI Act Art.13','GDPR Art.22'],            'not_tested',    0,'A. Patel',    null,         true),
('UCF.AI.09','AI Data Provenance & Lineage',    'AI Security',        ARRAY['NIST AI RMF MAP 2.4','GDPR Art.5','ISO/IEC 42001 8.4'],               'not_tested',    0,'A. Patel',    null,         true),
('UCF.AI.10','AI Model Lifecycle Management',   'AI Governance',      ARRAY['NIST AI RMF MANAGE 4.3','EU AI Act Art.9','ISO/IEC 42001 8.3'],        'partial',      45,'K. Thompson','2026-02-20', true)
ON CONFLICT (id) DO UPDATE SET
  name=EXCLUDED.name, frameworks=EXCLUDED.frameworks,
  effectiveness=EXCLUDED.effectiveness, score=EXCLUDED.score, updated_at=NOW();

-- ─── Vulnerabilities ──────────────────────────────────────────────────────────
-- V-010: drawn from GRC-Portfolio incident scenario 2 (API misconfiguration)
-- V-011: drawn from circleci-aws-opa-lab — S3 encryption gap caught by OPA pipeline
INSERT INTO vulnerabilities (id, cve, title, severity, cvss, status, asset, control_id, discovered, source, is_ai) VALUES
('V-001','CVE-2024-1234','Log4Shell RCE in log4j-core',                             'Critical',10.0,'Open',        'prod-api-01',        'UCF.03.02','2026-05-10','manual',         false),
('V-002','CVE-2024-5678','OpenSSL buffer overflow',                                  'High',    8.1, 'In Progress', 'auth-service',       'UCF.03.02','2026-05-12','manual',         false),
('V-003','CVE-2024-9012','SMB lateral movement path',                                'Critical', 9.3,'Open',        'corp-workstations',  'UCF.05.01','2026-05-08','manual',         false),
('V-004','CVE-2024-3456','nginx path traversal',                                     'Medium',  6.5, 'Patched',     'web-proxy',          'UCF.03.01','2026-05-15','qualys',         false),
('V-005','CVE-2024-7890','AWS IAM privilege escalation',                             'High',    8.8, 'Open',        'aws-prod',           'UCF.01.02','2026-05-14','aws_security_hub',false),
('V-006','CVE-2024-2468','Docker container escape',                                  'High',    7.9, 'In Progress', 'k8s-cluster',        'UCF.05.01','2026-05-18','manual',         false),
('V-007','CVE-2024-1357','Unencrypted secrets in env vars',                          'Medium',  6.2, 'Open',        'ci-pipeline',        'UCF.02.01','2026-05-20','manual',         false),
('V-008','LLM-2024-001', 'Prompt injection in AI chat endpoint',                     'High',    8.0, 'Open',        'ai-assistant-api',   'UCF.AI.03','2026-05-25','manual',         true),
('V-009','LLM-2024-002', 'AI model training data exfiltration',                      'Critical', 9.1,'Open',        'ml-training-env',    'UCF.AI.02','2026-05-28','manual',         true),
('V-010',null,           'Unauthenticated API endpoint exposed customer metadata',   'High',    8.2, 'Patched',     'partner-api-gateway','UCF.01.01','2026-05-20','manual',         false),
('V-011',null,           'S3 bucket missing server-side encryption — OPA violation', 'Medium',  5.9, 'Patched',     'data-archive-s3',    'UCF.02.01','2026-05-22','aws_security_hub',false)
ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, updated_at=NOW();

-- ─── Incidents ────────────────────────────────────────────────────────────────
-- INC-004: enriched from GRC-Portfolio phishing scenario 1
--   (spoofed security portal, credential theft, malicious forwarding rules)
-- INC-009: from scenario 2 — unauthenticated API, 20k customer records
-- INC-010: from scenario 3 — VPN compromise → lateral movement
-- INC-011: from scenario 4 — third-party SIEM forwarding failure, 6-hour gap
INSERT INTO incidents (id, title, severity, status, type, detected, mttr, control_id, affected_systems, source, is_ai) VALUES
('INC-001','Unauthorized SSH access attempt — three privileged accounts targeted',   'Critical','Resolved',    'Intrusion',     '2026-05-28 09:00:00+00','4h', 'UCF.01.01',3, 'splunk',false),
('INC-002','Sensitive data exfiltration alert — customer records staging bucket',    'High',    'Investigating','Data Breach',   '2026-05-30 14:00:00+00',null, 'UCF.02.02',1, 'splunk',false),
('INC-003','Ransomware execution blocked by endpoint — two hosts quarantined',       'Critical','Contained',   'Malware',       '2026-05-29 03:00:00+00',null, 'UCF.08.01',2, 'splunk',false),
('INC-004','Phishing attack — spoofed security portal, credentials stolen, malicious forwarding rules created','Medium','Resolved','Phishing','2026-05-27 11:00:00+00','6h','UCF.07.02',1,'manual',false),
('INC-005','Vendor API key exposed in application logs — third-party notified',      'High',    'Open',        'Data Exposure', '2026-05-31 08:00:00+00',null, 'UCF.06.02',1, 'manual',false),
('INC-006','Privileged account anomaly — after-hours access to financial systems',   'High',    'Investigating','Insider Threat','2026-05-30 16:00:00+00',null, 'UCF.01.02',4, 'splunk',false),
('INC-007','AI model returned PII in response — prompt boundary bypass confirmed',   'High',    'Open',        'AI Data Leak',  '2026-05-31 10:00:00+00',null, 'UCF.AI.02',1, 'manual',true),
('INC-008','LLM hallucination produced fabricated compliance evidence in report',    'Medium',  'Investigating','AI Governance', '2026-05-29 13:00:00+00',null, 'UCF.AI.01',1, 'manual',true),
('INC-009','Unauthenticated partner API endpoint — ~20,000 customer metadata records exposed','High','Resolved','API Misconfiguration','2026-05-20 09:00:00+00','3h','UCF.01.01',1,'manual',false),
('INC-010','VPN credential compromise — attacker achieved lateral movement across internal segment','Critical','Investigating','Intrusion','2026-05-31 06:00:00+00',null,'UCF.01.02',8,'splunk',false),
('INC-011','Third-party SIEM log forwarding failure — 6-hour detection gap on firewall events','High','Resolved','Monitoring Gap','2026-05-26 14:00:00+00','8h','UCF.08.01',0,'manual',false)
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, status=EXCLUDED.status, updated_at=NOW();

-- ─── Policies ─────────────────────────────────────────────────────────────────
-- document_url links to live GRC-Portfolio artefacts (GitHub)
-- POL-002: password-rotation-policy-based-on-risk.md
-- POL-004: Cyber Incident Response Plan.md + response-playbook.md
-- POL-005: third-party-contract-security-clauses.md
-- POL-010: vulnerability-management-lifecycle.md (new)
-- POL-011: Security Awareness Program Plan.md (new)
INSERT INTO policies (id, title, category, owner, status, review_date, exceptions, control_id, version, document_url, is_ai) VALUES
('POL-001','Acceptable Use Policy',                'Security',       'J. Martinez','Current',       '2026-09-30',2,'UCF.07.02','v3.2',null,false),
('POL-002','Password & Authentication Policy',     'Access Control', 'J. Martinez','Due for Review','2026-06-15',4,'UCF.01.01','v2.8',
  'https://github.com/ewelina-kowalska-oneill/GRC-Portfolio/blob/main/access-control/2.%20password-rotation-policy-based-on-risk.md',false),
('POL-003','Data Classification Policy',           'Data Management','A. Patel',   'Current',       '2026-08-20',1,'UCF.02.01','v4.1',null,false),
('POL-004','Incident Response Policy',             'Security Ops',   'K. Thompson','Current',       '2026-10-01',0,'UCF.04.01','v5.0',
  'https://github.com/ewelina-kowalska-oneill/GRC-Portfolio/blob/main/incident-response/Cyber%20Incident%20Response%20Plan.md',false),
('POL-005','Third Party Management Policy',        'Vendor Mgmt',    'S. Chen',    'Overdue',       '2026-04-30',3,'UCF.06.01','v2.1',
  'https://github.com/ewelina-kowalska-oneill/GRC-Portfolio/blob/main/third-party-risk/4.%20third-party-contract-security-clauses.md',false),
('POL-006','Data Loss Prevention Policy',          'Data Management','A. Patel',   'Due for Review','2026-06-20',5,'UCF.02.02','v1.9',null,false),
('POL-007','AI Usage & Governance Policy',         'AI Governance',  'A. Patel',   'Overdue',       '2026-03-31',0,'UCF.AI.01','v0.9',null,true),
('POL-008','AI Ethics & Bias Policy',              'AI Governance',  'A. Patel',   'Missing',        null,        0,'UCF.AI.02',null, null,true),
('POL-009','AI Vendor Risk Policy',                'AI Governance',  'S. Chen',    'Missing',        null,        0,'UCF.AI.04',null, null,true),
('POL-010','Vulnerability Management SOP',         'Security Ops',   'T. Williams','Current',       '2026-11-01',0,'UCF.03.01','v2.0',
  'https://github.com/ewelina-kowalska-oneill/GRC-Portfolio/blob/main/vulnerability-management/1.%20vulnerability-management-lifecycle.md',false),
('POL-011','Security Awareness Training Program',  'HR Security',    'J. Martinez','Current',       '2026-12-01',0,'UCF.07.02','v1.5',
  'https://github.com/ewelina-kowalska-oneill/GRC-Portfolio/blob/main/access-control/Security%20Awareness%20Program%20Plan.md',false)
ON CONFLICT (id) DO UPDATE SET
  status=EXCLUDED.status, exceptions=EXCLUDED.exceptions,
  document_url=EXCLUDED.document_url, updated_at=NOW();

-- ─── Vendors ──────────────────────────────────────────────────────────────────
INSERT INTO vendors (id, name, category, tier, risk_score, status, contract_expiry, data_shared, control_id, last_assessed, is_ai) VALUES
('TP-001','Salesforce', 'SaaS — CRM',           1,72,'Questionnaire Overdue','2026-12-31','Customer PII',    'UCF.06.02','2025-11-20',false),
('TP-002','AWS',        'Cloud Infrastructure',  1,35,'Compliant',           '2027-03-15','All Prod Data',   'UCF.06.01','2026-03-10',false),
('TP-003','Accenture',  'Professional Services', 2,58,'Review Pending',      '2026-09-30','Project Data',    'UCF.06.01','2026-01-15',false),
('TP-004','Twilio',     'Communications',        1,71,'SLA Breach',          '2026-08-15','Contact Data',    'UCF.06.01','2026-02-28',false),
('TP-005','Okta',       'Identity Provider',     1,42,'Compliant',           '2027-01-01','Identity Data',   'UCF.01.01','2026-05-01',false),
('TP-006','Snowflake',  'Data Warehouse',        1,61,'Review Pending',      '2026-07-20','Analytics Data',  'UCF.02.01','2026-01-30',false),
('TP-007','OpenAI',     'AI — LLM Provider',     1,81,'No Contract',          null,        'Prompts & Data', 'UCF.AI.04', null,        true),
('TP-008','Anthropic',  'AI — LLM Provider',     1,74,'Review Pending',      '2026-09-01','Prompts & Data',  'UCF.AI.04','2026-04-01',true),
('TP-009','Cohere',     'AI — Embeddings',       2,68,'Questionnaire Overdue','2026-10-31','Text Data',      'UCF.AI.04','2026-02-15',true)
ON CONFLICT (id) DO UPDATE SET
  risk_score=EXCLUDED.risk_score, status=EXCLUDED.status, updated_at=NOW();
