import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, CheckCircle,
  Grid, Search, Bell, Settings, User, Menu, Activity,
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap, Database,
  Lock, Globe, Eye, RefreshCw, Play, FileText,
  CheckSquare, Bug, Flame, BookOpen, Building2, Cpu,
  Users, Download, Award, BarChart2, X
} from 'lucide-react';
import { api } from './lib/api';
import { isLive } from './lib/supabase';
import { daysFromToday, PRIORITY_NAMES, PRIORITY_COLOR, SLA_DAYS } from './lib/vsrm';
import brand from './lib/brand';
import { riskSeed, computeHealthScore } from './data/riskRegister';

// ─── Risk Detail Context ───────────────────────────────────────────────────────
const RiskDetailContext = createContext(null);
const useRiskDetail = () => useContext(RiskDetailContext);

// ─── Data Context ─────────────────────────────────────────────────────────────
const DataContext = createContext(null);

function useGRCData() {
  const ctx = useContext(DataContext);
  return {
    controls:   ctx?.controls   ?? controls,
    vulns:      ctx?.vulns      ?? vulns,
    incidents:  ctx?.incidents  ?? incidents,
    policies:   ctx?.policies   ?? policies,
    vendors:    ctx?.vendors    ?? vendors,
    frameworks: ctx?.frameworks ?? frameworks,
    isLive:     Boolean(ctx?.isLive),
  };
}

// ─── UCF Controls Library ─────────────────────────────────────────────────────
// Each control carries a UCF ID, cross-framework mappings, and effectiveness data.

const controls = [
  { id: 'UCF.01.01', name: 'Multi-Factor Authentication',      category: 'Access Control',     frameworks: ['SOC2 CC6.1','ISO A.9.4','NIST IA-5','GDPR Art.32'],        effectiveness: 'effective',    score: 92, owner: 'J. Martinez', lastTested: '2026-05-15', ai: false },
  { id: 'UCF.01.02', name: 'Privileged Access Management',     category: 'Access Control',     frameworks: ['SOC2 CC6.3','ISO A.9.2','NIST AC-6'],                       effectiveness: 'ineffective',  score: 38, owner: 'J. Martinez', lastTested: '2026-03-20', ai: false },
  { id: 'UCF.02.01', name: 'Data Encryption at Rest',          category: 'Data Protection',    frameworks: ['SOC2 CC6.7','ISO A.10.1','NIST SC-28','GDPR Art.32'],       effectiveness: 'partial',      score: 68, owner: 'A. Patel',    lastTested: '2026-04-20', ai: false },
  { id: 'UCF.02.02', name: 'Data Loss Prevention',             category: 'Data Protection',    frameworks: ['SOC2 CC6.6','ISO A.8.3','NIST SI-12'],                      effectiveness: 'ineffective',  score: 45, owner: 'A. Patel',    lastTested: '2026-04-10', ai: false },
  { id: 'UCF.03.01', name: 'Vulnerability Scanning',           category: 'Vulnerability Mgmt', frameworks: ['NIST RA-5','ISO A.12.6','SOC2 CC7.1'],                      effectiveness: 'effective',    score: 88, owner: 'T. Williams', lastTested: '2026-05-20', ai: false },
  { id: 'UCF.03.02', name: 'Patch Management Process',         category: 'Vulnerability Mgmt', frameworks: ['NIST SI-2','ISO A.12.6','SOC2 CC7.1'],                      effectiveness: 'ineffective',  score: 41, owner: 'T. Williams', lastTested: '2026-05-01', ai: false },
  { id: 'UCF.04.01', name: 'Incident Response Plan',           category: 'Incident Response',  frameworks: ['NIST IR-8','ISO A.16.1','SOC2 CC7.3'],                      effectiveness: 'effective',    score: 87, owner: 'K. Thompson', lastTested: '2026-04-30', ai: false },
  { id: 'UCF.05.01', name: 'Network Segmentation',             category: 'Network Security',   frameworks: ['NIST SC-7','ISO A.13.1','SOC2 CC6.6'],                      effectiveness: 'partial',      score: 71, owner: 'A. Patel',    lastTested: '2026-04-15', ai: false },
  { id: 'UCF.06.01', name: 'Third Party Risk Assessment',      category: 'Vendor Mgmt',        frameworks: ['ISO A.15.2','SOC2 CC9.2','GDPR Art.28'],                    effectiveness: 'partial',      score: 63, owner: 'S. Chen',     lastTested: '2026-03-10', ai: false },
  { id: 'UCF.06.02', name: 'Vendor Questionnaire Process',     category: 'Vendor Mgmt',        frameworks: ['ISO A.15.1','SOC2 CC9.1'],                                  effectiveness: 'partial',      score: 62, owner: 'S. Chen',     lastTested: '2026-03-15', ai: false },
  { id: 'UCF.07.01', name: 'Policy Review Process',            category: 'Policy Mgmt',        frameworks: ['ISO A.5.1','SOC2 CC5.3'],                                   effectiveness: 'partial',      score: 74, owner: 'S. Chen',     lastTested: '2026-04-05', ai: false },
  { id: 'UCF.07.02', name: 'Security Awareness Training',      category: 'HR Security',        frameworks: ['ISO A.7.2','SOC2 CC1.4','NIST AT-2'],                       effectiveness: 'effective',    score: 89, owner: 'J. Martinez', lastTested: '2026-05-10', ai: false },
  { id: 'UCF.08.01', name: 'Log Monitoring & SIEM',            category: 'Detection',          frameworks: ['NIST SI-4','ISO A.12.4','SOC2 CC7.2'],                      effectiveness: 'effective',    score: 85, owner: 'T. Williams', lastTested: '2026-05-22', ai: false },
  { id: 'UCF.08.02', name: 'Change Management',                category: 'Operations',         frameworks: ['SOC2 CC8.1','ISO A.12.1','NIST CM-3'],                      effectiveness: 'effective',    score: 91, owner: 'K. Thompson', lastTested: '2026-05-18', ai: false },
  { id: 'UCF.09.01', name: 'Business Continuity Plan',         category: 'BCM',                frameworks: ['ISO A.17.1','SOC2 A1.2','NIST CP-2'],                       effectiveness: 'partial',      score: 69, owner: 'K. Thompson', lastTested: '2026-04-25', ai: false },
  // AI Controls
  { id: 'UCF.AI.01', name: 'AI Model Governance',              category: 'AI Governance',      frameworks: ['NIST AI 1.6','ISO/IEC 42001','EU AI Act Art.9'],             effectiveness: 'ineffective',  score: 29, owner: 'A. Patel',    lastTested: '2026-02-10', ai: true },
  { id: 'UCF.AI.02', name: 'AI Data Privacy & Bias Controls',  category: 'AI Governance',      frameworks: ['GDPR Art.22','NIST AI 2.2','EU AI Act Art.10'],             effectiveness: 'ineffective',  score: 33, owner: 'A. Patel',    lastTested: '2026-01-20', ai: true },
  { id: 'UCF.AI.03', name: 'AI Security Controls',             category: 'AI Security',        frameworks: ['NIST AI 2.5','ISO/IEC 42001','OWASP LLM Top 10'],           effectiveness: 'not_tested',   score: 0,  owner: 'T. Williams', lastTested: null,           ai: true },
  { id: 'UCF.AI.04', name: 'AI Vendor Risk Management',        category: 'AI Governance',      frameworks: ['ISO A.15.1','NIST AI 1.4','EU AI Act Art.28'],              effectiveness: 'partial',      score: 51, owner: 'S. Chen',     lastTested: '2026-03-05', ai: true },
  { id: 'UCF.AI.05', name: 'AI Incident Response',             category: 'AI Security',        frameworks: ['NIST IR-8','NIST AI 2.7','EU AI Act Art.62'],               effectiveness: 'not_tested',   score: 0,  owner: 'K. Thompson', lastTested: null,           ai: true },
  { id: 'UCF.AI.06', name: 'AI Risk Categorization & Use Case Register', category: 'AI Governance', frameworks: ['NIST AI RMF MAP 2.1','EU AI Act Art.6','ISO/IEC 42001 6.1'], effectiveness: 'not_tested', score: 0,  owner: 'A. Patel',    lastTested: null,           ai: true },
  { id: 'UCF.AI.07', name: 'AI Model Performance Monitoring',  category: 'AI Security',        frameworks: ['NIST AI RMF MEASURE 3.2','ISO/IEC 42001 9.1','EU AI Act Art.72'], effectiveness: 'not_tested', score: 0, owner: 'T. Williams', lastTested: null,           ai: true },
  { id: 'UCF.AI.08', name: 'AI Explainability & Transparency', category: 'AI Governance',      frameworks: ['NIST AI RMF MEASURE 3.4','EU AI Act Art.13','GDPR Art.22'],   effectiveness: 'not_tested',   score: 0,  owner: 'A. Patel',    lastTested: null,           ai: true },
  { id: 'UCF.AI.09', name: 'AI Data Provenance & Lineage',     category: 'AI Security',        frameworks: ['NIST AI RMF MAP 2.4','GDPR Art.5','ISO/IEC 42001 8.4'],       effectiveness: 'not_tested',   score: 0,  owner: 'A. Patel',    lastTested: null,           ai: true },
  { id: 'UCF.AI.10', name: 'AI Model Lifecycle Management',    category: 'AI Governance',      frameworks: ['NIST AI RMF MANAGE 4.3','EU AI Act Art.9','ISO/IEC 42001 8.3'], effectiveness: 'partial',     score: 45, owner: 'K. Thompson', lastTested: '2026-02-20', ai: true },
];

const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));

// ─── Module Data ──────────────────────────────────────────────────────────────

const vulns = [
  // VSRM: Production + Public + CVSS 10.0 + Actively Exploited → P0
  { id: 'V-001', cve: 'CVE-2024-1234', title: 'Log4Shell RCE in log4j-core',
    severity: 'Critical', cvss: 10.0, status: 'Open', asset: 'prod-api-01',
    controlId: 'UCF.03.02', discovered: '2026-05-10',
    priority: 'P0', secTier: 0, environment: 'Production', exposure: 'Public',
    exploitability: 'Actively Exploited', isCisaKev: true,
    assignedTo: 'T. Williams', dueDate: '2026-05-11' },

  // VSRM: Production + Public + CVSS 8.1 + Actively Exploited → P1
  { id: 'V-002', cve: 'CVE-2024-5678', title: 'OpenSSL buffer overflow',
    severity: 'High', cvss: 8.1, status: 'In Progress', asset: 'auth-service',
    controlId: 'UCF.03.02', discovered: '2026-05-12',
    priority: 'P1', secTier: 0, environment: 'Production', exposure: 'Public',
    exploitability: 'Actively Exploited', isCisaKev: false,
    assignedTo: 'T. Williams', dueDate: '2026-05-26' },

  // VSRM: Production + Internal + CVSS 9.3 + Mature Exploit → P2
  { id: 'V-003', cve: 'CVE-2024-9012', title: 'SMB lateral movement path',
    severity: 'Critical', cvss: 9.3, status: 'Open', asset: 'corp-workstations',
    controlId: 'UCF.05.01', discovered: '2026-05-08',
    priority: 'P2', secTier: 1, environment: 'Production', exposure: 'Internal',
    exploitability: 'Mature Exploit', isCisaKev: false,
    assignedTo: null, dueDate: '2026-06-07' },

  // VSRM: Production + Public + CVSS 6.5 + POC → P3 (Patched)
  { id: 'V-004', cve: 'CVE-2024-3456', title: 'nginx path traversal',
    severity: 'Medium', cvss: 6.5, status: 'Patched', asset: 'web-proxy',
    controlId: 'UCF.03.01', discovered: '2026-05-15', patchedDate: '2026-05-22',
    priority: 'P3', secTier: 0, environment: 'Production', exposure: 'Public',
    exploitability: 'POC', isCisaKev: false,
    assignedTo: 'T. Williams', dueDate: '2026-07-13' },

  // VSRM: Production + Internet + CVSS 8.8 + Mature Exploit → P2
  { id: 'V-005', cve: 'CVE-2024-7890', title: 'AWS IAM privilege escalation',
    severity: 'High', cvss: 8.8, status: 'Open', asset: 'aws-prod',
    controlId: 'UCF.01.02', discovered: '2026-05-14',
    priority: 'P2', secTier: 0, environment: 'Production', exposure: 'Internet',
    exploitability: 'Mature Exploit', isCisaKev: false,
    assignedTo: 'J. Martinez', dueDate: '2026-06-13' },

  // VSRM: Production + Internal + CVSS 7.9 + POC → P3
  { id: 'V-006', cve: 'CVE-2024-2468', title: 'Docker container escape',
    severity: 'High', cvss: 7.9, status: 'In Progress', asset: 'k8s-cluster',
    controlId: 'UCF.05.01', discovered: '2026-05-18',
    priority: 'P3', secTier: 1, environment: 'Production', exposure: 'Internal',
    exploitability: 'POC', isCisaKev: false,
    assignedTo: 'T. Williams', dueDate: '2026-07-17' },

  // VSRM: Dev/Stage + Any + CVSS 6.2 + No Exploit → P4
  { id: 'V-007', cve: 'CVE-2024-1357', title: 'Unencrypted secrets in env vars',
    severity: 'Medium', cvss: 6.2, status: 'Open', asset: 'ci-pipeline',
    controlId: 'UCF.02.01', discovered: '2026-05-20',
    priority: 'P4', secTier: 2, environment: 'Dev/Stage', exposure: 'Internal',
    exploitability: 'No Exploit', isCisaKev: false,
    assignedTo: null, dueDate: '2026-08-18' },

  // VSRM: Production + Internet + CVSS 8.0 + Mature Exploit → P2 (AI)
  { id: 'V-008', cve: 'LLM-2024-001', title: 'Prompt injection in AI chat endpoint',
    severity: 'High', cvss: 8.0, status: 'Open', asset: 'ai-assistant-api',
    controlId: 'UCF.AI.03', discovered: '2026-05-25', ai: true,
    priority: 'P2', secTier: 0, environment: 'Production', exposure: 'Internet',
    exploitability: 'Mature Exploit', isCisaKev: false,
    assignedTo: 'A. Patel', dueDate: '2026-06-24' },

  // VSRM: Dev/Stage + Any + CVSS 9.1 + POC → P3 (AI)
  { id: 'V-009', cve: 'LLM-2024-002', title: 'AI model training data exfiltration',
    severity: 'Critical', cvss: 9.1, status: 'Open', asset: 'ml-training-env',
    controlId: 'UCF.AI.02', discovered: '2026-05-28', ai: true,
    priority: 'P3', secTier: 1, environment: 'Dev/Stage', exposure: 'Internal',
    exploitability: 'POC', isCisaKev: false,
    assignedTo: null, dueDate: '2026-07-27' },

  // EOL: Production public-facing runtime — P1 (no patch path, permanent exposure)
  { id: 'V-010', cve: null, title: 'Node.js 16 — End of Life (Apr 2024)',
    severity: 'High', cvss: null, status: 'Open', asset: 'api-gateway',
    controlId: 'UCF.03.02', discovered: '2026-05-30', eol: true, eolDate: '2024-04-30',
    priority: 'P1', secTier: 0, environment: 'Production', exposure: 'Public',
    exploitability: 'No patch path', isCisaKev: false,
    assignedTo: null, dueDate: '2026-06-13',
    eolNote: 'No security patches issued after Apr 2024. All new CVEs permanently unmitigable. Upgrade to Node.js 20 LTS required.' },

  // EOL: AI/ML runtime in Dev/Stage — P2 (internal exposure, AI dependency)
  { id: 'V-011', cve: null, title: 'Python 3.8 — End of Life (Oct 2024)',
    severity: 'High', cvss: null, status: 'Open', asset: 'ml-training-env',
    controlId: 'UCF.AI.02', discovered: '2026-05-30', eol: true, eolDate: '2024-10-31', ai: true,
    priority: 'P2', secTier: 1, environment: 'Dev/Stage', exposure: 'Internal',
    exploitability: 'No patch path', isCisaKev: false,
    assignedTo: null, dueDate: '2026-07-01',
    eolNote: 'ML training pipeline runtime. No security patches. Upgrade to Python 3.11 LTS. Blocks EU AI Act Art. 9 risk management requirements.' },
];

const incidents = [
  { id: 'INC-001', title: 'Unauthorized SSH access attempt',           severity: 'Critical', status: 'Resolved',     type: 'Intrusion',     detected: '2026-05-28', mttr: '4h',  controlId: 'UCF.01.01', systems: 3 },
  { id: 'INC-002', title: 'Sensitive data exfiltration alert',         severity: 'High',     status: 'Investigating', type: 'Data Breach',   detected: '2026-05-30', mttr: null,  controlId: 'UCF.02.02', systems: 1 },
  { id: 'INC-003', title: 'Ransomware execution blocked',              severity: 'Critical', status: 'Contained',    type: 'Malware',       detected: '2026-05-29', mttr: null,  controlId: 'UCF.08.01', systems: 2 },
  { id: 'INC-004', title: 'Phishing campaign · 12 users clicked',      severity: 'Medium',   status: 'Resolved',     type: 'Phishing',      detected: '2026-05-27', mttr: '2h',  controlId: 'UCF.07.02', systems: 12 },
  { id: 'INC-005', title: 'Vendor API key exposed in logs',            severity: 'High',     status: 'Open',         type: 'Data Exposure', detected: '2026-05-31', mttr: null,  controlId: 'UCF.06.02', systems: 1 },
  { id: 'INC-006', title: 'Privileged account anomaly detected',       severity: 'High',     status: 'Investigating', type: 'Insider Threat',detected: '2026-05-30', mttr: null,  controlId: 'UCF.01.02', systems: 4 },
  { id: 'INC-007', title: 'AI model returned PII in response',         severity: 'High',     status: 'Open',         type: 'AI Data Leak',  detected: '2026-05-31', mttr: null,  controlId: 'UCF.AI.02', systems: 1, ai: true },
  { id: 'INC-008', title: 'LLM hallucination caused compliance error', severity: 'Medium',   status: 'Investigating', type: 'AI Governance', detected: '2026-05-29', mttr: null,  controlId: 'UCF.AI.01', systems: 1, ai: true },
];

const policies = [
  { id: 'POL-001', title: 'Acceptable Use Policy',             category: 'Security',          owner: 'J. Martinez', status: 'Current',         reviewDate: '2026-09-30', exceptions: 2, controlId: 'UCF.07.02', version: 'v3.2' },
  { id: 'POL-002', title: 'Password & Authentication Policy',  category: 'Access Control',    owner: 'J. Martinez', status: 'Due for Review',   reviewDate: '2026-06-15', exceptions: 4, controlId: 'UCF.01.01', version: 'v2.8' },
  { id: 'POL-003', title: 'Data Classification Policy',        category: 'Data Management',   owner: 'A. Patel',    status: 'Current',         reviewDate: '2026-08-20', exceptions: 1, controlId: 'UCF.02.01', version: 'v4.1' },
  { id: 'POL-004', title: 'Incident Response Policy',          category: 'Security Ops',      owner: 'K. Thompson', status: 'Current',         reviewDate: '2026-10-01', exceptions: 0, controlId: 'UCF.04.01', version: 'v5.0' },
  { id: 'POL-005', title: 'Third Party Management Policy',     category: 'Vendor Mgmt',       owner: 'S. Chen',     status: 'Overdue',         reviewDate: '2026-04-30', exceptions: 3, controlId: 'UCF.06.01', version: 'v2.1' },
  { id: 'POL-006', title: 'Data Loss Prevention Policy',       category: 'Data Management',   owner: 'A. Patel',    status: 'Due for Review',   reviewDate: '2026-06-20', exceptions: 5, controlId: 'UCF.02.02', version: 'v1.9' },
  { id: 'POL-007', title: 'AI Usage & Governance Policy',      category: 'AI Governance',     owner: 'A. Patel',    status: 'Overdue',         reviewDate: '2026-03-31', exceptions: 0, controlId: 'UCF.AI.01', version: 'v0.9', ai: true },
  { id: 'POL-008', title: 'AI Ethics & Bias Policy',           category: 'AI Governance',     owner: 'A. Patel',    status: 'Missing',         reviewDate: null,         exceptions: 0, controlId: 'UCF.AI.02', version: null,   ai: true },
  { id: 'POL-009', title: 'AI Vendor Risk Policy',             category: 'AI Governance',     owner: 'S. Chen',     status: 'Missing',         reviewDate: null,         exceptions: 0, controlId: 'UCF.AI.04', version: null,   ai: true },
];

const vendors = [
  { id: 'TP-001', name: 'Salesforce',  category: 'SaaS · CRM',              tier: 1, riskScore: 72, status: 'Questionnaire Overdue', contractExpiry: '2026-12-31', dataShared: 'Customer PII',     controlId: 'UCF.06.02', lastAssessed: '2025-11-20', ai: false },
  { id: 'TP-002', name: 'AWS',         category: 'Cloud Infrastructure',     tier: 1, riskScore: 35, status: 'Compliant',             contractExpiry: '2027-03-15', dataShared: 'All Prod Data',    controlId: 'UCF.06.01', lastAssessed: '2026-03-10', ai: false },
  { id: 'TP-003', name: 'Accenture',   category: 'Professional Services',    tier: 2, riskScore: 58, status: 'Review Pending',        contractExpiry: '2026-09-30', dataShared: 'Project Data',     controlId: 'UCF.06.01', lastAssessed: '2026-01-15', ai: false },
  { id: 'TP-004', name: 'CommsCo',     category: 'Communications',           tier: 1, riskScore: 67, status: 'SLA Breach',            contractExpiry: '2026-08-15', dataShared: 'Contact Data',     controlId: 'UCF.06.01', lastAssessed: '2026-02-28', ai: false },
  { id: 'TP-005', name: 'Okta',        category: 'Identity Provider',        tier: 1, riskScore: 42, status: 'Compliant',             contractExpiry: '2027-01-01', dataShared: 'Identity Data',    controlId: 'UCF.01.01', lastAssessed: '2026-05-01', ai: false },
  { id: 'TP-006', name: 'Snowflake',   category: 'Data Warehouse',           tier: 1, riskScore: 61, status: 'Review Pending',        contractExpiry: '2026-07-20', dataShared: 'Analytics Data',   controlId: 'UCF.02.01', lastAssessed: '2026-01-30', ai: false },
  { id: 'TP-007', name: 'OpenAI',      category: 'AI · LLM Provider',        tier: 1, riskScore: 81, status: 'No Contract',           contractExpiry: null,         dataShared: 'Prompts & Data',   controlId: 'UCF.AI.04', lastAssessed: null,         ai: true },
  { id: 'TP-008', name: 'Anthropic',   category: 'AI · LLM Provider',        tier: 1, riskScore: 74, status: 'Review Pending',        contractExpiry: '2026-09-01', dataShared: 'Prompts & Data',   controlId: 'UCF.AI.04', lastAssessed: '2026-04-01', ai: true },
  { id: 'TP-009', name: 'Cohere',      category: 'AI · Embeddings',          tier: 2, riskScore: 68, status: 'Questionnaire Overdue', contractExpiry: '2026-10-31', dataShared: 'Text Data',        controlId: 'UCF.AI.04', lastAssessed: '2026-02-15', ai: true },
];

// ─── Chart/Overview Data ──────────────────────────────────────────────────────

const frameworks = [
  { name: 'SOC 2 Type II', progress: 94, controls: 64, passing: 60, color: '#2563EB', status: 'Certified' },
  { name: 'ISO 27001',     progress: 87, controls: 93, passing: 81, color: '#7C3AED', status: 'In Progress' },
  { name: 'GDPR',          progress: 91, controls: 47, passing: 43, color: '#0891B2', status: 'Compliant' },
  { name: 'HIPAA',         progress: 78, controls: 54, passing: 42, color: '#059669', status: 'In Progress' },
  { name: 'PCI DSS',       progress: 83, controls: 89, passing: 74, color: '#D97706', status: 'Compliant' },
  { name: 'NIST CSF',      progress: 88, controls: 108,passing: 95, color: '#DC2626', status: 'Compliant' },
  { name: 'EU AI Act',     progress: 22, controls: 31, passing: 7,  color: '#9333EA', status: 'Gap' },
  { name: 'ISO/IEC 42001', progress: 18, controls: 44, passing: 8,  color: '#0EA5E9', status: 'Gap' },
];

// ─── Team Definitions (Leadership Scorecard) ─────────────────────────────────

const teams = [
  {
    id: 'identity',      name: 'Identity & Access',       lead: 'J. Martinez', dept: 'Security Engineering',
    color: '#2563EB',    icon: Lock,
    controls: ['UCF.01.01','UCF.01.02','UCF.07.02'],
  },
  {
    id: 'data',          name: 'Data Protection',          lead: 'A. Patel',    dept: 'Security Engineering',
    color: '#7C3AED',    icon: Shield,
    controls: ['UCF.02.01','UCF.02.02','UCF.AI.01','UCF.AI.02','UCF.AI.06','UCF.AI.08','UCF.AI.09'],
  },
  {
    id: 'infra',         name: 'Infrastructure Security',  lead: 'T. Williams', dept: 'Platform Engineering',
    color: '#059669',    icon: Database,
    controls: ['UCF.03.01','UCF.03.02','UCF.08.01','UCF.AI.03','UCF.AI.07'],
  },
  {
    id: 'secops',        name: 'Security Operations',      lead: 'K. Thompson', dept: 'Security Operations',
    color: '#D97706',    icon: Activity,
    controls: ['UCF.04.01','UCF.08.02','UCF.09.01','UCF.AI.05','UCF.AI.10'],
  },
  {
    id: 'grc',           name: 'GRC & Vendor Risk',        lead: 'S. Chen',     dept: 'GRC',
    color: '#0891B2',    icon: FileText,
    controls: ['UCF.06.01','UCF.06.02','UCF.07.01','UCF.AI.04'],
  },
  {
    id: 'rd',            name: 'R&D / Product',            lead: 'Engineering Leads', dept: 'Product Engineering',
    color: '#DC2626',    icon: Cpu,
    controls: ['UCF.AI.03','UCF.AI.05','UCF.AI.07','UCF.03.01','UCF.05.01'],
  },
];

// ─── Risk Register Data ───────────────────────────────────────────────────────
// PRD bands (ISO 31000): Critical 20-25, High 12-19, Medium 6-11, Low 2-5
const RISK_APPETITE = { medium: 11, high: 19, critical: 24 };
const getRiskRating = s => s >= 20 ? 'Critical' : s >= 12 ? 'High' : s >= 6 ? 'Medium' : 'Low';
const getRiskColor  = s => s >= 20 ? '#EF4444' : s >= 12 ? '#F97316' : s >= 6 ? '#EAB308' : '#22C55E';
const getAppetite   = s => s > RISK_APPETITE.critical ? 'Significantly Exceeds' : s > RISK_APPETITE.high ? 'Exceeds' : s > RISK_APPETITE.medium ? 'Approaches' : 'Within';
// Response Decision SLAs
const RESPONSE_SLA  = { Critical:'7 days', High:'30 days', Medium:'60 days', Low:'90 days' };
// Approval authority for risk acceptance
const ACCEPT_AUTH   = { Critical:'C-Suite / SVP+', High:'VP+', Medium:'Director+', Low:'Manager+' };
const CTRL_EFF = {'UCF.01.01':92,'UCF.01.02':38,'UCF.02.02':45,'UCF.03.02':41,'UCF.AI.02':33,'UCF.AI.03':0,'UCF.AI.04':51,'UCF.AI.05':0,'UCF.04.01':87,'UCF.05.01':71,'UCF.06.01':63,'UCF.06.02':62,'UCF.07.01':74,'UCF.09.01':69,'UCF.AI.01':29};
const getBusinessImpact = (score) => {
  if (score >= 20) return { label: 'Existential',  color: 'bg-red-100 text-red-800',      hint: 'Potential fines >€20M or operational shutdown' };
  if (score >= 15) return { label: 'Significant',  color: 'bg-orange-100 text-orange-800', hint: 'Material revenue or reputational impact' };
  if (score >= 10) return { label: 'Moderate',     color: 'bg-amber-100 text-amber-800',   hint: 'Operational disruption, recoverable' };
  if (score >= 5)  return { label: 'Low',          color: 'bg-green-100 text-green-700',   hint: 'Contained, manageable impact' };
  return               { label: 'Negligible',  color: 'bg-gray-100 text-gray-600',     hint: 'Minimal business impact' };
};

// Four canonical risk records — single source of truth for all panels.
// Sample / illustrative data built from public threat intelligence.
const risks = riskSeed.map(r => {
  const inherentScore = r.likelihood * r.impact;
  const reductionFactor = r.controlIds.reduce((f,id) => f * (1 - ((CTRL_EFF[id]??50)/100)*0.5), 1);
  const residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
  const residualBand = getRiskRating(residualScore).toLowerCase();
  return { ...r, inherentScore, residualScore, residualBand };
});

// ─── Audit Management Data ────────────────────────────────────────────────────
const audits = [
  { id:'AUD-001', name:'SOC 2 Type II Annual Audit',        framework:'SOC 2',     auditor:'Deloitte',  status:'Scheduled',      startDate:'2026-07-15', endDate:'2026-08-30', readiness:94, scope:'Security, Availability, Confidentiality', color:'#2563EB' },
  { id:'AUD-002', name:'ISO 27001 Surveillance Audit',      framework:'ISO 27001', auditor:'BSI Group', status:'In Preparation', startDate:'2026-09-10', endDate:'2026-09-14', readiness:87, scope:'Full ISMS scope',                         color:'#7C3AED' },
  { id:'AUD-003', name:'EU AI Act Compliance Review',       framework:'EU AI Act', auditor:'Internal',  status:'Planning',       startDate:'2026-10-01', endDate:'2026-10-31', readiness:22, scope:'High-risk AI systems',                   color:'#DC2626' },
  { id:'AUD-004', name:'GDPR Annual Data Protection Audit', framework:'GDPR',      auditor:'PwC',       status:'Completed',      startDate:'2026-03-01', endDate:'2026-03-15', readiness:91, scope:'Data processing activities',             color:'#0891B2' },
  { id:'AUD-005', name:'PCI DSS QSA Assessment',            framework:'PCI DSS',   auditor:'Trustwave', status:'Scheduled',      startDate:'2026-11-01', endDate:'2026-11-30', readiness:83, scope:'Cardholder data environment',            color:'#D97706' },
];
const auditFindings = [
  { id:'FND-001', auditId:'AUD-004', title:'Data retention schedule not enforced in S3',     severity:'High',   controlId:'UCF.02.01', status:'In Remediation', dueDate:'2026-06-30', owner:'A. Patel'    },
  { id:'FND-002', auditId:'AUD-004', title:'Missing DPIA for new AI recommendation feature', severity:'High',   controlId:'UCF.AI.02', status:'Open',           dueDate:'2026-07-15', owner:'A. Patel'    },
  { id:'FND-003', auditId:'AUD-004', title:'Third party processor agreement gaps',            severity:'Medium', controlId:'UCF.06.01', status:'Resolved',       dueDate:'2026-05-30', owner:'S. Chen'     },
  { id:'FND-004', auditId:'AUD-004', title:'Cookie consent banners not granular enough',      severity:'Medium', controlId:'UCF.07.01', status:'In Remediation', dueDate:'2026-06-15', owner:'A. Patel'    },
  { id:'FND-005', auditId:'AUD-001', title:'Patch management SLA not formally documented',    severity:'Low',    controlId:'UCF.03.02', status:'Open',           dueDate:'2026-07-01', owner:'T. Williams' },
];

// ─── Evidence Locker Data ─────────────────────────────────────────────────────
const evidenceItems = [
  { id:'EVD-001', controlId:'UCF.01.01', type:'Screenshot',     name:'Okta MFA enforcement config',          uploadedBy:'J. Martinez', uploadDate:'2026-05-15', expiryDate:'2026-11-15', status:'Current'  },
  { id:'EVD-002', controlId:'UCF.01.01', type:'Policy Document', name:'Authentication Policy v2.8',           uploadedBy:'J. Martinez', uploadDate:'2026-04-01', expiryDate:'2026-10-01', status:'Current'  },
  { id:'EVD-003', controlId:'UCF.03.01', type:'Test Result',     name:'Qualys scan report May 2026',          uploadedBy:'T. Williams', uploadDate:'2026-05-20', expiryDate:'2026-06-20', status:'Expiring' },
  { id:'EVD-004', controlId:'UCF.08.01', type:'Configuration',   name:'Splunk SIEM alert rules export',       uploadedBy:'T. Williams', uploadDate:'2026-05-22', expiryDate:'2026-11-22', status:'Current'  },
  { id:'EVD-005', controlId:'UCF.04.01', type:'Test Result',     name:'IR tabletop exercise results Apr-26',  uploadedBy:'K. Thompson', uploadDate:'2026-04-30', expiryDate:'2026-10-30', status:'Current'  },
  { id:'EVD-006', controlId:'UCF.02.01', type:'Certificate',     name:'AWS KMS encryption compliance cert',   uploadedBy:'A. Patel',    uploadDate:'2026-04-20', expiryDate:'2026-04-20', status:'Expired'  },
  { id:'EVD-007', controlId:'UCF.07.02', type:'Training Record', name:'Security awareness completion report', uploadedBy:'J. Martinez', uploadDate:'2026-05-10', expiryDate:'2026-11-10', status:'Current'  },
  { id:'EVD-008', controlId:'UCF.06.01', type:'Assessment',      name:'AWS vendor risk assessment Q1-26',     uploadedBy:'S. Chen',     uploadDate:'2026-03-10', expiryDate:'2026-09-10', status:'Current'  },
  { id:'EVD-009', controlId:'UCF.08.02', type:'Policy Document', name:'Change management procedure v3.5',     uploadedBy:'K. Thompson', uploadDate:'2026-05-18', expiryDate:'2026-11-18', status:'Current'  },
  { id:'EVD-010', controlId:'UCF.AI.01', type:'Policy Document', name:'AI Governance Policy DRAFT v0.9',      uploadedBy:'A. Patel',    uploadDate:'2026-02-10', expiryDate:'2026-08-10', status:'Current'  },
];

// ─── Shared Components ────────────────────────────────────────────────────────

const effConfig = {
  effective:   { label: 'Effective',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: '#22C55E' },
  partial:     { label: 'Partial',     bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   bar: '#EAB308' },
  ineffective: { label: 'Ineffective', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     bar: '#EF4444' },
  not_tested:  { label: 'Not Tested',  bg: 'bg-gray-50',    text: 'text-gray-500',    border: 'border-gray-200',    bar: '#9CA3AF' },
};

function EffectivenessBadge({ effectiveness, score }) {
  const c = effConfig[effectiveness] || effConfig.not_tested;
  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border ${c.bg} ${c.border}`}>
      <div className="w-12 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, background: c.bar }} />
      </div>
      <span className={`text-xs font-semibold ${c.text} whitespace-nowrap`}>{c.label}</span>
      {score > 0 && <span className={`text-xs ${c.text} opacity-60`}>{score}%</span>}
    </div>
  );
}

function ControlCell({ controlId }) {
  const ctrl = ctrlMap[controlId];
  if (!ctrl) return <span className="text-xs text-gray-400">-</span>;
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="font-mono text-xs text-gray-400 flex-shrink-0">{ctrl.id}</span>
        {ctrl.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">AI</span>}
      </div>
      <p className="text-xs text-gray-600 truncate">{ctrl.name}</p>
    </div>
  );
}

function relativeTime(date) {
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function downloadCSV(filename, headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}

function Sparkline({ data, color = '#3B82F6', width = 60, height = 24 }) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="v" fill={color} radius={1} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const sparkData = {
  vulns:     [{v:8},{v:9},{v:10},{v:10}],
  incidents: [{v:5},{v:4},{v:6},{v:5}],
  policy:    [{v:4},{v:4},{v:5},{v:5}],
  health:    [{v:68},{v:69},{v:70},{v:71}],
};

function KPICard({ title, value, delta, deltaType, icon: Icon, color, subtitle, sparkData: sd, sparkColor }) {
  const isUp = deltaType === 'up';
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ background: color + '15' }}>
          <Icon size={18} style={{ color }} />
        </div>
        {delta && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-red-500' : 'text-emerald-500'}`}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {sd && (
        <div className="mt-2">
          <Sparkline data={sd} color={sparkColor || color} width={60} height={24} />
        </div>
      )}
    </div>
  );
}

function NextActionCard({ action, owner, deadline, urgency = 'high' }) {
  const colors = {
    high:   { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   label: 'Action Required' },
    medium: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700', label: 'Action This Week' },
    low:    { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-700',  label: 'Recommended' },
  };
  const c = colors[urgency] || colors.high;
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${c.bg} border ${c.border} rounded-xl`}>
      <Zap size={14} className={c.text + ' flex-shrink-0'} />
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-bold ${c.text} uppercase tracking-wide mr-2`}>{c.label}</span>
        <span className="text-sm text-gray-800">{action}</span>
      </div>
      {owner && <span className="text-xs text-gray-500 flex-shrink-0">{owner}</span>}
      {deadline && <span className={`text-xs font-semibold flex-shrink-0 ${c.text}`}>{deadline}</span>}
    </div>
  );
}

function DecisionTierBadge({ tier }) {
  const t = {
    'Board / CISO': 'bg-red-100 text-red-700',
    'VP+':          'bg-orange-100 text-orange-700',
    'Director+':    'bg-amber-100 text-amber-700',
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t[tier]||'bg-gray-100 text-gray-600'}`}>{tier}</span>;
}

function SeverityBadge({ severity }) {
  const s = {
    Critical:  'bg-red-100 text-red-800 border border-red-300',
    Severe:    'bg-red-50 text-red-700 border border-red-200',
    High:      'bg-orange-50 text-orange-700 border border-orange-200',
    Moderate:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Medium:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
    Low:       'bg-green-50 text-green-700 border border-green-200',
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${s[severity]||s.Low}`}>{severity}</span>;
}

function StatusBadge({ status }) {
  const s = {
    // Risk register workflow states (Risk Management Framework v1.0)
    'Submitted':           'bg-slate-100 text-slate-600',
    'In Review':           'bg-blue-50 text-blue-600',
    'Risk Assessment':     'bg-indigo-50 text-indigo-600',
    'Mitigating':          'bg-amber-50 text-amber-700',
    'Avoiding':            'bg-orange-50 text-orange-700',
    'Transferring':        'bg-purple-50 text-purple-700',
    'Accepting/Monitoring':'bg-teal-50 text-teal-700',
    'Done':                'bg-green-50 text-green-600',
    // Vuln / incident states
    'Open':                'bg-red-50 text-red-600',
    'In Progress':         'bg-blue-50 text-blue-600',
    'Investigating':       'bg-blue-50 text-blue-600',
    'Contained':           'bg-orange-50 text-orange-700',
    'In Treatment':        'bg-amber-50 text-amber-700',
    'Resolved':            'bg-green-50 text-green-600',
    'Patched':             'bg-green-50 text-green-600',
    // Policy states
    'Current':             'bg-green-50 text-green-600',
    'Due for Review':      'bg-amber-50 text-amber-700',
    'Overdue':             'bg-red-50 text-red-600',
    'Missing':             'bg-red-50 text-red-600',
    // Vendor states
    'Compliant':           'bg-green-50 text-green-600',
    'SLA Breach':          'bg-red-50 text-red-600',
    'No Contract':         'bg-red-50 text-red-600',
    'Review Pending':      'bg-amber-50 text-amber-700',
    'Questionnaire Overdue':'bg-orange-50 text-orange-700',
    // Audit / finding
    'Accepted':            'bg-teal-50 text-teal-700',
    'In Remediation':      'bg-amber-50 text-amber-700',
    'Scheduled':           'bg-blue-50 text-blue-600',
    'In Preparation':      'bg-indigo-50 text-indigo-600',
    'Planning':            'bg-slate-100 text-slate-600',
    'Completed':           'bg-green-50 text-green-600',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s[status]||'bg-gray-50 text-gray-600'}`}>{status}</span>;
}

function HealthRing({ score, size = 140 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.386;
  const sw = size * 0.086;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? '#22C55E' : score >= 65 ? '#EAB308' : '#EF4444';
  const fontSize = size >= 120 ? '1.875rem' : '1.25rem';
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <span style={{ fontSize, lineHeight: 1 }} className="font-bold text-gray-900">{score}</span>
        {size >= 100 && <span className="block text-xs text-gray-400 font-medium">/ 100</span>}
      </div>
    </div>
  );
}

function ModuleTable({ columns, rows, emptyMsg = 'No items found', focusId }) {
  const focusRef = useRef(null);

  useEffect(() => {
    if (!focusId || !focusRef.current) return;
    requestAnimationFrame(() => focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [focusId]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {columns.map(c => (
              <th key={c.key} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.length === 0
            ? <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">{emptyMsg}</td></tr>
            : rows.map((row, i) => {
              const isFocused = focusId && row.id === focusId;
              return (
                <tr key={row.id ?? i}
                  ref={isFocused ? focusRef : null}
                  data-item-id={row.id}
                  className={`transition-colors ${isFocused ? 'bg-amber-50 outline outline-2 outline-amber-400 outline-offset-[-2px]' : 'hover:bg-gray-50'}`}>
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-3.5 align-middle">{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}

function ModuleHeader({ title, subtitle, search, setSearch, filters, extra, syncedAt, onRefresh }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!syncedAt) return;
    const t = setInterval(() => tick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, [syncedAt]);

  return (
    <div className="p-5 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {syncedAt && (
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
              <RefreshCw size={9} />
              Synced {relativeTime(syncedAt)}
              {onRefresh && <button onClick={onRefresh} className="text-blue-400 hover:text-blue-600 ml-1 underline">Refresh</button>}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {search !== undefined && (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 w-44" />
            </div>
          )}
          {filters}
          {extra}
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview({ navigate }) {
  const { controls, vulns, incidents, policies, vendors } = useGRCData();
  const openDetail = useRiskDetail();
  const [score, setScore] = useState(0);
  const healthScore = computeHealthScore(risks);
  useEffect(() => { const t = setTimeout(() => setScore(healthScore), 300); return () => clearTimeout(t); }, [healthScore]);

  // Derived metrics
  const allGaps      = controls.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested');
  const effCounts    = controls.reduce((a, c) => { a[c.effectiveness] = (a[c.effectiveness] || 0) + 1; return a; }, {});
  const breachedSLA  = vulns.filter(v => (v.priority==='P0'||v.priority==='P1') && v.status!=='Patched' && v.dueDate && daysFromToday(v.dueDate) < 0);
  const openVulns    = vulns.filter(v => v.status !== 'Patched');
  const p0Open       = openVulns.filter(v => v.priority === 'P0').length;
  const p1Open       = openVulns.filter(v => v.priority === 'P1').length;
  const activeInc    = incidents.filter(i => i.status !== 'Resolved');
  const criticalInc  = activeInc.filter(i => i.severity === 'Critical').length;
  const policyGaps   = policies.filter(p => p.status === 'Overdue' || p.status === 'Missing');
  const highVendors  = vendors.filter(v => v.riskScore >= 60);
  const topRisks     = [...risks].sort((a, b) => b.inherentScore - a.inherentScore).slice(0, 4);

  // Posture narrative driven by score
  const posture = score >= 80 ? { label: 'Good', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: '#22C55E' }
                : score >= 60 ? { label: 'Amber', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: '#EAB308' }
                :               { label: 'At Risk', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: '#EF4444' };

  const postureText = breachedSLA.length
    ? `${breachedSLA.length} SLA breach${breachedSLA.length > 1 ? 'es' : ''} require immediate action`
    : p0Open || p1Open
    ? `${p0Open + p1Open} critical vulnerabilit${p0Open + p1Open > 1 ? 'ies' : 'y'} within SLA — monitoring required`
    : allGaps.length > 8
    ? `${allGaps.length} control gaps are widening your attack surface`
    : 'No immediate fires — focus on closing control gaps';

  // Computed weekly priorities from live data
  const priorities = [
    ...breachedSLA.map(v => ({ level: 0, icon: Bug, color: '#EF4444', text: `Patch ${v.title}`, sub: `${v.priority} · ${Math.abs(daysFromToday(v.dueDate))}d overdue · ${v.assignedTo ?? 'Unassigned'}`, nav: 'vulns' })),
    ...openVulns.filter(v => v.priority === 'P1' && v.dueDate && daysFromToday(v.dueDate) >= 0 && daysFromToday(v.dueDate) <= 7).map(v => ({ level: 1, icon: Bug, color: '#F97316', text: `Patch ${v.title}`, sub: `P1 · ${daysFromToday(v.dueDate)}d remaining`, nav: 'vulns' })),
    ...policyGaps.filter(p => p.status === 'Missing').slice(0, 2).map(p => ({ level: 1, icon: BookOpen, color: '#7C3AED', text: `Create ${p.title}`, sub: `Missing · ${p.category} · ${p.owner}`, nav: 'policy' })),
    ...risks.filter(r => r.status === 'Open' && r.inherentScore >= 16).slice(0, 2).map(r => ({ level: 2, icon: AlertTriangle, color: '#EF4444', text: `Treat ${r.id}: ${r.title.slice(0, 45)}${r.title.length > 45 ? '…' : ''}`, sub: `Score ${r.inherentScore} · ${r.owner}`, nav: 'risks' })),
    ...allGaps.filter(c => c.ai && c.effectiveness === 'not_tested').slice(0, 2).map(c => ({ level: 2, icon: Cpu, color: '#9333EA', text: `Schedule test: ${c.name}`, sub: `${c.id} · 0% · ${c.owner}`, nav: 'controls' })),
  ].slice(0, 6);

  // Domain tiles
  const domains = [
    { id:'vulns',      label:'Vulnerabilities', icon: Bug,       color:'#EF4444', stat: `${openVulns.length} open`,     detail: p0Open ? `${p0Open} P0 · ${p1Open} P1 overdue` : 'within SLA', ctrlId:'UCF.03.02' },
    { id:'incidents',  label:'Incidents',        icon: Flame,     color:'#F97316', stat: `${activeInc.length} active`,   detail: criticalInc ? `${criticalInc} critical unresolved` : 'no critical active', ctrlId:'UCF.04.01' },
    { id:'policy',     label:'Policy',           icon: BookOpen,  color:'#7C3AED', stat: `${policyGaps.length} gaps`,    detail: `${policyGaps.filter(p=>p.status==='Missing').length} missing policies`, ctrlId:'UCF.07.01' },
    { id:'thirdparty', label:'Third Party',      icon: Building2, color:'#0891B2', stat: `${highVendors.length} high risk`, detail: `${vendors.filter(v=>v.status==='No Contract').length} no contract / DPA`, ctrlId:'UCF.06.01' },
  ];

  const riskBandBg = s => s >= 20 ? 'bg-red-50 text-red-700' : s >= 12 ? 'bg-orange-50 text-orange-700' : s >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';

  // ── Executive Briefing bullets (computed from live data) ──────────────────
  const execBullets = [];
  const worstIncident = incidents.filter(i => i.status !== 'Resolved').sort((a,b) => {
    const sev = {Critical:3,High:2,Medium:1,Low:0};
    return (sev[b.severity]||0) - (sev[a.severity]||0);
  })[0];
  if (worstIncident) {
    const activeCount = incidents.filter(i => i.status !== 'Resolved').length;
    execBullets.push({ color:'#EF4444', text: `${activeCount} active incident${activeCount>1?'s':''} — "${worstIncident.title}" is ${worstIncident.severity.toLowerCase()} severity and ${worstIncident.status.toLowerCase()}` });
  }
  const euAiActFw = frameworks.find(f => f.name === 'EU AI Act');
  if (euAiActFw) {
    const failing = euAiActFw.controls - euAiActFw.passing;
    execBullets.push({ color:'#9333EA', text: `EU AI Act at ${euAiActFw.progress}% with enforcement approaching — ${failing} of ${euAiActFw.controls} controls failing` });
  }
  const noContractVendor = vendors.find(v => v.status === 'No Contract');
  if (noContractVendor) {
    execBullets.push({ color:'#F97316', text: `${noContractVendor.name} has no contract or DPA — highest liability vendor in the register (risk score ${noContractVendor.riskScore})` });
  } else {
    const topVendor = [...vendors].sort((a,b) => b.riskScore - a.riskScore)[0];
    if (topVendor) execBullets.push({ color:'#F97316', text: `${topVendor.name} is your highest-risk vendor with a score of ${topVendor.riskScore} — ${topVendor.status.toLowerCase()}` });
  }

  const topRiskByResidual = [...risks].sort((a,b) => b.residualScore - a.residualScore)[0];
  if (topRiskByResidual && topRiskByResidual.residualScore >= 12) {
    execBullets.push({ color: getRiskColor(topRiskByResidual.residualScore), text: `${topRiskByResidual.id}: "${topRiskByResidual.title.slice(0,50)}${topRiskByResidual.title.length>50?'…':''}" — residual score ${topRiskByResidual.residualScore} · ${topRiskByResidual.treatmentPlan.slice(0,80)}${topRiskByResidual.treatmentPlan.length>80?'…':''}` });
  }

  // ── Prioritisation Engine leverage actions ──────────────────────────────────
  const leverageActions = [
    {
      action: 'Test UCF.AI.01 (AI Model Governance)',
      unblocks: ['POL-007 policy closure', 'EU AI Act +4 controls', 'RSK-006 treatment'],
      owner: 'A. Patel',
      impact: 'High',
    },
    {
      action: 'Remediate UCF.01.02 (Privileged Access Management)',
      unblocks: ['RSK-001 residual reduction', 'V-005 IAM escalation', 'ISO 27001 +3 controls'],
      owner: 'J. Martinez',
      impact: 'High',
    },
    {
      action: 'Execute OpenAI DPA & security addendum',
      unblocks: ['RSK-004 closure', 'TP-007 compliance', 'EU AI Act Art.28'],
      owner: 'S. Chen',
      impact: 'Medium',
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── 0. Decisions + Alert Tray — two equal tiles ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <DecisionsRequired navigate={navigate} />
        <AlertTray navigate={navigate} />
      </div>

      {/* ── 0a. Executive Briefing (RRR2) ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">Executive Briefing</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white">AI-powered</span>
          </div>
          <button title="Regenerate" className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 hover:text-white">
            <RefreshCw size={12} />
          </button>
        </div>
        <div className="space-y-2.5">
          {execBullets.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: b.color }} />
              <p className="text-sm text-slate-200 leading-snug">{b.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 0b. Prioritisation Engine (RRR2) ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Prioritisation Engine</h3>
            <p className="text-xs text-gray-400 mt-0.5">Fix these to unblock the most</p>
          </div>
        </div>
        <div className="space-y-3">
          {leverageActions.map((la, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 mt-0.5 ${la.impact === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{la.impact}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">{la.action}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {la.unblocks.map(u => (
                    <span key={u} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">↳ {u}</span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{la.owner}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 1. Headline ─────────────────────────────────────────────────── */}
      <div className={`bg-white rounded-xl border ${posture.border} p-5 shadow-sm`}>
        <div className="flex items-center gap-6">
          <HealthRing score={score} size={88} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-gray-900">{score} / 100</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${posture.bg} ${posture.color}`}>{posture.label}</span>
              <span className={`text-xs ml-1 ${p0Open > 0 ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>{p0Open > 0 ? `↑3 open vulns — patch SLA slipping` : `+3 vs last week`}</span>
              <span title="Weighted composite score: Control Effectiveness 40% · Vulnerability Posture 30% · Incident Response 20% · Operational Maturity 10%" className="text-xs text-blue-500 hover:text-blue-700 cursor-help ml-1 underline decoration-dotted select-none">How scored?</span>
            </div>
            <p className="text-sm text-gray-600 leading-snug">{postureText}</p>
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { label: 'Open vulns',    val: openVulns.length,      accent: p0Open ? 'text-red-600 font-bold' : 'text-gray-700' },
                { label: 'Active incidents', val: activeInc.length,   accent: criticalInc ? 'text-orange-600 font-bold' : 'text-gray-700' },
                { label: 'Policy gaps',   val: policyGaps.length,     accent: policyGaps.filter(p=>p.status==='Missing').length ? 'text-purple-600 font-bold' : 'text-gray-700' },
                { label: 'Control gaps',  val: allGaps.length,        accent: allGaps.length > 8 ? 'text-red-600 font-bold' : 'text-gray-700' },
              ].map(({ label, val, accent }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg ${accent}`}>{val}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      {/* ── 3. SLA breach alert ─────────────────────────────────────────── */}
      {breachedSLA.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800">Action Required Today · {breachedSLA.length} SLA Breach{breachedSLA.length > 1 ? 'es' : ''}</p>
          </div>
          <div className="space-y-2">
            {breachedSLA.map(v => (
              <div key={v.id} className="flex items-center gap-3 flex-wrap">
                <PriorityBadge priority={v.priority} />
                <span className="text-xs font-medium text-gray-800">{v.title}</span>
                <SLACountdown dueDate={v.dueDate} status={v.status} />
                {v.assignedTo && <span className="text-xs text-gray-400">· {v.assignedTo}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Domain health tiles ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {domains.map(({ id, label, icon: Icon, color, stat, detail, ctrlId }) => {
          const ctrl = ctrlMap[ctrlId];
          return (
            <button key={id} onClick={() => navigate(id)}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all text-left group">
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-lg" style={{ background: color+'15' }}><Icon size={15} style={{ color }} /></div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat}</p>
              <p className="text-sm font-medium text-gray-600 mt-0.5 mb-2">{label}</p>
              <p className="text-xs text-gray-400 mb-2">{detail}</p>
              {ctrl && <EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score} />}
            </button>
          );
        })}
      </div>

      {/* ── 5. Priorities + Control health ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* This week's priorities */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">This Week's Priorities</h3>
            <span className="text-xs text-gray-400">{priorities.length} items</span>
          </div>
          {priorities.length === 0
            ? <p className="text-sm text-emerald-600">No critical priorities — maintain momentum.</p>
            : (
              <div className="space-y-3">
                {priorities.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <button key={i} onClick={() => navigate(p.nav)}
                      className="w-full flex items-start gap-3 text-left hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors group">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: p.color+'20' }}>
                        <Icon size={10} style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 leading-snug">{p.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{p.sub}</p>
                      </div>
                      <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500 mt-1 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )
          }
        </div>

        {/* Control health summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Control Health</h3>
            <span className="text-xs text-gray-400">{controls.length} UCF controls</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {Object.entries(effConfig).map(([key, cfg]) => (
              <div key={key} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                <p className={`text-2xl font-bold ${cfg.text}`}>{effCounts[key] || 0}</p>
                <p className={`text-xs font-medium ${cfg.text} mt-0.5`}>{cfg.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full flex h-2 rounded-full overflow-hidden gap-px">
            {Object.entries(effConfig).map(([key, cfg]) => (
              <div key={key} style={{ width: `${((effCounts[key]||0)/controls.length)*100}%`, background: cfg.bar }} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">{allGaps.length} gaps across {[...new Set(allGaps.map(c=>c.category))].length} categories</p>
          <button onClick={() => navigate('controls')} className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
            View Control Alignment <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* ── 6. Top risk snapshot ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Top Risks</h3>
            <p className="text-xs text-gray-400 mt-0.5">Highest inherent score · {risks.filter(r=>r.status!=='closed').length} total open</p>
          </div>
          <button onClick={() => navigate('risks')} className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
            Full register <ChevronRight size={11} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {topRisks.map(r => (
            <div key={r.id} onClick={() => openDetail(r)} className="flex items-center justify-between px-5 py-3.5 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 text-center">
                  <p className="text-lg font-bold leading-none" style={{ color: getRiskColor(r.inherentScore) }}>{r.inherentScore}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">score</p>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-[10px] text-gray-400">{r.id}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${riskBandBg(r.inherentScore)}`}>{getRiskRating(r.inherentScore)}</span>
                    {r.ai && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">AI</span>}
                  </div>
                  <p className="text-sm text-gray-800 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.owner} · {r.treatment}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-xs text-gray-400">residual <strong className="text-gray-700">{r.residualScore}</strong></span>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Vulnerabilities ──────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  if (!priority) return <span className="text-xs text-gray-400">-</span>;
  const c = PRIORITY_COLOR[priority] || PRIORITY_COLOR.P4;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${c.bg} ${c.border}`}>
      <span className={`text-xs font-bold ${c.text}`}>{priority}</span>
      <span className={`text-xs ${c.text} opacity-70`}>{PRIORITY_NAMES[priority]}</span>
    </div>
  );
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SLACountdown({ dueDate, status }) {
  if (status === 'Patched') return <span className="text-xs text-emerald-600 font-medium">Resolved</span>;
  if (!dueDate) return <span className="text-xs text-gray-400">-</span>;
  const days = daysFromToday(dueDate);
  if (days < 0)  return <span className="text-xs font-bold text-red-600">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="text-xs font-bold text-red-500">Due today</span>;
  if (days <= 3)  return <span className="text-xs font-semibold text-orange-600">{days}d left</span>;
  if (days <= 7)  return <span className="text-xs font-semibold text-amber-600">{days}d left</span>;
  return <span className="text-xs text-gray-500">{days}d left</span>;
}

// ─── Alert Tray ───────────────────────────────────────────────────────────────
function AlertTray({ navigate }) {
  const { vulns, incidents, policies, vendors } = useGRCData();
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grc_dismissed_alerts') || '[]'); } catch { return []; }
  });

  const dismiss = (e, id) => {
    e.stopPropagation();
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('grc_dismissed_alerts', JSON.stringify(next));
  };

  const alerts = [
    ...vulns.filter(v => v.priority === 'P0' && v.status !== 'Patched' && v.dueDate && daysFromToday(v.dueDate) < 0)
      .map(v => ({ id: `p0-${v.id}`, itemId: v.id, level: 0, label: 'P0 SLA Breach', text: v.title, action: 'Declare incident or escalate now', nav: 'vulns', color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200', textCol: 'text-red-800' })),
    ...incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved')
      .map(i => ({ id: `inc-${i.id}`, itemId: i.id, level: 0, label: 'Critical Incident', text: i.title, action: 'Incident commander sign-off required', nav: 'incidents', color: '#F97316', bg: 'bg-orange-50', border: 'border-orange-200', textCol: 'text-orange-800' })),
    ...policies.filter(p => p.status === 'Missing')
      .map(p => ({ id: `pol-${p.id}`, itemId: p.id, level: 1, label: 'Policy Missing', text: p.title, action: 'Create or approve policy — blocks compliance controls', nav: 'policy', color: '#7C3AED', bg: 'bg-purple-50', border: 'border-purple-200', textCol: 'text-purple-800' })),
    ...vendors.filter(v => v.status === 'No Contract')
      .map(v => ({ id: `vnd-${v.id}`, itemId: v.id, level: 1, label: 'No Contract', text: `${v.name} — ${v.dataShared}`, action: 'Legal must initiate DPA before next data processing', nav: 'thirdparty', color: '#0891B2', bg: 'bg-cyan-50', border: 'border-cyan-200', textCol: 'text-cyan-800' })),
  ].filter(a => !dismissed.includes(a.id)).sort((a, b) => a.level - b.level);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-3 bg-amber-500 flex items-center gap-2">
        <Bell size={14} className="text-white flex-shrink-0" />
        <span className="text-sm font-bold text-white">Action Required</span>
        <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">{alerts.length}</span>
        <span className="ml-auto text-xs text-amber-100">Click any item to open</span>
      </div>
      {alerts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <CheckCircle size={20} className="text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">All alerts cleared</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50 flex-1">
          {alerts.map(a => (
            <button key={a.id} onClick={() => navigate(a.nav, a.itemId)}
              className={`w-full flex items-start gap-3 px-5 py-3 ${a.bg} hover:brightness-95 transition-all text-left group`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${a.bg} ${a.textCol} border ${a.border}`}>{a.label}</span>
                  <span className={`text-xs font-semibold ${a.textCol} truncate`}>{a.text}</span>
                </div>
                <p className="text-xs text-gray-500">{a.action}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                <ChevronRight size={12} className="text-gray-300 group-hover:text-gray-500" />
                <button onClick={(e) => dismiss(e, a.id)} className="text-gray-300 hover:text-gray-500 p-0.5 rounded" title="Dismiss"><X size={12} /></button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Decisions Required Today ─────────────────────────────────────────────────
function DecisionsRequired({ navigate }) {
  const { vulns, incidents, policies, vendors } = useGRCData();

  const decisions = [
    ...vulns.filter(v => v.priority === 'P0' && v.status !== 'Patched' && v.dueDate && daysFromToday(v.dueDate) < 0)
      .map(v => ({ id: v.id, itemId: v.id, icon: Bug, color: '#EF4444', title: `Escalate or declare incident: ${v.title}`, context: `P0 · ${Math.abs(daysFromToday(v.dueDate))}d past SLA · CISO sign-off required`, nav: 'vulns' })),
    ...risks.filter(r => r.status === 'Open' && r.inherentScore > 19)
      .map(r => ({ id: r.id, itemId: r.id, icon: AlertTriangle, color: '#EF4444', title: `Board-level risk: ${r.title}`, context: `Score ${r.inherentScore} — significantly exceeds risk appetite · ${r.owner}`, nav: 'risks' })),
    ...incidents.filter(i => i.severity === 'Critical' && i.status !== 'Resolved')
      .map(i => ({ id: i.id, itemId: i.id, icon: Flame, color: '#F97316', title: `Critical incident unresolved: ${i.title}`, context: `Detected ${i.detected} · ${i.systems} system${i.systems !== 1 ? 's' : ''} affected · IMT activation required`, nav: 'incidents' })),
    ...policies.filter(p => p.status === 'Missing').slice(0, 2)
      .map(p => ({ id: p.id, itemId: p.id, icon: BookOpen, color: '#7C3AED', title: `Approve and ratify: ${p.title}`, context: `Missing — blocks EU AI Act, ISO 42001, and GDPR compliance · ${p.owner}`, nav: 'policy' })),
    ...vendors.filter(v => v.status === 'No Contract')
      .map(v => ({ id: v.id, itemId: v.id, icon: Building2, color: '#0891B2', title: `Offboard or contract: ${v.name}`, context: `No DPA — ${v.dataShared} being processed without legal basis · Legal sign-off required`, nav: 'thirdparty' })),
  ];

  if (decisions.length === 0) return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
      <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
      <p className="text-sm font-semibold text-emerald-800">No decisions required today — maintain momentum on open treatment plans.</p>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 bg-red-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-white flex-shrink-0" />
          <p className="text-sm font-bold text-white">Decisions Required Today</p>
          <span className="px-2 py-0.5 bg-white/20 text-white text-xs font-bold rounded-full">{decisions.length}</span>
        </div>
        <p className="text-xs text-red-200">Click any item to investigate</p>
      </div>
      <div className="divide-y divide-gray-50">
        {decisions.map(d => {
          const Icon = d.icon;
          return (
            <button key={d.id} onClick={() => navigate(d.nav, d.itemId)}
              className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: d.color + '15' }}>
                <Icon size={13} style={{ color: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{d.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.context}</p>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionContext({ what, why, ask, askUrgency = 'normal' }) {
  const askBg = { critical: 'bg-red-600', high: 'bg-amber-500', normal: 'bg-blue-600' };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className={`${askBg[askUrgency]} px-5 py-4 md:w-2/5 flex-shrink-0`}>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1.5">What we need from you</p>
          <p className="text-sm font-semibold text-white leading-snug">{ask}</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">What this tracks</p>
            <p className="text-xs text-gray-600 leading-relaxed">{what}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Why it matters</p>
            <p className="text-xs text-gray-600 leading-relaxed">{why}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Vulnerabilities({ focusId }) {
  const { vulns, controls } = useGRCData();
  const openDetail = useRiskDetail();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [showEOL, setShowEOL] = useState(false);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 2 * 3600000));
  const [tableExpanded, setTableExpanded] = useState(false);

  useEffect(() => {
    if (focusId) { setPriorityFilter('All'); setSearch(''); setShowAI(false); setShowEOL(false); }
  }, [focusId]);

  const open = vulns.filter(v => v.status !== 'Patched');

  // KRI calculations (VMP §12)
  const p0Open             = open.filter(v => v.priority === 'P0').length;
  const p1Open             = open.filter(v => v.priority === 'P1').length;
  const p1p2Open           = open.filter(v => v.priority === 'P1' || v.priority === 'P2');
  const p1p2InSLA          = p1p2Open.filter(v => v.dueDate && daysFromToday(v.dueDate) >= 0).length;
  const slaCompliance      = p1p2Open.length > 0 ? Math.round((p1p2InSLA / p1p2Open.length) * 100) : 100;
  const unassignedCritical = open.filter(v => (v.priority === 'P0' || v.priority === 'P1') && !v.assignedTo).length;

  const p0Overdue = open.filter(v => v.priority === 'P0' && v.dueDate && daysFromToday(v.dueDate) < 0);
  const p1Overdue = open.filter(v => v.priority === 'P1' && v.dueDate && daysFromToday(v.dueDate) < 0);
  const eolOpen   = open.filter(v => v.eol);

  const patched   = vulns.filter(v => v.status === 'Patched' && v.patchedDate && v.discovered);
  const mttrDays  = patched.length
    ? Math.round(patched.reduce((s, v) => s + (-daysFromToday(v.discovered) + daysFromToday(v.patchedDate)), 0) / patched.length)
    : null;
  const kevOpen   = open.filter(v => v.isCisaKev).length;

  const aiCtrl = ctrlMap['UCF.AI.03'];

  const data = vulns.filter(v =>
    (priorityFilter === 'All' || v.priority === priorityFilter) &&
    (!showAI || v.ai) &&
    (!showEOL || v.eol) &&
    (v.title.toLowerCase().includes(search.toLowerCase()) ||
     (v.cve && v.cve.toLowerCase().includes(search.toLowerCase())))
  );

  const p0OverdueCount = open.filter(v => v.priority === 'P0' && v.dueDate && daysFromToday(v.dueDate) < 0).length;
  const eolUnassigned  = open.filter(v => v.eol && !v.assignedTo).length;
  const vulnAsk = p0OverdueCount > 0
    ? `P0 SLA breach: declare incident or escalate today. ${eolUnassigned > 0 ? `${eolUnassigned} EOL component${eolUnassigned>1?'s':''} need upgrade owners assigned.` : ''}`
    : eolUnassigned > 0
      ? `Assign upgrade owners to ${eolUnassigned} EOL component${eolUnassigned>1?'s':''} — these cannot be patched, only migrated.`
      : 'No critical blockers. Review P1/P2 SLA compliance and confirm upgrade timelines.';
  const vulnUrgency = p0OverdueCount > 0 ? 'critical' : eolUnassigned > 0 ? 'high' : 'normal';
  // Risks with signalSource === 'vulnerability' surface here
  const vulnRisks = risks.filter(r => r.signalSource === 'vulnerability');

  return (
    <div className="space-y-4">
      <SectionContext
        what="Real-time tracking of CVEs, EOL components, and CISA KEV threats across all production assets. Every finding is scored through the VSRM — 4 dimensions of contextual risk, not raw CVSS."
        why="Unpatched vulnerabilities are the most common breach vector. EOL runtimes create permanent exposure that no security patch can ever close — only migration eliminates the risk."
        ask={vulnAsk}
        askUrgency={vulnUrgency}
      />

      {/* Risk-Register signal: vulnerability risks */}
      {vulnRisks.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm">
          <div className="px-5 py-3 border-b border-red-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-gray-800">Risk Register — Vulnerability Signals</span>
            <span className="ml-auto text-[10px] text-gray-400 italic">sample · illustrative data</span>
          </div>
          <div className="divide-y divide-gray-50">
            {vulnRisks.map(r => (
              <div key={r.id} onClick={() => openDetail(r)} className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{getRiskRating(r.residualScore)} residual</span>
                    <span className="text-[10px] text-gray-500">SLA: {r.slaDays}d · {r.owner}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.whyItMatters}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Inherent → Residual</p>
                  <p className="text-sm font-bold text-gray-800">{r.inherentScore} <span className="text-gray-400">→</span> {r.residualScore}</p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KRI panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl border p-5 shadow-sm ${p0Open > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-400 mb-1">P0 Open · Incident</p>
          <p className={`text-3xl font-bold mb-1 ${p0Open > 0 ? 'text-red-600' : 'text-gray-800'}`}>{p0Open}</p>
          <p className="text-xs text-gray-400">SLA: 1 day · Target: 0</p>
          <div className="mt-2"><Sparkline data={sparkData.vulns} color="#EF4444" width={60} height={20} /></div>
        </div>
        <div className={`rounded-xl border p-5 shadow-sm ${p1Open > 0 ? 'bg-orange-50 border-orange-300' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-400 mb-1">P1 Open · Blocker</p>
          <p className={`text-3xl font-bold mb-1 ${p1Open > 0 ? 'text-orange-600' : 'text-gray-800'}`}>{p1Open}</p>
          <p className="text-xs text-gray-400">SLA: 14 days</p>
          <div className="mt-2"><Sparkline data={sparkData.vulns} color="#F97316" width={60} height={20} /></div>
        </div>
        <div className={`rounded-xl border p-5 shadow-sm ${slaCompliance < 90 ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-400 mb-1">SLA Compliance (P1/P2)</p>
          <p className={`text-3xl font-bold mb-1 ${slaCompliance < 90 ? 'text-amber-600' : 'text-emerald-600'}`}>{slaCompliance}%</p>
          <p className="text-xs text-gray-400">{p1p2InSLA} of {p1p2Open.length} within SLA</p>
          <p className="text-xs text-gray-400">Target: &gt;90%</p>
        </div>
        <div className={`rounded-xl border p-5 shadow-sm ${unassignedCritical > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-gray-100'}`}>
          <p className="text-xs text-gray-400 mb-1">Unassigned P0/P1</p>
          <p className={`text-3xl font-bold mb-1 ${unassignedCritical > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{unassignedCritical}</p>
          <p className="text-xs text-gray-400">Target: 0 &gt; 24h</p>
        </div>
      </div>

      {/* Vuln Next Action */}
      {(() => {
        const p0Breach = open.filter(v => v.priority==='P0' && v.dueDate && daysFromToday(v.dueDate) < 0)[0];
        const nextAction = p0Breach
          ? { action: `Patch ${p0Breach.title} immediately — SLA breached`, owner: p0Breach.assignedTo || 'Unassigned', deadline: `${Math.abs(daysFromToday(p0Breach.dueDate))}d overdue`, urgency: 'high' }
          : unassignedCritical > 0
          ? { action: `Assign owner to ${unassignedCritical} unassigned P0/P1 vulnerabilities`, owner: 'T. Williams', deadline: 'Today', urgency: 'high' }
          : { action: `Review P1 SLA compliance — ${slaCompliance}% in SLA`, owner: 'T. Williams', deadline: 'This week', urgency: 'medium' };
        return <NextActionCard {...nextAction} />;
      })()}

      {/* MTTR + KEV + trend row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
          <RefreshCw size={20} className="text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Avg MTTR (patched)</p>
            <p className="text-2xl font-bold text-gray-900">{mttrDays != null ? `${mttrDays}d` : '-'}</p>
            <p className="text-xs text-gray-400">VMP target: P1 &lt;14d</p>
          </div>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm flex items-center gap-4 ${kevOpen > 0 ? 'bg-red-50 border-red-300' : 'bg-white border-gray-100'}`}>
          <AlertTriangle size={20} className={kevOpen > 0 ? 'text-red-600 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">CISA KEV Open</p>
            <p className={`text-2xl font-bold ${kevOpen > 0 ? 'text-red-600' : 'text-gray-900'}`}>{kevOpen}</p>
            <p className="text-xs text-gray-400">Known exploited · P0 SLA</p>
          </div>
        </div>
        <div className={`rounded-xl border p-4 shadow-sm flex items-center gap-4 ${eolOpen.length > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-gray-100'}`}>
          <Activity size={20} className={eolOpen.length > 0 ? 'text-rose-600 flex-shrink-0' : 'text-gray-300 flex-shrink-0'} />
          <div>
            <p className="text-xs text-gray-400 mb-0.5">EOL Components</p>
            <p className={`text-2xl font-bold ${eolOpen.length > 0 ? 'text-rose-600' : 'text-gray-900'}`}>{eolOpen.length}</p>
            <p className="text-xs text-gray-400">No patch path available</p>
          </div>
        </div>
      </div>

      {/* Program document links */}
      <div className="bg-white border border-gray-100 rounded-xl px-5 py-3 shadow-sm flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Program Docs</span>
        {[
          { label: 'Vulnerability Management Program', href: 'docs/VULNERABILITY-MANAGEMENT-PROGRAM.md' },
          { label: 'VSRM Methodology', href: 'docs/VULNERABILITY-MANAGEMENT-PROGRAM.md#vulnerability-severity-rating-matrix-vsrm' },
          { label: 'SDLC Security Guardrails', href: 'docs/SDLC-SECURITY-GUARDRAILS.md' },
          { label: 'PDLC Security Guardrails', href: 'docs/PDLC-SECURITY-GUARDRAILS.md' },
          { label: 'NPM Supply Chain Policy', href: 'docs/NPM-SUPPLY-CHAIN-SECURITY.md' },
          { label: 'AI-GRC Roadmap', href: 'docs/AI-GRC-ROADMAP.md' },
        ].map(({ label, href }) => (
          <a key={href} href={`https://github.com/9snxz8htcw-netizen/chris-grc-engineering/blob/main/${href}`}
             target="_blank" rel="noopener noreferrer"
             className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1">
            <FileText size={11} />{label}
          </a>
        ))}
      </div>

      {/* P0/P1 SLA breach alerts */}
      {p0Overdue.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">P0 SLA Breach · Incident Response Required</p>
            <p className="text-xs text-red-700 mt-0.5">
              {p0Overdue.map(v => `${v.id}: ${v.title} (${Math.abs(daysFromToday(v.dueDate))}d overdue)`).join(' · ')}
            </p>
          </div>
        </div>
      )}
      {p1Overdue.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">P1 SLA Breach · Extension Approval or Escalation Required</p>
            <p className="text-xs text-orange-700 mt-0.5">
              {p1Overdue.map(v => `${v.id}: ${v.title} (${Math.abs(daysFromToday(v.dueDate))}d overdue)`).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* Predictive SLA breach warning */}
      {(() => {
        const predictedBreaches = open.filter(v =>
          v.dueDate &&
          daysFromToday(v.dueDate) > 0 &&
          daysFromToday(v.dueDate) <= 5 &&
          (v.priority === 'P0' || v.priority === 'P1')
        );
        if (predictedBreaches.length === 0) return null;
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={14} className="text-amber-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-amber-800">
                {predictedBreaches.length} SLA breach{predictedBreaches.length > 1 ? 'es' : ''} predicted within 5 days
              </p>
            </div>
            <div className="space-y-1.5">
              {predictedBreaches.map(v => (
                <div key={v.id} className="flex items-center gap-3 flex-wrap">
                  <PriorityBadge priority={v.priority} />
                  <span className="text-xs text-gray-700">{v.title}</span>
                  <span className="text-xs font-semibold text-amber-700">
                    breaches in {daysFromToday(v.dueDate)}d — assign to {v.assignedTo || 'owner now'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* AI gap banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">AI Security Gap · {aiCtrl?.id}: {aiCtrl?.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">2 AI-specific vulnerabilities open. Control status: <strong className="text-red-600">Not Tested</strong>. No OWASP LLM Top 10 assessment completed.</p>
        </div>
        <EffectivenessBadge effectiveness={aiCtrl?.effectiveness} score={aiCtrl?.score} />
      </div>

      {/* EOL banner */}
      {eolOpen.length > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Activity size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800">
                {eolOpen.length} End-of-Life Component{eolOpen.length !== 1 ? 's' : ''} — No Patch Path
              </p>
              <p className="text-xs text-rose-700 mt-0.5 mb-2">
                EOL software receives no security patches. Every new CVE discovered after EOL is permanently unmitigable without upgrading or migrating. Standard VSRM patch SLAs do not apply — remediation requires an upgrade or migration plan.
              </p>
              <div className="space-y-1.5">
                {eolOpen.map(v => (
                  <div key={v.id} className="flex items-start gap-2 bg-white rounded-lg border border-rose-100 px-3 py-2">
                    <PriorityBadge priority={v.priority} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-800">{v.title}</span>
                      <span className="text-xs text-gray-400 ml-2 font-mono">{v.asset}</span>
                      {v.eolNote && <p className="text-xs text-gray-500 mt-0.5">{v.eolNote}</p>}
                    </div>
                    {!v.assignedTo && <span className="text-xs font-semibold text-red-600 flex-shrink-0">Unassigned</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vulnerability register table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader
          title="Vulnerability Register"
          subtitle={`${data.length} vulnerabilities · Priority scored P0–P4 (VSRM)`}
          search={search}
          setSearch={setSearch}
          syncedAt={lastSynced}
          onRefresh={() => setLastSynced(new Date())}
          filters={<>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','P0','P1','P2','P3','P4'].map(p => <option key={p}>{p}</option>)}
            </select>
            <button onClick={() => setShowAI(a => !a)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showAI ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Cpu size={13} /> AI Only
            </button>
            <button onClick={() => setShowEOL(e => !e)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showEOL ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Activity size={13} /> EOL Only
            </button>
            <button onClick={() => setTableExpanded(x => !x)} className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <Grid size={13} /> {tableExpanded ? 'Collapse' : 'All columns'}
            </button>
            <button onClick={() => downloadCSV(
              `vulnerabilities-${new Date().toISOString().slice(0,10)}.csv`,
              ['ID','Title','CVE','Priority','Status','SLA Due','Assigned To','Environment','Control'],
              data.map(v => [v.id, v.title, v.cve||'', v.priority, v.status, v.dueDate||'', v.assignedTo||'Unassigned', v.environment||'', v.controlId||''])
            )} className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5">
              <Download size={13} /> Export CSV
            </button>
          </>}
        />
        <ModuleTable
          columns={[
            { key: 'priority', label: 'Priority',
              render: r => (
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={r.priority} />
                  {r.eol       && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-xs rounded font-medium">EOL</span>}
                  {r.isCisaKev && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">KEV</span>}
                  {r.ai        && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">AI</span>}
                </div>
              ) },
            { key: 'title', label: 'Vulnerability',
              render: r => (
                <div>
                  <p className="text-sm text-gray-800 font-medium">{r.title}</p>
                  {r.cve && <p className="font-mono text-xs text-blue-500 mt-0.5">{r.cve}</p>}
                </div>
              ) },
            { key: 'sla', label: 'SLA Status',
              render: r => {
                if (r.status === 'Patched') return <span className="text-xs text-emerald-600 font-medium">✓ Patched</span>;
                const dOpen = -daysFromToday(r.discovered);
                const overdue = r.dueDate ? -daysFromToday(r.dueDate) : null;
                return (
                  <div>
                    <SLACountdown dueDate={r.dueDate} status={r.status} />
                    <p className={`text-xs mt-0.5 ${overdue > 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>{dOpen}d open{overdue > 0 ? ` · ${overdue}d overdue` : ''}</p>
                  </div>
                );
              }},
            { key: 'owner', label: 'Owner',
              render: r => r.assignedTo
                ? <span className="text-xs text-gray-600">{r.assignedTo}</span>
                : (r.status !== 'Patched' && (r.priority === 'P0' || r.priority === 'P1'))
                  ? <span className="text-xs font-semibold text-red-600">⚠ Unassigned</span>
                  : <span className="text-xs text-gray-400">—</span> },
            { key: 'status', label: 'Status',
              render: r => <StatusBadge status={r.status} /> },
            ...(tableExpanded ? [
              { key: 'id',       label: 'ID',       render: r => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
              { key: 'severity', label: 'Severity', render: r => <SeverityBadge severity={r.severity} /> },
              { key: 'asset',    label: 'Asset',
                render: r => (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{r.asset}</span>
                    {r.secTier != null && <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${r.secTier === 0 ? 'bg-red-100 text-red-700' : r.secTier === 1 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>T{r.secTier}</span>}
                  </div>
                ) },
              { key: 'ctrl', label: 'Control', render: r => <ControlCell controlId={r.controlId} /> },
              { key: 'eff',  label: 'Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
            ] : []),
          ]}
          rows={data}
          focusId={focusId}
        />
      </div>

      {/* VSRM legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 mb-3">VSRM Priority Legend · SLA targets per priority (VMP §7)</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PRIORITY_NAMES).map(([p, name]) => {
            const c = PRIORITY_COLOR[p];
            return (
              <div key={p} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${c.bg} ${c.border}`}>
                <span className={`text-xs font-bold ${c.text}`}>{p}</span>
                <span className={`text-xs ${c.text}`}>{name}</span>
                <span className={`text-xs ${c.text} opacity-60`}>· {SLA_DAYS[p]}d SLA</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Incidents ────────────────────────────────────────────────────────────────

function Incidents({ focusId }) {
  const { incidents, controls } = useGRCData();
  const openDetail = useRiskDetail();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [triageIncident, setTriageIncident] = useState(null);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 45 * 60000));

  useEffect(() => {
    if (focusId) { setStatusFilter('All'); setSearch(''); setShowAI(false); }
  }, [focusId]);

  const getTriageSteps = (incident) => {
    const steps = {
      'Data Breach':    ['1. Isolate affected systems immediately', '2. Notify DPO within 1 hour (GDPR Art.33 72h clock starts)', '3. Preserve logs — do not wipe', '4. Identify data subjects affected', '5. Engage legal for regulatory notification'],
      'Intrusion':      ['1. Block source IPs at perimeter firewall', '2. Reset credentials for affected accounts', '3. Preserve forensic evidence', '4. Check lateral movement via UCF.05.01', '5. Notify CISO if Critical severity'],
      'Malware':        ['1. Quarantine affected endpoints immediately', '2. Run full AV scan on adjacent systems', '3. Block C2 domains at DNS layer', '4. Check UCF.08.01 SIEM for propagation', '5. Initiate UCF.09.01 BCP if >3 systems affected'],
      'Phishing':       ['1. Block sender domain in email gateway', '2. Reset passwords for all users who clicked', '3. Revoke active sessions for affected accounts', '4. Scan for credential harvesting payloads', '5. Send security awareness reminder via UCF.07.02'],
      'AI Data Leak':   ['1. Suspend affected AI model endpoint immediately', '2. Identify what PII was exposed and to whom', '3. Notify DPO — AI-generated PII exposure may trigger GDPR Art.33', '4. Review prompt logs for scope of exposure', '5. Engage UCF.AI.05 AI Incident Response plan'],
      'AI Governance':  ['1. Document the hallucination — capture exact input/output', '2. Assess if compliance-impacting decision was made on bad output', '3. Review model version and confidence thresholds', '4. Escalate to AI Governance Lead if regulatory impact', '5. Add to AI model performance monitoring (UCF.AI.07)'],
      'Insider Threat': ['1. Preserve access logs without alerting the subject', '2. Engage HR and Legal before taking action', '3. Review UCF.01.02 PAM — check for privilege abuse', '4. Determine scope of data accessed', '5. Coordinate with legal on evidence preservation'],
      'Data Exposure':  ['1. Revoke the exposed credentials immediately', '2. Audit access logs for the past 30 days', '3. Identify any data that was accessed with the key', '4. Rotate all adjacent credentials proactively', '5. Review UCF.06.02 vendor questionnaire for this vendor'],
    };
    return steps[incident.type] || ['1. Assess impact scope', '2. Escalate to incident commander', '3. Preserve evidence', '4. Notify stakeholders per severity', '5. Document timeline'];
  };

  const data = incidents.filter(i =>
    (statusFilter === 'All' || i.status === statusFilter) &&
    (!showAI || i.ai) &&
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  const active = incidents.filter(i => i.status !== 'Resolved');
  const mttrAvg = '3.2h';
  const aiIncOpen = incidents.filter(i => i.ai && i.status !== 'Resolved').length;
  const incAsk = active.length > 0
    ? `${active.length} incident${active.length>1?'s':''} unresolved.${aiIncOpen > 0 ? ` ${aiIncOpen} AI-related ${aiIncOpen>1?'incidents require':'incident requires'} dedicated IR playbook coverage under EU AI Act Art. 9 — assign a Security Lead.` : ' Confirm IR control is tested and playbook is current.'}`
    : 'No active incidents. Validate IR playbook and schedule a tabletop exercise for AI-related scenarios.';

  return (
    <div className="space-y-4">
      <SectionContext
        what="Active and historical security events tracked from initial detection through full resolution. Every incident links back to a UCF control and drives MTTR measurement."
        why="Fast containment limits blast radius. AI-related incidents carry regulatory weight — EU AI Act Art. 9 requires documented risk management and logging for every AI failure in production."
        ask={incAsk}
        askUrgency={active.length > 0 ? 'high' : 'normal'}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Incidents"  value={active.length}  icon={Flame}         color="#F97316" subtitle="2 critical unresolved" sparkData={sparkData.incidents} />
        <KPICard title="Avg MTTR"          value={mttrAvg}        icon={RefreshCw}      color="#2563EB" subtitle="last 30 days" />
        <KPICard title="AI-Related"        value={incidents.filter(i=>i.ai).length} icon={Cpu} color="#9333EA" subtitle="2 open, 0 controls tested" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">IR Control · {ctrlMap['UCF.04.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.04.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.04.01']?.effectiveness} score={ctrlMap['UCF.04.01']?.score} />
        </div>
      </div>

      {/* Incidents Next Action */}
      {(() => {
        const activeInc = incidents.filter(i => i.status !== 'Resolved');
        const worstActive = [...activeInc].sort((a,b) => {const s={Critical:3,High:2,Medium:1,Low:0}; return (s[b.severity]||0)-(s[a.severity]||0);})[0];
        const nextAction = worstActive
          ? { action: `Resolve "${worstActive.title}" — ${worstActive.severity.toLowerCase()} severity, currently ${worstActive.status.toLowerCase()}`, owner: ctrlMap[worstActive.controlId]?.owner || 'K. Thompson', deadline: worstActive.severity==='Critical'?'Immediately':'48h', urgency: worstActive.severity==='Critical'?'high':'medium' }
          : { action: 'No critical incidents — validate IR playbook is current', owner: 'K. Thompson', deadline: 'This month', urgency: 'low' };
        return <NextActionCard {...nextAction} />;
      })()}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">AI Incident Response Gap · {ctrlMap['UCF.AI.05']?.id}</p>
          <p className="text-xs text-gray-600 mt-0.5">No AI-specific IR playbook exists. 2 AI incidents (INC-007, INC-008) have no defined response procedure. Control mapped to {ctrlMap['UCF.AI.05']?.frameworks.join(', ')}.</p>
        </div>
        <EffectivenessBadge effectiveness={ctrlMap['UCF.AI.05']?.effectiveness} score={ctrlMap['UCF.AI.05']?.score} />
      </div>

      {/* Pending risk escalation — risks that could become incidents if exploited */}
      {(() => {
        const escalatable = risks.filter(r => r.signalSource === 'vulnerability' || r.signalSource === 'supply_chain');
        if (!escalatable.length) return null;
        const toIncidentType = { vulnerability: 'Intrusion', supply_chain: 'Malware / Supply Chain' };
        return (
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
            <div className="px-5 py-3 border-b border-orange-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="text-sm font-semibold text-gray-800">Pending Risk Escalation</span>
              <span className="ml-auto text-[10px] text-gray-400 italic">exploited → becomes an incident</span>
            </div>
            <div className="divide-y divide-gray-50">
              {escalatable.map(r => (
                <div key={r.id} onClick={() => openDetail(r)} className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold">→ {toIncidentType[r.signalSource]}</span>
                      <span className="text-[10px] text-gray-500">Residual {r.residualScore} · {r.owner}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{r.threatVector}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Incident Register" subtitle={`${data.length} incidents`} search={search} setSearch={setSearch}
          syncedAt={lastSynced}
          onRefresh={() => setLastSynced(new Date())}
          filters={<>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','Open','Investigating','Contained','Resolved'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowAI(a => !a)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showAI ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Cpu size={13} /> AI Only
            </button>
          </>}
        />
        <ModuleTable
          columns={[
            { key: 'id',       label: 'ID',      render: r => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
            { key: 'title',    label: 'Title',   render: r => <div className="flex items-center gap-1.5"><span className="text-sm font-medium text-gray-800">{r.title}</span>{r.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">AI</span>}</div> },
            { key: 'type',     label: 'Type',    render: r => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{r.type}</span> },
            { key: 'severity', label: 'Severity',render: r => <SeverityBadge severity={r.severity} /> },
            { key: 'status',   label: 'Status',  render: r => <StatusBadge status={r.status} /> },
            { key: 'detected', label: 'Detected',render: r => <span className="text-xs text-gray-500">{fmtDate(r.detected)}</span> },
            { key: 'mttr',     label: 'MTTR',    render: r => <span className="text-xs text-gray-500">{r.mttr || '-'}</span> },
            { key: 'systems',  label: 'Systems', render: r => <span className="text-xs font-semibold text-gray-600">{r.systems}</span> },
            { key: 'ctrl',     label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',      label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
            { key: 'triage',   label: '', render: r => r.status !== 'Resolved' ? (
              <button onClick={() => setTriageIncident(r)}
                className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded text-[10px] font-semibold hover:bg-orange-100 transition-colors whitespace-nowrap">
                <Flame size={10} />
                Triage
              </button>
            ) : null },
          ]}
          rows={data}
          focusId={focusId}
        />
      </div>

      {/* Triage Drawer */}
      {triageIncident && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-orange-50">
            <div>
              <div className="flex items-center gap-2">
                <Flame size={14} className="text-orange-600" />
                <span className="text-sm font-semibold text-gray-900">Triage Guide</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{triageIncident.title}</p>
            </div>
            <button onClick={() => setTriageIncident(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={triageIncident.severity} />
              <StatusBadge status={triageIncident.status} />
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{triageIncident.type}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Response Steps</p>
              <ol className="space-y-2">
                {getTriageSteps(triageIncident).map((step, idx) => (
                  <li key={idx} className="flex gap-2 text-xs text-gray-700 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                    <span>{step.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </div>
            {triageIncident.controlId && ctrlMap[triageIncident.controlId] && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-600 mb-1">Linked Control</p>
                <p className="text-xs font-mono text-blue-600">{triageIncident.controlId}</p>
                <p className="text-xs text-gray-700 mt-0.5">{ctrlMap[triageIncident.controlId].name}</p>
                <div className="mt-2">
                  <EffectivenessBadge effectiveness={ctrlMap[triageIncident.controlId].effectiveness} score={ctrlMap[triageIncident.controlId].score} />
                </div>
              </div>
            )}
            <div className="border border-amber-200 rounded-lg p-3 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 mb-1">Escalation Rule</p>
              <p className="text-xs text-amber-700">
                {triageIncident.severity === 'Critical' ? 'Notify CISO and DPO immediately. Invoke BCP if systems impacted > 3.' :
                 triageIncident.severity === 'High' ? 'Notify Security Lead within 2 hours. Update incident log every 4 hours.' :
                 'Log progress every 24 hours. Resolve within SLA window.'}
              </p>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
            <button className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 font-medium">Escalate</button>
            <button onClick={() => setTriageIncident(null)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Policy ───────────────────────────────────────────────────────────────────

const POLICY_DRAFTS = {
  'POL-007': {
    title: 'AI Usage & Governance Policy',
    sections: [
      { heading: 'Purpose', body: 'This policy establishes the governance framework for the development, deployment, and use of artificial intelligence and machine learning systems across the organisation, ensuring alignment with EU AI Act, ISO/IEC 42001, and NIST AI RMF obligations.' },
      { heading: 'Scope', body: 'Applies to all employees, contractors, and third parties who develop, procure, deploy, or use AI systems that process organisational or customer data.' },
      { heading: 'AI Use Case Register', body: 'All AI use cases must be registered with the GRC team before deployment. Each use case must be classified by risk tier (Unacceptable / High / Limited / Minimal) per EU AI Act Article 6.' },
      { heading: 'Prohibited Uses', body: 'AI systems must not be used for: real-time biometric surveillance in public spaces, social scoring, exploitation of vulnerable groups, or any use case classified as Unacceptable Risk under EU AI Act Annex I.' },
      { heading: 'Approval & Review', body: 'High-risk AI systems require CISO and DPO sign-off prior to deployment. All AI use cases must be reviewed annually or when material changes occur.' },
      { heading: 'Controls', body: 'UCF.AI.01 (AI Model Governance) · UCF.AI.06 (AI Risk Categorization) · UCF.AI.10 (AI Model Lifecycle Management)' },
      { heading: 'Owner', body: 'A. Patel · Review annually · Next review: 2026-12-31' },
    ]
  },
  'POL-008': {
    title: 'AI Ethics & Bias Policy',
    sections: [
      { heading: 'Purpose', body: 'This policy ensures that AI systems deployed by the organisation are fair, transparent, and do not discriminate against individuals or groups, in compliance with GDPR Art.22, EU AI Act Art.10, and NIST AI RMF.' },
      { heading: 'Scope', body: 'Applies to all AI systems that make or materially influence decisions affecting individuals, including automated decisioning, recommendations, and risk scoring.' },
      { heading: 'Bias Assessment', body: 'All AI systems must undergo bias and fairness assessments prior to deployment, covering: training data representativeness, output disparity analysis across protected characteristics, and ongoing monitoring for drift.' },
      { heading: 'Explainability Requirements', body: 'Systems making individual decisions must be capable of providing meaningful explanations upon request (GDPR Art.22). Black-box models used in high-stakes decisions require explainability tooling (SHAP, LIME, or equivalent).' },
      { heading: 'Human Oversight', body: 'High-risk AI decisions must have a defined human review pathway. Individuals have the right to challenge automated decisions and request human review.' },
      { heading: 'Controls', body: 'UCF.AI.02 (AI Data Privacy & Bias Controls) · UCF.AI.08 (AI Explainability & Transparency) · UCF.AI.09 (AI Data Provenance & Lineage)' },
      { heading: 'Owner', body: 'A. Patel · Review annually · Next review: 2026-12-31' },
    ]
  },
  'POL-009': {
    title: 'AI Vendor Risk Policy',
    sections: [
      { heading: 'Purpose', body: 'This policy governs the procurement, assessment, and ongoing oversight of third-party AI vendors and model providers, ensuring data protection obligations and EU AI Act Article 28 requirements are met.' },
      { heading: 'Scope', body: 'Applies to all LLM providers, ML platform vendors, AI-enabled SaaS tools, and any third party that processes organisational or customer data through AI models.' },
      { heading: 'Pre-Procurement Requirements', body: 'Before contracting any AI vendor, the GRC team must complete: security questionnaire, Data Processing Agreement (DPA), model provenance review, and EU AI Act conformity assessment where applicable.' },
      { heading: 'Data Transfer Controls', body: 'Prompt data sent to external LLM providers must be classified. PII must be pseudonymised or redacted before transmission. Vendors must confirm data is not used for model training without explicit consent.' },
      { heading: 'Ongoing Monitoring', body: 'AI vendors must be re-assessed annually or upon material changes to their service. Questionnaire responses must be reviewed against current risk scores in the vendor register.' },
      { heading: 'Controls', body: 'UCF.AI.04 (AI Vendor Risk Management) · UCF.06.01 (Third Party Risk Assessment) · UCF.06.02 (Vendor Questionnaire Process)' },
      { heading: 'Owner', body: 'S. Chen · Review annually · Next review: 2026-12-31' },
    ]
  },
};

function PolicyDraftModal({ policy, onClose }) {
  const draft = POLICY_DRAFTS[policy.id];
  if (!draft) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded">AI Draft</span>
              <span className="text-xs text-gray-400">Generated from UCF control mappings</span>
            </div>
            <h2 className="text-base font-bold text-gray-900">{draft.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {draft.sections.map(s => (
            <div key={s.heading}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{s.heading}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
          <p className="text-xs text-gray-400">Review and edit before submitting for approval. Wire to LLM gateway for dynamic generation.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-white text-gray-600">Close</button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1.5">
              <Download size={13} /> Export Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyModule({ focusId }) {
  const openDetail = useRiskDetail();
  const { policies, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [draftPolicy, setDraftPolicy] = useState(null);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 24 * 3600000));

  useEffect(() => {
    if (focusId) { setStatusFilter('All'); setSearch(''); setShowAI(false); }
  }, [focusId]);

  const getDraftText = (policy) => `# ${policy.title}\n\n**Status:** Draft v0.1 — AI-assisted\n**Owner:** ${policy.owner}\n**Category:** ${policy.category}\n\n## 1. Purpose\nThis policy establishes requirements for ${policy.title.toLowerCase()} within the GRC platform and all AI systems operated by the organisation.\n\n## 2. Scope\nApplies to all employees, contractors, and third parties who develop, operate, or interact with AI systems.\n\n## 3. Policy Requirements\n[Requirements to be completed by ${policy.owner} — framework references: ${ctrlMap[policy.controlId]?.frameworks?.join(', ') || 'UCF controls'}]\n\n## 4. Controls & Compliance\nLinked control: ${policy.controlId} — ${ctrlMap[policy.controlId]?.name}\n\n## 5. Review Cycle\nAnnual review or upon material change to AI systems.\n\n_This draft was generated to accelerate policy creation. Review and approval required before publishing._`;

  const data = policies.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    (!showAI || p.ai) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const missing = policies.filter(p => p.status === 'Missing').length;
  const overdue = policies.filter(p => p.status === 'Overdue').length;
  const exceptions = policies.reduce((s, p) => s + p.exceptions, 0);

  const missingAIPolicies = policies.filter(p => p.status === 'Missing' && p.ai);

  return (
    <div className="space-y-4">
      {draftPolicy && <PolicyDraftModal policy={draftPolicy} onClose={() => setDraftPolicy(null)} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Missing Policies"  value={missing}    icon={AlertTriangle} color="#EF4444" subtitle={`${missing} AI policies don't exist yet — blocks EU AI Act & ISO 42001`} />
        <KPICard title="Overdue Reviews"   value={overdue}    icon={FileText}      color="#F97316" subtitle="Review deadline passed — policy may no longer reflect current risk" />
        <KPICard title="Open Exceptions"   value={exceptions} icon={Eye}           color="#EAB308" subtitle="Each exception is an approved deviation from policy — needs annual review" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Policy Control · {ctrlMap['UCF.07.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.07.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.07.01']?.effectiveness} score={ctrlMap['UCF.07.01']?.score} />
        </div>
      </div>

      {/* Risk-Register signal: AI governance risks */}
      {(() => {
        const aiGovRisks = risks.filter(r => r.signalSource === 'ai_governance');
        if (aiGovRisks.length === 0) return null;
        return (
          <div className="bg-white rounded-xl border border-purple-100 shadow-sm">
            <div className="px-5 py-3 border-b border-purple-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-semibold text-gray-800">Risk Register — AI Governance Signals</span>
              <span className="ml-auto text-[10px] text-gray-400 italic">sample · illustrative data</span>
            </div>
            <div className="divide-y divide-gray-50">
              {aiGovRisks.map(r => (
                <div key={r.id} onClick={() => openDetail(r)} className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-blue-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">ai governance</span>
                      <span className="text-[10px] text-gray-500">SLA: {r.slaDays}d · {r.owner}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{r.whyItMatters}</p>
                    {r.controls && r.controls.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {r.controls.map(c => (
                          <span key={c.framework} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded">{c.framework}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">Inherent → Residual</p>
                    <p className="text-sm font-bold text-gray-800">{r.inherentScore} <span className="text-gray-400">→</span> {r.residualScore}</p>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Policy Next Action */}
      {(() => {
        const missingAI = policies.filter(p => p.status === 'Missing' && p.ai)[0];
        const overduePolicy = policies.filter(p => p.status === 'Overdue')[0];
        const nextAction = missingAI
          ? { action: `Create ${missingAI.title} — blocks EU AI Act remediation`, owner: missingAI.owner, deadline: 'Jun 30', urgency: 'high' }
          : overduePolicy
          ? { action: `Review ${overduePolicy.title} — overdue since ${overduePolicy.reviewDate}`, owner: overduePolicy.owner, deadline: 'This week', urgency: 'medium' }
          : { action: 'Schedule policy reviews for next quarter', owner: 'S. Chen', deadline: 'Q3 2026', urgency: 'low' };
        return <NextActionCard {...nextAction} />;
      })()}

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800">3 AI Policies Missing · Action Required</p>
          <p className="text-xs text-red-700 mt-0.5 font-medium">Blocks EU AI Act remediation — immediate action required</p>
          <p className="text-xs text-gray-600 mt-1 mb-3">Required by EU AI Act, ISO/IEC 42001, and GDPR Art.22. Controls {ctrlMap['UCF.AI.01']?.id}, {ctrlMap['UCF.AI.02']?.id}, {ctrlMap['UCF.AI.04']?.id} are ineffective until these policies exist.</p>
          <div className="flex flex-wrap gap-2">
            {missingAIPolicies.map(p => (
              <button key={p.id} onClick={() => setDraftPolicy(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                <Cpu size={11} /> Draft {p.title.replace(' Policy', '')} Policy with AI
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Policy Library" subtitle={`${data.length} policies`} search={search} setSearch={setSearch}
          syncedAt={lastSynced}
          onRefresh={() => setLastSynced(new Date())}
          filters={<>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','Current','Due for Review','Overdue','Missing'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowAI(a => !a)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showAI ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Cpu size={13} /> AI Only
            </button>
          </>}
        />
        <ModuleTable
          columns={[
            { key: 'id',          label: 'ID',         render: r => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
            { key: 'title',       label: 'Policy',     render: r => <div className="flex items-center gap-1.5"><span className="text-sm font-medium text-gray-800">{r.title}</span>{r.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">AI</span>}</div> },
            { key: 'category',    label: 'Category',   render: r => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{r.category}</span> },
            { key: 'status',      label: 'Status',     render: r => <StatusBadge status={r.status} /> },
            { key: 'version',     label: 'Version',    render: r => <span className="text-xs font-mono text-gray-500">{r.version || '-'}</span> },
            { key: 'reviewDate',  label: 'Review Due', render: r => <span className={`text-xs ${!r.reviewDate||r.reviewDate<new Date().toISOString().slice(0,10)?'text-red-500 font-medium':'text-gray-500'}`}>{r.reviewDate ? fmtDate(r.reviewDate) : 'Not set'}</span> },
            { key: 'exceptions',  label: 'Exceptions', render: r => <span className={`text-sm font-semibold ${r.exceptions>0?'text-amber-600':'text-gray-400'}`}>{r.exceptions}</span> },
            { key: 'owner',       label: 'Owner',      render: r => <span className="text-xs text-gray-500">{r.owner}</span> },
            { key: 'ctrl',        label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',         label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
            { key: 'draft',       label: '',           render: r => r.status === 'Missing' ? (
              <button onClick={() => setDraftPolicy(r)}
                className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold hover:bg-purple-100 transition-colors whitespace-nowrap">
                <Cpu size={10} />
                Draft with AI
              </button>
            ) : null },
          ]}
          rows={data}
          focusId={focusId}
        />
      </div>

      {/* Policy Exceptions — derived from risk register */}
      {(() => {
        const exceptions = risks.filter(r => r.isException);
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-sm font-semibold text-gray-800">Policy Exceptions</span>
              <span className="ml-auto text-[10px] text-gray-400 italic">derived from risk register</span>
            </div>
            {exceptions.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active policy exceptions</p>
                <p className="text-xs text-gray-400 mt-1">Exceptions surface automatically when a risk record has isException: true</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {exceptions.map(r => (
                  <div key={r.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-semibold">exception</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{r.title}</p>
                      {r.exceptionExpiry && <p className="text-xs text-gray-500 mt-0.5">Expires: {r.exceptionExpiry} · {r.owner}</p>}
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Policy Draft Modal */}
      {draftPolicy && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDraftPolicy(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">AI Policy Draft — {draftPolicy.title}</h3>
              </div>
              <button onClick={() => setDraftPolicy(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                <p className="text-xs text-amber-700">AI-generated draft — review and approval required before publishing. This is a starting point only.</p>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{getDraftText(draftPolicy)}</pre>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 font-medium">Open in Editor</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">Copy Draft</button>
              <button onClick={() => setDraftPolicy(null)} className="px-4 py-2 text-gray-500 text-sm ml-auto">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Third Party ──────────────────────────────────────────────────────────────

function ThirdParty({ focusId }) {
  const openDetail = useRiskDetail();
  const { vendors, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 3 * 3600000));

  useEffect(() => {
    if (focusId) { setStatusFilter('All'); setSearch(''); setShowAI(false); }
  }, [focusId]);

  const data = vendors.filter(v =>
    (statusFilter === 'All' || v.status === statusFilter) &&
    (!showAI || v.ai) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const noContract = vendors.filter(v => v.status === 'No Contract').length;
  const highRisk = vendors.filter(v => v.riskScore >= 60).length;
  const aiVendors = vendors.filter(v => v.ai).length;
  const aiNoDpa = vendors.filter(v => v.ai && v.status !== 'Active').length;
  const tpAsk = aiNoDpa > 0
    ? `${aiNoDpa} AI vendor${aiNoDpa>1?'s':''} operating without a Data Processing Agreement — GDPR Art. 28 exposure (fine up to 2% of global revenue). Legal must initiate DPAs or offboard these vendors this week.`
    : noContract > 0
      ? `${noContract} vendor${noContract>1?'s':''} without active contracts. Procurement sign-off required before these vendors process any company data.`
      : 'Vendor contracts in order. Schedule annual risk re-assessments for high-risk vendors.';

  // Risks with signalSource === 'supply_chain' surface here
  const scRisks = risks.filter(r => r.signalSource === 'supply_chain');

  return (
    <div className="space-y-4">
      <SectionContext
        what="All vendor relationships scored for security posture, contract status, and data processing compliance. AI vendors receive enhanced scrutiny due to data transfer and model governance obligations."
        why="Third-party integrations extend your attack surface. A vendor breach becomes your breach. Missing DPAs create direct GDPR Art. 28 liability — not a supplier problem, your problem."
        ask={tpAsk}
        askUrgency={aiNoDpa > 0 ? 'critical' : noContract > 0 ? 'high' : 'normal'}
      />

      {/* Risk-Register signal: supply chain risks */}
      {scRisks.length > 0 && (
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
          <div className="px-5 py-3 border-b border-orange-50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-sm font-semibold text-gray-800">Risk Register — Supply Chain Signals</span>
            <span className="ml-auto text-[10px] text-gray-400 italic">sample · illustrative data</span>
          </div>
          <div className="divide-y divide-gray-50">
            {scRisks.map(r => (
              <div key={r.id} onClick={() => openDetail(r)} className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{getRiskRating(r.residualScore)} residual</span>
                    <span className="text-[10px] text-gray-500">SLA: {r.slaDays}d · {r.owner}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.whyItMatters}</p>
                  {r.controls && r.controls.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {r.controls.map(c => (
                        <span key={c.framework} className="text-[10px] bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded">{c.framework}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Inherent → Residual</p>
                  <p className="text-sm font-bold text-gray-800">{r.inherentScore} <span className="text-gray-400">→</span> {r.residualScore}</p>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="High-Risk Vendors"  value={highRisk}    icon={Building2}     color="#EF4444" subtitle="risk score ≥ 60" />
        <KPICard title="No Contract"        value={noContract}  icon={AlertTriangle} color="#F97316" subtitle="uncontracted AI vendors" />
        <KPICard title="AI Vendors"         value={aiVendors}   icon={Cpu}           color="#9333EA" subtitle="LLM & AI tool providers" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">TP Control · {ctrlMap['UCF.06.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.06.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.06.01']?.effectiveness} score={ctrlMap['UCF.06.01']?.score} />
        </div>
      </div>

      {/* Third Party Next Action */}
      {(() => {
        const noContractVendor = vendors.find(v => v.status === 'No Contract');
        const nextAction = noContractVendor
          ? { action: `Execute DPA with ${noContractVendor.name} — no contract, processes prompt data`, owner: noContractVendor.id === 'TP-007' ? 'S. Chen' : ctrlMap['UCF.AI.04']?.owner, deadline: 'Jul 1', urgency: 'high' }
          : { action: 'Complete overdue vendor questionnaires', owner: 'S. Chen', deadline: 'This week', urgency: 'medium' };
        return <NextActionCard {...nextAction} />;
      })()}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">AI Vendor Risk Gap · {ctrlMap['UCF.AI.04']?.id}: {ctrlMap['UCF.AI.04']?.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">OpenAI has no contract and no last assessment date. Anthropic and Cohere questionnaires are overdue. These vendors process prompt data potentially including PII. Control effectiveness: <strong className="text-amber-700">Partial (51%)</strong>. Required by {ctrlMap['UCF.AI.04']?.frameworks.join(', ')}.</p>
        </div>
        <EffectivenessBadge effectiveness={ctrlMap['UCF.AI.04']?.effectiveness} score={ctrlMap['UCF.AI.04']?.score} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Third Party Register" subtitle={`${data.length} vendors`} search={search} setSearch={setSearch}
          syncedAt={lastSynced}
          onRefresh={() => setLastSynced(new Date())}
          filters={<>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','Compliant','Review Pending','Questionnaire Overdue','SLA Breach','No Contract'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowAI(a => !a)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showAI ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Cpu size={13} /> AI Only
            </button>
          </>}
        />
        <ModuleTable
          columns={[
            { key: 'id',           label: 'ID',         render: r => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
            { key: 'name',         label: 'Vendor',     render: r => <div className="flex items-center gap-1.5"><span className="text-sm font-medium text-gray-800">{r.name}</span>{r.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium flex-shrink-0">AI</span>}</div> },
            { key: 'category',     label: 'Category',   render: r => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded whitespace-nowrap">{r.category}</span> },
            { key: 'tier',         label: 'Tier',       render: r => <span className={`text-xs font-semibold ${r.tier===1?'text-red-500':'text-amber-500'}`}>Tier {r.tier}</span> },
            { key: 'riskScore',    label: 'Risk Score', render: r => (
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-gray-100 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width:`${r.riskScore}%`, background: r.riskScore>=70?'#EF4444':r.riskScore>=50?'#F97316':'#22C55E' }} /></div>
                  <span className="text-xs font-bold text-gray-700">{r.riskScore}</span>
                </div>
              )
            },
            { key: 'status',       label: 'Status',     render: r => <StatusBadge status={r.status} /> },
            { key: 'dataShared',   label: 'Data Shared',render: r => <span className="text-xs text-gray-500">{r.dataShared}</span> },
            { key: 'contractExpiry',label:'Contract',   render: r => { const in90 = new Date(); in90.setDate(in90.getDate()+90); const exp90 = in90.toISOString().slice(0,10); return <span className={`text-xs ${!r.contractExpiry?'text-red-500 font-semibold':r.contractExpiry<exp90?'text-amber-600':'text-gray-500'}`}>{r.contractExpiry ? fmtDate(r.contractExpiry) : 'None'}</span>; } },
            { key: 'lastAssessed', label: 'Last Assessed', render: r => <span className={`text-xs ${!r.lastAssessed?'text-red-500 font-semibold':'text-gray-500'}`}>{r.lastAssessed ? fmtDate(r.lastAssessed) : 'Never'}</span> },
            { key: 'ctrl',         label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',          label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
          ]}
          rows={data}
          focusId={focusId}
        />
      </div>
    </div>
  );
}

// ─── Compliance ───────────────────────────────────────────────────────────────

function Compliance() {
  const { frameworks } = useGRCData();
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);

  const overall    = Math.round(frameworks.reduce((s,f) => s+f.progress, 0) / frameworks.length);
  const aiFrames    = frameworks.filter(f => f.name.includes('AI') || f.name.includes('42001'));
  const aiCoverage  = Math.round(aiFrames.reduce((s,f) => s+f.progress, 0) / aiFrames.length);
  const aiPassing   = aiFrames.reduce((s,f) => s + (f.passing ?? 0), 0);
  const aiTotal     = aiFrames.reduce((s,f) => s + (f.controls ?? 0), 0);
  const euAiActFw   = aiFrames.find(f => f.name.includes('EU AI'));
  const iso42001Fw  = aiFrames.find(f => f.name.includes('42001'));
  const certified  = frameworks.filter(f => f.status === 'Certified' || f.status === 'Compliant').length;
  const gapCount   = frameworks.filter(f => f.status === 'Gap').length;
  const compAsk = aiCoverage < 30
    ? `EU AI Act enforcement is live. At ${aiCoverage}% coverage every AI feature we ship carries unmitigated regulatory exposure. Board decision required this week: approve remediation budget or formally accept the risk on the register.`
    : gapCount > 0
      ? `${gapCount} framework${gapCount>1?'s':''} at Gap status. Review blockers and assign remediation owners before the next audit cycle.`
      : 'Compliance posture is healthy. Maintain cadence and prepare evidence packages for upcoming audit windows.';

  const gapPlan = [
    { step: 1, action: 'Create AI Usage & Governance Policy (POL-007)', impact: '+4 controls', owner: 'A. Patel', deadline: 'Jun 30', effort: 'Low' },
    { step: 2, action: 'Test UCF.AI.01 (AI Model Governance) and document evidence', impact: '+3 controls', owner: 'A. Patel', deadline: 'Jul 15', effort: 'Medium' },
    { step: 3, action: 'Execute OpenAI DPA — satisfies EU AI Act Art.28', impact: '+2 controls', owner: 'S. Chen', deadline: 'Jul 1', effort: 'Low' },
    { step: 4, action: 'Run AI risk categorisation for all 6 AI use cases', impact: '+2 controls', owner: 'A. Patel', deadline: 'Jul 31', effort: 'Medium' },
    { step: 5, action: 'Conduct AI tabletop exercise (UCF.AI.05)', impact: '+2 controls', owner: 'K. Thompson', deadline: 'Aug 30', effort: 'High' },
  ];
  const projectedProgress = 22 + gapPlan.reduce((sum, s) => sum + parseInt(s.impact), 0);

  return (
    <div className="space-y-4">
      <SectionContext
        what="Coverage across all active regulatory frameworks: SOC 2, ISO 27001, ISO 42001, EU AI Act, NIST CSF, and NIST AI RMF. Each framework maps to UCF controls with live effectiveness scores."
        why="Compliance gaps are not just audit findings — they are unmitigated legal and regulatory exposure. EU AI Act enforcement is live in 2026 with fines up to 3% of global annual turnover."
        ask={compAsk}
        askUrgency={aiCoverage < 30 ? 'critical' : gapCount > 0 ? 'high' : 'normal'}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Overall Coverage"      value={`${overall}%`}   icon={Shield}        color="#2563EB" subtitle={`avg across ${frameworks.length} frameworks`} />
        <KPICard title="AI Compliance"         value={`${aiCoverage}%`} icon={Cpu}          color="#9333EA" subtitle={aiTotal > 0 ? `${aiPassing} of ${aiTotal} controls · EU AI Act ${euAiActFw?.progress ?? '—'}% · ISO 42001 ${iso42001Fw?.progress ?? '—'}%` : 'EU AI Act + ISO 42001'} />
        <KPICard title="Certified / Compliant" value={certified}       icon={CheckCircle}   color="#22C55E" subtitle={`of ${frameworks.length} total frameworks`} />
        <KPICard title="Frameworks at Gap"     value={gapCount}        icon={AlertTriangle} color="#EF4444" subtitle="immediate remediation required" />
      </div>

      {/* Compliance Next Action */}
      {(() => {
        const worstFramework = [...frameworks].filter(f => f.status === 'Gap').sort((a,b) => a.progress-b.progress)[0];
        const nextAction = worstFramework
          ? { action: `${worstFramework.name} at ${worstFramework.progress}% — ${worstFramework.controls - worstFramework.passing} controls failing`, owner: 'A. Patel', deadline: 'Q4 2026', urgency: 'high' }
          : { action: 'Review framework coverage gaps with engineering teams', owner: 'S. Chen', deadline: 'This quarter', urgency: 'low' };
        return <NextActionCard {...nextAction} />;
      })()}

      {/* Compliance module actions */}
      <div className="flex justify-end">
        <button onClick={() => setShowGapAnalysis(s => !s)}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
          <Cpu size={12} />
          Gap Analysis
        </button>
      </div>

      {/* Gap Analysis Panel */}
      {showGapAnalysis && (
        <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-purple-600" />
              <h3 className="font-semibold text-gray-900 text-sm">EU AI Act — Gap Analysis & Remediation Plan</h3>
              <span className="text-xs text-gray-400">Current: 22% → Projected: ~{projectedProgress}%</span>
            </div>
            <button onClick={() => setShowGapAnalysis(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
          </div>
          <div className="space-y-2">
            {gapPlan.map(g => (
              <div key={g.step} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{g.step}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{g.action}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-green-700 font-semibold">{g.impact}</span>
                    <span className="text-xs text-gray-400">{g.owner}</span>
                    <span className="text-xs text-gray-400">Due {g.deadline}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${g.effort==='Low'?'bg-green-100 text-green-700':g.effort==='Medium'?'bg-amber-100 text-amber-700':'bg-red-100 text-red-700'}`}>{g.effort} effort</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Completing all 5 steps moves EU AI Act from 22% → ~{projectedProgress}% within 12 weeks.</p>
        </div>
      )}

      {/* EU AI Act urgent callout */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-4">
        <div className="flex-shrink-0 w-16 text-center">
          <p className="text-3xl font-bold text-red-600">22%</p>
          <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">EU AI Act</p>
        </div>
        <div className="w-px bg-red-200 self-stretch flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">EU AI Act Enforcement Risk</p>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">Enforcement 2026</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">ISO 42001 · 18%</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">Only 7 of 31 EU AI Act controls passing. Primary blockers: 3 missing AI policies, 7 untested AI controls, no AI model governance programme. ISO/IEC 42001 is similarly at 18% (8/44). Both frameworks require urgent remediation before enforcement.</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 bg-red-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-red-500" style={{width:'22%'}} />
            </div>
            <span className="text-xs text-red-600 font-semibold whitespace-nowrap">7 / 31 controls</span>
          </div>
        </div>
      </div>

      {/* Risk-mapped control hotspots from risk register */}
      {(() => {
        const fwCount = {};
        risks.forEach(r => (r.controls || []).forEach(c => { if (!fwCount[c.framework]) fwCount[c.framework] = { count: 0, gaps: [], risks: [] }; fwCount[c.framework].count++; fwCount[c.framework].gaps.push(c.gap); fwCount[c.framework].risks.push(r.id); }));
        const hotspots = Object.entries(fwCount).filter(([,v]) => v.count > 1).sort((a,b) => b[1].count - a[1].count).slice(0, 4);
        if (hotspots.length === 0) return null;
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-semibold text-gray-800">Risk-Mapped Control Hotspots</span>
              <span className="text-xs text-gray-400 ml-1">· framework requirements referenced by multiple risks</span>
              <span className="ml-auto text-[10px] text-gray-400 italic">sample data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-50">
              {hotspots.map(([fw, v]) => (
                <div key={fw} className="bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 font-mono">{fw}</span>
                    <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-semibold">{v.count} risks</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1.5">{v.risks.join(' · ')}</p>
                  <ul className="space-y-0.5">
                    {[...new Set(v.gaps)].slice(0,2).map(g => (
                      <li key={g} className="text-[10px] text-gray-500 flex items-start gap-1"><span className="text-red-400 flex-shrink-0">▸</span>{g}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Framework cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {frameworks.map(f => {
          const statusColor = f.status === 'Certified' || f.status === 'Compliant' ? 'text-emerald-600 bg-emerald-50' : f.status === 'Gap' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
          return (
            <div key={f.name} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${f.status==='Gap'?'border-red-200':'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-gray-900 text-sm">{f.name}</h3>
                    {(f.name.includes('AI') || f.name.includes('42001')) && <Cpu size={12} className="text-purple-500" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{f.passing}/{f.controls} controls</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{f.status}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div className="h-2 rounded-full" style={{ width:`${f.progress}%`, background: f.color }} />
              </div>
              <p className="text-xs text-right font-semibold text-gray-700">{f.progress}%</p>
              {f.name === 'EU AI Act' && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  {f.controls - f.passing} of {f.controls} controls failing — enforcement approaching
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Framework Coverage Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={frameworks} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip formatter={v => `${v}%`} contentStyle={{ borderRadius:'8px', border:'1px solid #E5E7EB', fontSize:12 }} />
            <Bar dataKey="progress" name="Coverage" radius={[4,4,0,0]}>
              {frameworks.map(f => <Cell key={f.name} fill={f.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── UCF Controls Library View ────────────────────────────────────────────────

// ─── Framework Alignment Data ────────────────────────────────────────────────

const frameworkDefs = [
  {
    id: 'ALL',        label: 'All Controls',   shortLabel: 'All',      color: '#475569', icon: '⊞',
    description: 'Every UCF control across all frameworks · one control ID satisfies multiple regulatory requirements simultaneously.',
    type: 'meta',
  },
  {
    id: 'NIST_CSF',   label: 'NIST CSF',       shortLabel: 'NIST CSF', color: '#2563EB', icon: '🔒',
    description: 'Cybersecurity Framework (v2.0). Organises cybersecurity activities into five functions: Identify, Protect, Detect, Respond, Recover. The most widely adopted cybersecurity framework globally.',
    match: (f) => f.includes('NIST') && !f.includes('AI') && !f.includes('RMF'),
    type: 'cybersecurity',
  },
  {
    id: 'NIST_AI_RMF',label: 'NIST AI RMF',    shortLabel: 'AI RMF',   color: '#7C3AED', icon: '🤖',
    description: 'AI Risk Management Framework (2023). Four functions · Govern, Map, Measure, Manage · designed specifically for AI-related risks including bias, explainability, model drift, and AI supply chain.',
    match: (f) => f.includes('NIST AI') || f.includes('AI RMF'),
    type: 'ai',
  },
  {
    id: 'SOC2',        label: 'SOC 2',          shortLabel: 'SOC 2',    color: '#0891B2', icon: '✅',
    description: 'Service Organization Control 2. Five Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy. Required for SaaS and cloud service providers.',
    match: (f) => f.includes('SOC2') || f.includes('SOC 2'),
    type: 'audit',
  },
  {
    id: 'ISO27001',    label: 'ISO 27001',       shortLabel: 'ISO 27001',color: '#059669', icon: '🌐',
    description: 'International standard for Information Security Management Systems (ISMS). Annex A provides 93 controls across 4 themes: Organisational, People, Physical, and Technological.',
    match: (f) => f.includes('ISO A.') || f.includes('ISO/IEC 27001'),
    type: 'standard',
  },
  {
    id: 'GDPR',        label: 'GDPR',            shortLabel: 'GDPR',     color: '#D97706', icon: '🇪🇺',
    description: 'EU General Data Protection Regulation. Governs lawful processing, individual rights, data minimisation, breach notification, and international transfers of personal data.',
    match: (f) => f.includes('GDPR'),
    type: 'regulation',
  },
  {
    id: 'EU_AI_ACT',   label: 'EU AI Act',        shortLabel: 'EU AI Act',color: '#DC2626', icon: '⚖️',
    description: 'First comprehensive AI law globally (effective 2024–2026). Risk-based approach: prohibited AI practices, high-risk AI system requirements, transparency obligations, and AI governance mandates.',
    match: (f) => f.includes('EU AI Act'),
    type: 'ai',
  },
  {
    id: 'ISO42001',    label: 'ISO/IEC 42001',    shortLabel: '42001',    color: '#9333EA', icon: '🧠',
    description: 'AI Management System Standard (2023). Establishes requirements for responsible development and use of AI systems including governance, risk management, and continual improvement.',
    match: (f) => f.includes('42001'),
    type: 'ai',
  },
];

const typeColors = { cybersecurity:'bg-blue-50 text-blue-700', ai:'bg-purple-50 text-purple-700', audit:'bg-cyan-50 text-cyan-700', standard:'bg-green-50 text-green-700', regulation:'bg-amber-50 text-amber-700', meta:'bg-slate-50 text-slate-600' };

// ─── Monthly History + Gamification ──────────────────────────────────────────

const monthlyHistory = {
  identity: [
    { month:'Mar 2026', health:52, gaps:2, vulns:3, incidents:2 },
    { month:'Apr 2026', health:58, gaps:2, vulns:2, incidents:2 },
    { month:'May 2026', health:67, gaps:1, vulns:2, incidents:1 },
  ],
  data: [
    { month:'Mar 2026', health:20, gaps:7, vulns:2, incidents:1 },
    { month:'Apr 2026', health:24, gaps:6, vulns:2, incidents:1 },
    { month:'May 2026', health:29, gaps:5, vulns:2, incidents:2 },
  ],
  infra: [
    { month:'Mar 2026', health:40, gaps:4, vulns:5, incidents:0 },
    { month:'Apr 2026', health:40, gaps:4, vulns:4, incidents:1 },
    { month:'May 2026', health:50, gaps:3, vulns:3, incidents:1 },
  ],
  secops: [
    { month:'Mar 2026', health:58, gaps:3, vulns:0, incidents:4 },
    { month:'Apr 2026', health:62, gaps:2, vulns:0, incidents:3 },
    { month:'May 2026', health:65, gaps:2, vulns:0, incidents:3 },
  ],
  grc: [
    { month:'Mar 2026', health:38, gaps:3, vulns:1, incidents:1 },
    { month:'Apr 2026', health:44, gaps:3, vulns:1, incidents:1 },
    { month:'May 2026', health:50, gaps:2, vulns:1, incidents:1 },
  ],
  rd: [
    { month:'Mar 2026', health:30, gaps:4, vulns:3, incidents:0 },
    { month:'Apr 2026', health:35, gaps:4, vulns:3, incidents:0 },
    { month:'May 2026', health:40, gaps:3, vulns:3, incidents:0 },
  ],
};

const LEVELS = [
  { name:'Bronze',   min:0,  max:49,  color:'#B45309', bg:'bg-amber-100',  text:'text-amber-900',  bar:'bg-amber-500',  next:50,  icon:'🥉' },
  { name:'Silver',   min:50, max:69,  color:'#6B7280', bg:'bg-gray-100',   text:'text-gray-700',   bar:'bg-gray-400',   next:70,  icon:'🥈' },
  { name:'Gold',     min:70, max:84,  color:'#CA8A04', bg:'bg-yellow-100', text:'text-yellow-900', bar:'bg-yellow-400', next:85,  icon:'🥇' },
  { name:'Platinum', min:85, max:100, color:'#6366F1', bg:'bg-indigo-100', text:'text-indigo-800', bar:'bg-indigo-500', next:100, icon:'💎' },
];
const getLevel = (h) => LEVELS.find(l => h >= l.min && h <= l.max) ?? LEVELS[0];

const computeBadges = (teamId, stats, hist) => {
  const badges = [];
  const prev = hist[hist.length - 2];
  const curr = hist[hist.length - 1];
  if (curr && prev && curr.health - prev.health >= 5) badges.push({ icon:'🚀', label:'Most Improved', desc:`+${curr.health - prev.health}% MoM` });
  if (stats.gaps === 0) badges.push({ icon:'⭐', label:'Zero Gaps', desc:'All controls effective/partial' });
  if (stats.openInc === 0) badges.push({ icon:'🛡️', label:'Clean Sheet', desc:'No open incidents' });
  const allImproving = hist.length >= 3 && hist[0].health < hist[1].health && hist[1].health < hist[2].health;
  if (allImproving) badges.push({ icon:'🔥', label:'On A Roll', desc:'3 months of improvement' });
  const multiFramework = stats.owned.filter(c => c.frameworks.length >= 3).length;
  if (multiFramework >= 2) badges.push({ icon:'🌐', label:'Framework Leader', desc:`${multiFramework} controls cover 3+ frameworks` });
  return badges;
};

// ─── Leadership Scorecard ─────────────────────────────────────────────────────

// Approval chain templates for common decision types
const APPROVAL_CHAINS = {
  'P0 Escalation':    [{ role: 'CISO', label: 'CISO Sign-off' }, { role: 'Board', label: 'Board Notification' }],
  'EU AI Act Budget': [{ role: 'CISO', label: 'CISO Review' }, { role: 'Board', label: 'Board Ratification' }],
  'Legal / DPA':      [{ role: 'Legal', label: 'Legal Review' }, { role: 'CISO', label: 'CISO Approval' }],
  'Risk Acceptance':  [{ role: 'Risk Owner', label: 'Risk Owner Sign-off' }, { role: 'CISO', label: 'CISO Acceptance' }],
  'Resource Decision':[{ role: 'CISO', label: 'CISO Approval' }, { role: 'CFO', label: 'CFO Budget Sign-off' }],
  'CISO Only':        [{ role: 'CISO', label: 'CISO Decision' }],
};

function Scorecard({ onViewReport }) {
  const { controls, vulns, incidents, vendors } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  // Persisted decision log
  const [decisionLog, setDecisionLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grc_decision_log') || '[]'); } catch { return []; }
  });

  // Workflow engine state
  const [workflows, setWorkflows] = useState(() => {
    try { return JSON.parse(localStorage.getItem('grc_workflows') || '[]'); } catch { return []; }
  });
  const [routeModal, setRouteModal] = useState(null); // decision being routed
  const [routeChain, setRouteChain] = useState('CISO Only');
  const [routeDue, setRouteDue] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [routeExternalRef, setRouteExternalRef] = useState('');
  const [actionNote, setActionNote] = useState({ wfId: null, action: null, text: '' });

  const saveWorkflows = (next) => {
    setWorkflows(next);
    localStorage.setItem('grc_workflows', JSON.stringify(next));
  };

  const routeForReview = (decision) => {
    const chain = APPROVAL_CHAINS[routeChain] ?? APPROVAL_CHAINS['CISO Only'];
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const refNo = `WF-${ym}-${String(workflows.length + 1).padStart(3, '0')}`;
    const wf = {
      id: `wf-${Date.now()}`,
      refNo,
      itemTitle: decision.title,
      itemType: routeChain,
      urgency: decision.urgency,
      routedBy: 'You',
      routedAt: new Date().toLocaleString(),
      dueDate: routeDue,
      externalRef: routeExternalRef.trim() || null,
      steps: chain.map((s, idx) => ({ ...s, status: idx === 0 ? 'pending' : 'waiting', actedAt: null, note: null })),
      currentStep: 0,
      status: 'in_progress',
    };
    saveWorkflows([...workflows, wf]);
    setRouteModal(null);
    setRouteExternalRef('');
  };

  const advanceWorkflow = (wfId, action, note = '') => {
    const next = workflows.map(wf => {
      if (wf.id !== wfId) return wf;
      const steps = [...wf.steps];
      steps[wf.currentStep] = { ...steps[wf.currentStep], status: action.toLowerCase(), actedAt: new Date().toLocaleString(), note: note.trim() || null };
      if (action === 'Approved' && wf.currentStep < steps.length - 1) {
        steps[wf.currentStep + 1] = { ...steps[wf.currentStep + 1], status: 'pending' };
        return { ...wf, steps, currentStep: wf.currentStep + 1, status: 'in_progress' };
      }
      return { ...wf, steps, status: action.toLowerCase() };
    });
    saveWorkflows(next);
    setActionNote({ wfId: null, action: null, text: '' });
  };

  const dismissWorkflow = (wfId) => saveWorkflows(workflows.filter(w => w.id !== wfId));

  const logDecision = (decision, action) => {
    setDecisionLog(prev => {
      const next = [...prev, {
        id: decision.title,
        action,
        timestamp: new Date().toLocaleString(),
        actor: 'CISO',
      }];
      localStorage.setItem('grc_decision_log', JSON.stringify(next));
      return next;
    });
  };

  const clearDecisionLog = () => {
    setDecisionLog([]);
    localStorage.removeItem('grc_decision_log');
  };

  const teamStats = teams.map(team => {
    const owned     = team.controls.map(id => ctrlMap[id]).filter(Boolean);
    const effective = owned.filter(c => c.effectiveness === 'effective').length;
    const partial   = owned.filter(c => c.effectiveness === 'partial').length;
    const gaps      = owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').length;
    const health    = owned.length ? Math.round(((effective + partial * 0.5) / owned.length) * 100) : 0;
    const openVulns = vulns.filter(v => owned.some(c => c.id === v.controlId) && v.status !== 'Patched').length;
    const openInc   = incidents.filter(i => owned.some(c => c.id === i.controlId) && i.status !== 'Resolved').length;
    const worstCtrl = owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').sort((a,b) => a.score - b.score)[0];
    const hist      = monthlyHistory[team.id] ?? [];
    const prevHealth= hist[hist.length - 2]?.health ?? health;
    const delta     = health - prevHealth;
    const level     = getLevel(health);
    const badges    = computeBadges(team.id, { gaps, openInc, owned }, hist);
    return { ...team, owned, effective, partial, gaps, health, openVulns, openInc, worstCtrl, hist, delta, level, badges };
  });

  const sorted        = [...teamStats].sort((a, b) => b.health - a.health);
  const criticalTeams = teamStats.filter(t => t.health < 50).length;
  const totalGaps     = teamStats.reduce((s, t) => s + t.gaps, 0);
  const avgHealth     = Math.round(teamStats.reduce((s, t) => s + t.health, 0) / teamStats.length);

  // Trend vs prior month
  const prevAvgHealth  = Math.round(Object.values(monthlyHistory).reduce((s, h) => s + (h[h.length - 2]?.health ?? 0), 0) / Object.values(monthlyHistory).length);
  const healthDelta    = avgHealth - prevAvgHealth;
  const prevTotalGaps  = Object.values(monthlyHistory).reduce((s, h) => s + (h[h.length - 2]?.gaps ?? 0), 0);
  const gapDelta       = totalGaps - prevTotalGaps;

  // Leadership decisions — items requiring explicit sign-off or resource decision
  const p0Breach       = vulns.filter(v => v.priority === 'P0' && v.status !== 'Patched' && v.dueDate && daysFromToday(v.dueDate) < 0);
  const euAiAct        = frameworks.find(f => f.name === 'EU AI Act');
  const aiVendorGaps   = vendors.filter(v => v.ai && v.status !== 'Active').length;
  const crisisTeams    = teamStats.filter(t => t.health < 40);

  const leadershipDecisions = [
    ...p0Breach.map(v => ({
      urgency: 'critical', urgencyRank: 0, color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200',
      icon: AlertTriangle, tier: 'Board / CISO',
      title: 'P0 SLA Breach — CISO Escalation Required',
      detail: `${v.id} (${v.title}) is ${Math.abs(daysFromToday(v.dueDate))}d overdue on a 1-day SLA. Requires CISO sign-off or formal incident declaration.`,
      ask: 'Escalate / Declare Incident',
    })),
    ...(euAiAct && euAiAct.progress < 40 ? [{
      urgency: 'high', urgencyRank: 1, color: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200',
      icon: Globe, tier: 'Board / CISO',
      title: 'EU AI Act — Board Decision Required',
      detail: `${euAiAct.progress}% coverage with enforcement active. Options: approve remediation budget or formally accept regulatory exposure as residual risk.`,
      ask: 'Approve budget / Accept risk',
    }] : []),
    ...crisisTeams.map(t => ({
      urgency: 'high', urgencyRank: 1, color: '#F97316', bg: 'bg-orange-50', border: 'border-orange-200',
      icon: AlertTriangle, tier: 'VP+',
      title: `${t.name} in Crisis (${t.health}%) — Resource Decision`,
      detail: `${t.gaps} control gap${t.gaps !== 1 ? 's' : ''}, ${t.openVulns} open vuln${t.openVulns !== 1 ? 's' : ''}, ${t.openInc} unresolved incident${t.openInc !== 1 ? 's' : ''}. Requires resource allocation or formal risk acceptance.`,
      ask: 'Assign resources / Accept risk',
    })),
    ...(aiVendorGaps > 0 ? [{
      urgency: 'medium', urgencyRank: 2, color: '#EAB308', bg: 'bg-yellow-50', border: 'border-yellow-200',
      icon: Building2, tier: 'Director+',
      title: `${aiVendorGaps} AI Vendor${aiVendorGaps > 1 ? 's' : ''} Without DPA — Legal Action`,
      detail: `${aiVendorGaps} AI vendor${aiVendorGaps > 1 ? 's' : ''} operating without Data Processing Agreements. GDPR Art. 28 exposure. Procurement or Legal sign-off required.`,
      ask: 'Approve DPA / Offboard vendor',
    }] : []),
  ].sort((a,b) => a.urgencyRank - b.urgencyRank);

  const scorecardAsk = leadershipDecisions.length > 0
    ? `${leadershipDecisions.length} item${leadershipDecisions.length>1?'s':''} need your sign-off. ${leadershipDecisions[0]?.ask ? `Start with: ${leadershipDecisions[0].title}.` : ''} Each item below lists the exact decision required.`
    : 'No decisions pending. Program is tracking positively — review team health trends and upcoming review dates.';

  return (
    <div className="space-y-5">
      <SectionContext
        what="Program-level health across all security domains, team control ownership, and open decisions requiring leadership sign-off. Aggregates signals from every module into a single executive view."
        why="Security outcomes are determined by decisions made at leadership level — resource allocation, risk acceptance, incident escalation, regulatory investment. This module surfaces exactly those decisions."
        ask={scorecardAsk}
        askUrgency={leadershipDecisions.length > 0 ? (p0Breach.length > 0 ? 'critical' : 'high') : 'normal'}
      />
      {/* Program KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Program Health"     value={`${avgHealth}%`}  icon={Award}         color="#2563EB"
          subtitle={`${healthDelta >= 0 ? '+' : ''}${healthDelta}pp vs last month`}
          delta={`${healthDelta >= 0 ? '+' : ''}${healthDelta}pp MoM`} deltaType={healthDelta < 0 ? 'up' : undefined}
          sparkData={sparkData.health} />
        <KPICard title="Teams At Risk"      value={criticalTeams}    icon={AlertTriangle} color="#EF4444" subtitle="health below 50%" />
        <KPICard title="Control Gaps"       value={totalGaps}        icon={CheckSquare}   color="#D97706"
          subtitle={`${gapDelta <= 0 ? gapDelta : '+' + gapDelta} vs last month`}
          delta={`${gapDelta > 0 ? '+' : ''}${gapDelta} MoM`} deltaType={gapDelta > 0 ? 'up' : undefined} />
        <KPICard title="High Risk Exposure" value={risks.filter(r=>r.inherentScore>=15).length} icon={BarChart2} color="#7C3AED" subtitle="critical + high risks" />
      </div>

      {/* Leadership Decisions Required */}
      {leadershipDecisions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="font-semibold text-gray-900 text-sm">Leadership Decisions Required</h3>
            <span className="ml-auto text-xs text-gray-400">{leadershipDecisions.length} item{leadershipDecisions.length !== 1 ? 's' : ''} need your sign-off</span>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-64">
            {leadershipDecisions.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className={`px-5 py-4 flex items-start gap-4 ${d.bg}`}>
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon size={15} style={{ color: d.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{d.title}</p>
                      {d.tier && <DecisionTierBadge tier={d.tier} />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{d.detail}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      <button onClick={() => logDecision(d, 'Approved')}
                        className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded hover:bg-green-200 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => logDecision(d, 'Rejected')}
                        className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold rounded hover:bg-red-200 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => logDecision(d, 'Deferred')}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded hover:bg-gray-200 transition-colors">
                        Defer 30d
                      </button>
                      <button onClick={() => { setRouteModal(d); setRouteChain('CISO Only'); }}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1">
                        <ArrowUpRight size={9} /> Route for Review
                      </button>
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg border mt-0.5"
                    style={{ color: d.color, borderColor: d.color + '40', background: d.color + '10' }}>
                    {d.ask}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Decision Log */}
      {decisionLog.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare size={15} className="text-green-600" />
              Decision Log
              <span className="text-xs text-gray-400 font-normal">{decisionLog.length} recorded · persisted</span>
            </h3>
            <button onClick={clearDecisionLog} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
          </div>
          <div className="space-y-2">
            {[...decisionLog].reverse().map((d, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  d.action === 'Approved' ? 'bg-green-100 text-green-700' :
                  d.action === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{d.action}</span>
                <span className="text-gray-700 flex-1 truncate">{d.id}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{d.actor} · {d.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Sign-offs — in-flight workflows */}
      {workflows.filter(w => w.status === 'in_progress').length > 0 && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-blue-100 flex items-center gap-2 bg-blue-50">
            <ArrowUpRight size={14} className="text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-blue-900 text-sm">Pending Sign-offs</h3>
            <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-bold rounded-full">{workflows.filter(w=>w.status==='in_progress').length}</span>
            <span className="ml-auto text-xs text-blue-400">Active approval workflows</span>
          </div>
          <div className="divide-y divide-gray-50">
            {workflows.filter(w => w.status === 'in_progress').map(wf => {
              const current = wf.steps[wf.currentStep];
              const overdue = wf.dueDate && wf.dueDate < new Date().toISOString().slice(0,10);
              const isActing = actionNote.wfId === wf.id;
              return (
                <div key={wf.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded select-all">{wf.refNo || wf.id.slice(0,12)}</span>
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{wf.itemTitle}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">{wf.itemType}</span>
                        {overdue && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">OVERDUE</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Routed by {wf.routedBy} · {wf.routedAt} · Due {fmtDate(wf.dueDate)}
                        {wf.externalRef && <> · <span className="font-mono text-violet-600 font-semibold">{wf.externalRef}</span></>}
                      </p>
                    </div>
                    <button onClick={() => dismissWorkflow(wf.id)} className="text-gray-300 hover:text-gray-500 flex-shrink-0"><X size={13} /></button>
                  </div>
                  {/* Step chain */}
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {wf.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        {idx > 0 && <div className="w-4 h-px bg-gray-200 flex-shrink-0" />}
                        <span title={step.note ? `Note: ${step.note}` : undefined} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          step.status === 'approved'  ? 'bg-green-50 text-green-700 border-green-200' :
                          step.status === 'rejected'  ? 'bg-red-50 text-red-700 border-red-200' :
                          step.status === 'deferred'  ? 'bg-gray-50 text-gray-500 border-gray-200' :
                          step.status === 'pending'   ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse' :
                          'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                          {step.label}
                          {step.status !== 'waiting' && step.status !== 'pending' && ` · ${step.status}`}
                          {step.note && ' ✎'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Action area for current step */}
                  {current?.status === 'pending' && (
                    isActing ? (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">
                          {actionNote.action} — add a note <span className="font-normal text-gray-400">(optional)</span>
                        </p>
                        <textarea
                          autoFocus
                          value={actionNote.text}
                          onChange={e => setActionNote(n => ({ ...n, text: e.target.value }))}
                          placeholder="Reason, conditions, or context…"
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => advanceWorkflow(wf.id, actionNote.action, actionNote.text)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                              actionNote.action === 'Approved' ? 'bg-green-600 text-white hover:bg-green-700' :
                              actionNote.action === 'Rejected' ? 'bg-red-600 text-white hover:bg-red-700' :
                              'bg-gray-600 text-white hover:bg-gray-700'
                            }`}>
                            Confirm {actionNote.action}
                          </button>
                          <button
                            onClick={() => setActionNote({ wfId: null, action: null, text: '' })}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Awaiting {current.role}:</span>
                        <button onClick={() => setActionNote({ wfId: wf.id, action: 'Approved', text: '' })}
                          className="px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors">
                          Approve
                        </button>
                        <button onClick={() => setActionNote({ wfId: wf.id, action: 'Rejected', text: '' })}
                          className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 transition-colors">
                          Reject
                        </button>
                        <button onClick={() => setActionNote({ wfId: wf.id, action: 'Deferred', text: '' })}
                          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200 transition-colors">
                          Defer
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
          {/* Completed workflows summary */}
          {workflows.filter(w => w.status !== 'in_progress').length > 0 && (
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">{workflows.filter(w=>w.status!=='in_progress').length} completed workflow{workflows.filter(w=>w.status!=='in_progress').length!==1?'s':''} ·
                <button onClick={() => saveWorkflows(workflows.filter(w => w.status === 'in_progress'))} className="text-blue-400 hover:text-blue-600 ml-1 underline">Clear completed</button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Route for Review modal */}
      {routeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setRouteModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Route for Review</h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{routeModal.title}</p>
              </div>
              <button onClick={() => setRouteModal(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Approval Chain</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(APPROVAL_CHAINS).map(chain => (
                    <button key={chain} onClick={() => setRouteChain(chain)}
                      className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${routeChain === chain ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                      <p className="font-semibold">{chain}</p>
                      <p className={`text-[10px] mt-0.5 ${routeChain === chain ? 'text-blue-200' : 'text-gray-400'}`}>
                        {APPROVAL_CHAINS[chain].map(s => s.role).join(' → ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Due Date</label>
                <input type="date" value={routeDue} onChange={e => setRouteDue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">External Ticket Ref <span className="font-normal text-gray-400 normal-case tracking-normal">(optional)</span></label>
                <input type="text" value={routeExternalRef} onChange={e => setRouteExternalRef(e.target.value)}
                  placeholder="e.g. INC-12345 or RISK-678 or JIRA-90"
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 placeholder:font-sans placeholder:text-gray-400" />
              </div>
              <div className="bg-blue-50 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-700 font-medium">Chain: {APPROVAL_CHAINS[routeChain]?.map(s => s.label).join(' → ')}</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => routeForReview(routeModal)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Route for Review
              </button>
              <button onClick={() => setRouteModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Program Health */}
      {(() => {
        const aiCtrls     = controls.filter(c => c.ai);
        const aiTested    = aiCtrls.filter(c => c.effectiveness !== 'not_tested').length;
        const aiPct       = aiCtrls.length ? Math.round((aiTested / aiCtrls.length) * 100) : 0;
        const aiRisksOpen = risks.filter(r => r.ai && !['closed','Accepting/Monitoring'].includes(r.status)).length;
        const aiVendorGaps= vendors.filter(v => v.ai && v.status !== 'Active').length;
        const pctColor    = aiPct >= 70 ? '#22C55E' : aiPct >= 40 ? '#EAB308' : '#EF4444';
        return (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={14} className="text-purple-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-gray-800">AI Program Health</p>
              <span className="ml-auto text-xs text-gray-400">Across controls · risks · vendors</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-2xl font-bold" style={{color: pctColor}}>{aiPct}%</span>
                  <span className="text-xs text-gray-400">{aiTested}/{aiCtrls.length} tested</span>
                </div>
                <p className="text-xs text-gray-500 mb-1.5">AI controls tested</p>
                <div className="w-full bg-purple-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{width:`${aiPct}%`, background: pctColor}} />
                </div>
              </div>
              <div className="border-l border-purple-200 pl-4">
                <p className="text-2xl font-bold text-red-600 mb-0.5">{aiRisksOpen}</p>
                <p className="text-xs text-gray-500">AI risks open</p>
                <p className="text-xs text-red-500 font-medium mt-1">{aiRisksOpen} need treatment plans</p>
              </div>
              <div className="border-l border-purple-200 pl-4">
                <p className="text-2xl font-bold text-amber-600 mb-0.5">{aiVendorGaps}</p>
                <p className="text-xs text-gray-500">AI vendor gaps</p>
                <p className="text-xs text-amber-600 font-medium mt-1">No DPA or contract</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Crisis alert · teams below 30% health */}
      {teamStats.filter(t => t.health < 30).length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-red-800">Teams in Crisis · Immediate Attention Required</p>
          </div>
          <div className="space-y-2">
            {teamStats.filter(t => t.health < 30).map(t => {
              const Icon = t.icon;
              return (
                <div key={t.id} className="bg-white rounded-lg border border-red-100 px-3 py-2.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="p-1 rounded" style={{ background: t.color + '18' }}><Icon size={13} style={{ color: t.color }} /></div>
                    <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                    <span className="text-sm font-bold text-red-600">{t.health}%</span>
                    {t.delta < 0 && <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5"><TrendingDown size={11}/>{t.delta}% MoM</span>}
                    <span className="text-xs text-gray-400 ml-1">{t.gaps} control gap{t.gaps !== 1 ? 's' : ''} · {t.openVulns} open vuln{t.openVulns !== 1 ? 's' : ''}</span>
                    <button onClick={() => onViewReport(t.id)} className="ml-auto text-xs text-blue-600 font-semibold hover:underline">View Report →</button>
                  </div>
                  {(() => {
                    const teamControls = controls.filter(c => t.controls.includes(c.id));
                    const ineffective = teamControls.filter(c => c.effectiveness==='ineffective'||c.effectiveness==='not_tested');
                    if (ineffective.length > 0) {
                      const names = ineffective.slice(0,2).map(c => c.id).join(', ');
                      return <p className="text-xs text-red-400 mt-0.5">{ineffective.length} controls ineffective — {names}</p>;
                    }
                    return null;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Team Leaderboard · {new Date(new Date().setMonth(new Date().getMonth()-1)).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by health score. Reach Platinum (85%+) to lead the program.</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sorted.map((team, rank) => {
            const Icon = team.icon;
            const lvl  = team.level;
            return (
              <div key={team.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                <span className="text-base font-bold text-gray-300 w-6 flex-shrink-0">#{rank + 1}</span>
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: team.color + '18' }}><Icon size={13} style={{ color: team.color }} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{team.name}</span>
                    <span className="text-xs text-gray-400">{team.dept}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-xs">
                      <div className="h-1.5 rounded-full" style={{ width:`${team.health}%`, background: team.health >= 70 ? '#22C55E' : team.health >= 50 ? '#EAB308' : '#EF4444' }} />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap font-medium">{team.health}%</span>
                    {team.gaps > 0 && <span className="text-xs text-red-500">{team.gaps} gap{team.gaps !== 1 ? 's' : ''}</span>}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {team.delta > 0
                    ? <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><TrendingUp size={12}/>+{team.delta}%</span>
                    : team.delta < 0
                    ? <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500"><TrendingDown size={12}/>{team.delta}%</span>
                    : <span className="text-xs text-gray-300">-</span>
                  }
                </div>
                {onViewReport && (
                  <button onClick={() => onViewReport(team.id)}
                    className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 border border-blue-200 rounded-lg px-2.5 py-1.5 hover:bg-blue-50 transition-colors">
                    Report <ChevronRight size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Framework exposure by team */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Framework Exposure by Team</h3>
          <p className="text-xs text-gray-400 mt-0.5">Which frameworks are most at risk per team based on control gaps</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Team</th>
                {['SOC 2','ISO 27001','NIST CSF','EU AI Act','ISO 42001','GDPR'].map(f => (
                  <th key={f} className="text-center px-3 py-3 text-gray-400 font-medium">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teamStats.map(team => {
                const gaps = team.owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested');
                const hasGapIn = (keyword) => gaps.some(c => c.frameworks.some(f => f.includes(keyword)));
                return (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-700">{team.name}</td>
                    {[
                      ['SOC2','SOC 2'], ['ISO A.','ISO 27001'], ['NIST','NIST CSF'],
                      ['EU AI Act','EU AI Act'], ['42001','ISO 42001'], ['GDPR','GDPR']
                    ].map(([keyword, label]) => (
                      <td key={label} className="text-center px-3 py-3">
                        {hasGapIn(keyword)
                          ? <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 rounded-full text-xs">✕</span>
                          : <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full text-xs">✓</span>
                        }
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Leader Monthly Report ────────────────────────────────────────────────────

function LeaderReport({ teamId: initialTeamId, onBack }) {
  const { controls, vulns, incidents, policies, vendors } = useGRCData();
  const ctrlMap  = Object.fromEntries(controls.map(c => [c.id, c]));
  const [teamId, setTeamId] = useState(initialTeamId);
  const team = teams.find(t => t.id === teamId);

  // Team picker when no team is selected
  if (!team) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monthly Report</h2>
          <p className="text-sm text-gray-400 mt-1">Select a team to view their {new Date(new Date().setMonth(new Date().getMonth()-1)).toLocaleString('default', { month: 'long', year: 'numeric' })} report</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {teams.map(t => {
            const Icon  = t.icon;
            const owned = t.controls.map(id => ctrlMap[id]).filter(Boolean);
            const health = owned.length ? Math.round((owned.filter(c=>c.effectiveness==='effective').length + owned.filter(c=>c.effectiveness==='partial').length * 0.5) / owned.length * 100) : 0;
            const lvl   = getLevel(health);
            const hist  = monthlyHistory[t.id] ?? [];
            const prev  = hist[hist.length - 2]?.health ?? health;
            const delta = health - prev;
            return (
              <button key={t.id} onClick={() => { setTeamId(t.id); window.history.replaceState(null,'',`?leader=${t.id}`); }}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-left group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: t.color + '18' }}><Icon size={16} style={{ color: t.color }} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.dept} · {t.lead}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${health >= 70 ? 'text-emerald-600' : health >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{health}%</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${lvl.bg} ${lvl.text}`}>{lvl.icon} {lvl.name}</span>
                  </div>
                  {delta > 0
                    ? <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5"><TrendingUp size={11}/>+{delta}%</span>
                    : delta < 0
                    ? <span className="text-xs text-red-500 font-semibold flex items-center gap-0.5"><TrendingDown size={11}/>{delta}%</span>
                    : <span className="text-xs text-gray-300">-</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const owned     = team.controls.map(id => ctrlMap[id]).filter(Boolean);
  const effective = owned.filter(c => c.effectiveness === 'effective').length;
  const partial   = owned.filter(c => c.effectiveness === 'partial').length;
  const gaps      = owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').length;
  const health    = owned.length ? Math.round(((effective + partial * 0.5) / owned.length) * 100) : 0;
  const hist      = monthlyHistory[team.id] ?? [];
  const level     = getLevel(health);
  const badges    = computeBadges(team.id, { gaps, openInc: incidents.filter(i => owned.some(c => c.id === i.controlId) && i.status !== 'Resolved').length, owned }, hist);
  const prevHealth = hist[hist.length - 2]?.health ?? health;
  const delta      = health - prevHealth;

  const myVulns     = vulns.filter(v => owned.some(c => c.id === v.controlId) && v.status !== 'Patched');
  const myIncidents = incidents.filter(i => owned.some(c => c.id === i.controlId) && i.status !== 'Resolved');
  const myPolicies  = policies.filter(p => p.owner === team.lead);
  const myRisks     = risks.filter(r => r.owner === team.lead || owned.some(c => r.controlIds.includes(c.id)));

  const actions = [
    ...owned.filter(c => c.effectiveness === 'not_tested').map(c => ({ priority:'High',   action:`Test and document effectiveness of ${c.name}`,  due:'Jun 30, 2026' })),
    ...owned.filter(c => c.effectiveness === 'ineffective').map(c => ({ priority:'High',   action:`Remediate ineffective control: ${c.name}`,        due:'Jun 30, 2026' })),
    ...myPolicies.filter(p => p.status === 'Missing').map(p => ({ priority:'High',   action:`Create missing policy: ${p.title}`,              due:'Jun 15, 2026' })),
    ...myPolicies.filter(p => p.status === 'Overdue').map(p => ({ priority:'Medium', action:`Review overdue policy: ${p.title}`,             due:'Jun 20, 2026' })),
    ...myRisks.filter(r => r.status === 'Open' && r.inherentScore >= 15).map(r => ({ priority:'High', action:`Progress risk treatment: ${r.title}`, due: r.reviewDate || 'Jul 1, 2026' })),
  ].slice(0, 6);

  const shareUrl = () => {
    const url = `${window.location.href.split('?')[0]}?leader=${teamId}`;
    navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard'));
  };

  const Icon = team.icon;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronRight size={14} className="rotate-180" /> Back to Scorecard
        </button>
        <div className="flex items-center gap-2">
          <button onClick={shareUrl} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <Globe size={12} /> Copy Share Link
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 rounded-lg px-3 py-1.5 hover:bg-blue-700 transition-colors">
            <Download size={12} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Leader header card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: team.color + '20' }}>
              <Icon size={22} style={{ color: team.color }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{team.name}</h2>
              <p className="text-sm text-gray-500">{team.dept} · {team.lead}</p>
              <p className="text-xs text-gray-400 mt-0.5">Monthly Report · {new Date(new Date().setMonth(new Date().getMonth()-1)).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-bold ${health >= 70 ? 'text-emerald-600' : health >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{health}%</p>
            <span className={`text-sm font-bold px-2 py-1 rounded ${level.bg} ${level.text}`}>{level.icon} {level.name}</span>
            <p className="text-xs text-gray-400 mt-1">
              {delta > 0 ? <span className="text-emerald-600">▲ +{delta}% vs last month</span>
               : delta < 0 ? <span className="text-red-500">▼ {delta}% vs last month</span>
               : 'No change'}
            </p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400 self-center">May badges:</span>
            {badges.map(b => (
              <span key={b.label} className="flex items-center gap-1.5 text-sm bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 font-medium">
                {b.icon} {b.label} <span className="text-xs text-gray-400 font-normal">· {b.desc}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3-month trend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Health Score Trend · Q2 2026</h3>
        <div className="flex items-end gap-6">
          {hist.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className={`text-lg font-bold ${h.health >= 70 ? 'text-emerald-600' : h.health >= 50 ? 'text-amber-500' : 'text-red-500'}`}>{h.health}%</span>
              <div className="w-full rounded-t-lg" style={{ height: `${(h.health / 100) * 80}px`, background: h.health >= 70 ? '#22C55E' : h.health >= 50 ? '#F59E0B' : '#EF4444', opacity: i === hist.length - 1 ? 1 : 0.5 }} />
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700">{h.month}</p>
                <p className="text-xs text-gray-400">{h.gaps} gaps · {h.vulns + h.incidents} issues</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800">
            <strong>Level goal:</strong> Reach {level.next}% to advance from {level.name} to {LEVELS[Math.min(LEVELS.indexOf(level)+1,LEVELS.length-1)].name}.
            Need {Math.max(0, level.next - health)}% improvement · address {Math.ceil((level.next - health) * owned.length / 100)} control{Math.ceil((level.next - health) * owned.length / 100) !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Your Controls ({owned.length})</h3>
          <div className="flex gap-2 text-xs">
            <span className="text-emerald-600 font-semibold">{effective} effective</span>
            <span className="text-gray-300">·</span>
            <span className="text-amber-500 font-semibold">{partial} partial</span>
            <span className="text-gray-300">·</span>
            <span className="text-red-500 font-semibold">{gaps} gaps</span>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {owned.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                {c.ai && <Cpu size={13} className="text-purple-400 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-400">{c.id}</span>
                    <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.frameworks.slice(0,3).join(' · ')}</p>
                </div>
              </div>
              <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Open issues */}
      {(myVulns.length > 0 || myIncidents.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {myVulns.length > 0 && (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Bug size={14} className="text-red-500" /> Open Vulnerabilities ({myVulns.length})</h3>
              <div className="space-y-2">
                {[...myVulns].sort((a,b) => ['P0','P1','P2','P3','P4'].indexOf(a.priority??'P4') - ['P0','P1','P2','P3','P4'].indexOf(b.priority??'P4')).map(v => (
                  <div key={v.id} className={`flex items-center gap-3 p-2 rounded-lg ${v.priority==='P0'?'bg-red-50 border border-red-100':v.priority==='P1'?'bg-orange-50 border border-orange-100':'border border-gray-50'}`}>
                    <PriorityBadge priority={v.priority} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-blue-600">{v.cve}</p>
                      <p className="text-xs text-gray-700 truncate">{v.title}</p>
                    </div>
                    <SLACountdown dueDate={v.dueDate} status={v.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {myIncidents.length > 0 && (
            <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Flame size={14} className="text-orange-500" /> Active Incidents ({myIncidents.length})</h3>
              <div className="space-y-2">
                {myIncidents.map(i => (
                  <div key={i.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><p className="text-xs text-gray-700 truncate">{i.title}</p><p className="text-xs text-gray-400">{i.type}</p></div>
                    <StatusBadge status={i.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Policies */}
      {myPolicies.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><BookOpen size={14} className="text-purple-500" /> Policies You Own ({myPolicies.length})</h3>
          <div className="space-y-2">
            {myPolicies.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="text-sm text-gray-800">{p.title}</p><p className="text-xs text-gray-400">{p.category} · v{p.version || 'draft'}</p></div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {myRisks.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Risk Register · Your Items ({myRisks.length})</h3>
          <div className="space-y-2">
            {myRisks.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: r.inherentScore >= 20 ? '#EF4444' : r.inherentScore >= 12 ? '#F97316' : '#EAB308' }}>{r.inherentScore}</span>
                    <span className="text-xs font-medium text-gray-800 truncate">{r.title}</span>
                  </div>
                  <p className="text-xs text-gray-400">{r.category} · residual: {r.residualScore}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions for next month */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Play size={14} className="text-blue-600" /> Recommended Actions · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        {actions.length === 0
          ? <p className="text-sm text-emerald-600">No critical actions · maintain current momentum and target Platinum level.</p>
          : (
            <div className="space-y-2">
              {actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${a.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{a.priority}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">{a.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due: {a.due}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function ControlAlignment() {
  const { controls } = useGRCData();
  const openDetail = useRiskDetail();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [activeFramework, setActiveFramework] = useState('ALL');
  const [activeNistFn, setActiveNistFn] = useState('GOVERN');
  const [activeTab, setActiveTab]     = useState('controls');
  const [search, setSearch]           = useState('');
  const [selectedCtrl, setSelectedCtrl] = useState(null);

  const fw = frameworkDefs.find(f => f.id === activeFramework);

  // Filter controls to selected framework
  const filteredControls = controls.filter(c => {
    const matchesFw = activeFramework === 'ALL' || (fw?.match && c.frameworks.some(fw.match));
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    return matchesFw && matchesSearch;
  });

  // Framework coverage stats
  const fwStats = frameworkDefs.filter(f => f.id !== 'ALL').map(f => {
    const matched = controls.filter(c => f.match && c.frameworks.some(f.match));
    const effective = matched.filter(c => c.effectiveness === 'effective').length;
    const total = matched.length;
    const score = total ? Math.round((effective / total) * 100) : 0;
    return { ...f, total, effective, score };
  });

  // Per-control: which frameworks does it satisfy?
  const getAlignedFrameworks = (ctrl) =>
    frameworkDefs.filter(f => f.id !== 'ALL' && f.match && ctrl.frameworks.some(f.match));

  // Overall effectiveness counts
  const effCounts = controls.reduce((a, c) => { a[c.effectiveness] = (a[c.effectiveness]||0)+1; return a; }, {});

  const nistFn = nistAIFunctions.find(f => f.id === activeNistFn);

  const exportOSCAL = () => {
    const ssp = {
      "system-security-plan": {
        uuid: crypto.randomUUID(),
        metadata: { title: "chris-grc-engineering SSP", version: "1.0", "last-modified": new Date().toISOString() },
        "system-characteristics": {
          "system-name": brand.name,
          description: "GRC dashboard and control management system.",
          "security-sensitivity-level": "moderate",
        },
        "control-implementation": {
          description: "UCF control library mapped to NIST SP 800-53 and multiple frameworks.",
          "implemented-requirements": controls.map(c => ({
            uuid: crypto.randomUUID(),
            "control-id": c.id,
            description: c.name,
            props: [
              { name: "effectiveness", value: c.effectiveness },
              { name: "score", value: String(c.score) },
              { name: "owner", value: c.owner },
              { name: "last-tested", value: c.lastTested || "not-tested" },
              { name: "frameworks", value: c.frameworks.join(", ") },
            ],
          })),
        },
      },
    };
    const blob = new Blob([JSON.stringify(ssp, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `oscal-ssp-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const untestedControls = controls.filter(c => c.effectiveness === 'not_tested').length;
  const untestedAI = controls.filter(c => c.ai && c.effectiveness === 'not_tested').length;
  const ctrlAsk = untestedAI > 0
    ? `${untestedAI} AI control${untestedAI>1?'s':''} untested. Auditors will treat untested controls as automatic findings in SOC 2 and EU AI Act assessments. Schedule effectiveness tests before the next audit window.`
    : untestedControls > 0
      ? `${untestedControls} control${untestedControls>1?'s':''} not yet tested. Assign owners and schedule test dates to close evidence gaps before the next audit cycle.`
      : 'All controls tested. Maintain cadence — export OSCAL SSP for audit evidence packages.';

  return (
    <div className="space-y-5">
      <SectionContext
        what="UCF control effectiveness scores mapped across every active framework. Shows which controls are tested and effective, which are partial, and which are gaps — with OSCAL export for audit submissions."
        why="Controls are the mechanism that turns policy into evidence. Untested controls fail audits automatically. Gaps in AI controls create direct EU AI Act Art. 9 and ISO 42001 findings."
        ask={ctrlAsk}
        askUrgency={untestedAI > 0 ? 'high' : untestedControls > 0 ? 'high' : 'normal'}
      />

      {/* Top summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm col-span-2">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">UCF Control Effectiveness</p>
          <div className="flex gap-3 mb-2">
            {Object.entries(effConfig).map(([k, cfg]) => (
              <div key={k} className={`flex-1 p-2 rounded-lg border text-center ${cfg.bg} ${cfg.border}`}>
                <p className={`text-xl font-bold ${cfg.text}`}>{effCounts[k]||0}</p>
                <p className={`text-xs ${cfg.text}`}>{cfg.label}</p>
              </div>
            ))}
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {Object.entries(effConfig).map(([k, cfg]) => (
              <div key={k} className="h-2 rounded-full" style={{ width:`${((effCounts[k]||0)/controls.length)*100}%`, background:cfg.bar }} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{controls.length} UCF controls · 1 control satisfies multiple frameworks</p>
        </div>
        <KPICard title="Frameworks Mapped" value={frameworkDefs.length - 1} icon={Shield} color="#2563EB" subtitle="in UCF alignment" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">OSCAL Export</p>
            <p className="text-xs text-gray-500">Download controls as NIST OSCAL SSP JSON for audit submissions</p>
          </div>
          <button onClick={exportOSCAL}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors w-fit">
            <Download size={12} /> Export OSCAL
          </button>
        </div>
      </div>

      {/* Framework selector cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {frameworkDefs.map(f => {
          const stat = fwStats.find(s => s.id === f.id);
          const isActive = activeFramework === f.id;
          return (
            <button key={f.id} onClick={() => { setActiveFramework(f.id); setSearch(''); }}
              className={`rounded-xl p-3 text-left transition-all ${isActive?'bg-white border-2 shadow-md scale-[1.03]':'bg-gray-50 border border-gray-200 hover:bg-white hover:shadow-md'}`}
              style={isActive ? { borderColor: f.color } : {}}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{f.icon}</span>
                {stat && <span className="text-xs font-bold" style={{color:f.color}}>{stat.score}%</span>}
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{f.shortLabel}</p>
              {stat && (
                <div className="mt-1.5">
                  <div className="w-full bg-gray-100 rounded-full h-1"><div className="h-1 rounded-full" style={{width:`${stat.score}%`,background:f.color}} /></div>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.total} controls</p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Framework description banner */}
      {fw && fw.id !== 'ALL' && (
        <div className="rounded-xl border p-4 flex items-start gap-3" style={{background:fw.color+'08', borderColor:fw.color+'30'}}>
          <span className="text-2xl flex-shrink-0">{fw.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{fw.label}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeColors[fw.type]||typeColors.meta}`}>{fw.type}</span>
            </div>
            <p className="text-sm text-gray-600">{fw.description}</p>
          </div>
        </div>
      )}

      {/* ── NIST AI RMF: show 4-function view ── */}
      {activeFramework === 'NIST_AI_RMF' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {nistAIFunctions.map(f => {
              const covered = f.subcategories.filter(s => { const c=ctrlMap[s.ucfId]; return c&&c.effectiveness!=='not_tested'; }).length;
              const pct = Math.round((covered/f.subcategories.length)*100);
              const isAct = activeNistFn === f.id;
              return (
                <button key={f.id} onClick={() => setActiveNistFn(f.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${isAct?'shadow-lg scale-[1.02]':'hover:shadow-md bg-white'}`}
                  style={{borderColor:isAct?f.color:'#E5E7EB',background:isAct?f.bgColor:'white'}}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-widest" style={{color:f.color}}>{f.label}</span>
                    <span className="text-sm font-bold text-gray-800">{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2"><div className="h-1.5 rounded-full" style={{width:`${pct}%`,background:f.color}} /></div>
                  <p className="text-xs text-gray-500 leading-snug">{f.description.slice(0,60)}…</p>
                  <p className="text-xs text-gray-400 mt-1">{f.subcategories.length} subcategories</p>
                </button>
              );
            })}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex border-b border-gray-100">
              {[['controls','Controls & Coverage'],['crosswalk','CSF → AI RMF Crosswalk']].map(([id,label]) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`px-5 py-3.5 text-sm font-medium transition-colors ${activeTab===id?'border-b-2 bg-opacity-40':'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                  style={activeTab===id?{borderBottomColor:nistFn.color,color:nistFn.color}:{}}>
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center px-5 gap-2">
                <span className="text-xs text-gray-400 font-medium">{nistFn.label} function</span>
                <span className="text-xs font-bold" style={{color:nistFn.color}}>{Math.round((nistFn.subcategories.filter(s=>{const c=ctrlMap[s.ucfId];return c&&c.effectiveness!=='not_tested';}).length/nistFn.subcategories.length)*100)}% covered</span>
              </div>
            </div>
            {activeTab === 'controls' && (
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-left">{['AI RMF Ref','Subcategory','Linked UCF Control','Frameworks','Effectiveness'].map(h=><th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {nistFn.subcategories.map(s => {
                    const ctrl = ctrlMap[s.ucfId];
                    return (
                      <tr key={s.ref} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5"><span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{background:nistFn.bgColor,color:nistFn.color}}>{s.ref}</span></td>
                        <td className="px-4 py-3.5 text-sm text-gray-700 max-w-xs">{s.title}</td>
                        <td className="px-4 py-3.5">{ctrl?<div><span className="font-mono text-xs text-gray-400">{ctrl.id}</span><p className="text-xs text-gray-600 mt-0.5 max-w-[180px] truncate">{ctrl.name}</p></div>:<span className="text-xs text-red-400 font-medium">No control mapped</span>}</td>
                        <td className="px-4 py-3.5">{ctrl&&<div className="flex flex-wrap gap-1">{ctrl.frameworks.slice(0,2).map(f=><span key={f} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{f}</span>)}</div>}</td>
                        <td className="px-4 py-3.5">{ctrl?<EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score}/>:<span className="text-xs text-red-400">Unmapped</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {activeTab === 'crosswalk' && (
              <div>
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100"><p className="text-xs text-gray-500">Existing NIST CSF controls that already satisfy {nistFn.label} subcategories · no duplicate effort needed.</p></div>
                {nistFn.csfCrosswalks.length===0?<p className="px-5 py-8 text-center text-sm text-gray-400">No CSF crosswalk for this function</p>:(
                  <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50 text-left">{['CSF Reference','Control Name','UCF ID','AI RMF Satisfied','Effectiveness'].map(h=><th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {nistFn.csfCrosswalks.map(cw=>{const ctrl=ctrlMap[cw.ucfId];return(
                        <tr key={cw.csfRef} className="hover:bg-gray-50">
                          <td className="px-4 py-3.5"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{cw.csfRef}</span></td>
                          <td className="px-4 py-3.5 text-sm text-gray-700">{cw.csfName}</td>
                          <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-400">{cw.ucfId}</span></td>
                          <td className="px-4 py-3.5"><span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{background:nistFn.bgColor,color:nistFn.color}}>{cw.satisfies}</span></td>
                          <td className="px-4 py-3.5">{ctrl&&<EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score}/>}</td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                )}
                <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 rounded-b-xl">
                  <p className="text-xs text-amber-700"><strong>Note:</strong> CSF crosswalk shows where existing controls reduce your AI RMF gap but does not replace AI-specific controls. {nistFn.subcategories.length-nistFn.csfCrosswalks.length} subcategories in {nistFn.label} require new AI controls.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ── All other frameworks: alignment matrix ── */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">{fw?.id === 'ALL' ? 'All UCF Controls · Framework Alignment Matrix' : `${fw?.label} Controls`}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{filteredControls.length} controls · coloured dots show which other frameworks each control also satisfies</p>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search controls…"
                className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 w-48" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">UCF ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Control</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Effectiveness</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Framework Alignment</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Tested</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Risks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredControls.map(ctrl => {
                  const aligned = getAlignedFrameworks(ctrl);
                  return (
                    <tr key={ctrl.id} onClick={() => setSelectedCtrl(selectedCtrl?.id===ctrl.id?null:ctrl)}
                      className={`cursor-pointer transition-colors ${selectedCtrl?.id===ctrl.id?'bg-blue-50':'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-gray-600">{ctrl.id}</span>
                          {ctrl.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">AI</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-medium text-gray-800">{ctrl.name}</p>
                        <p className="text-xs text-gray-400">{ctrl.category}</p>
                      </td>
                      <td className="px-4 py-3.5"><EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {aligned.map(f => (
                            <span key={f.id} title={f.label}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{background:f.color+'15',color:f.color,border:`1px solid ${f.color}30`}}>
                              {f.shortLabel}
                            </span>
                          ))}
                          {aligned.length === 0 && <span className="text-xs text-gray-300">-</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{ctrl.owner}</td>
                      <td className="px-4 py-3.5"><span className={`text-xs ${!ctrl.lastTested?'text-red-500 font-semibold':'text-gray-400'}`}>{ctrl.lastTested||'Never'}</span></td>
                      <td className="px-4 py-3.5">
                        {(() => {
                          const linked = risks.filter(r => r.controlIds.includes(ctrl.id));
                          return linked.length > 0
                            ? <div className="flex gap-1 flex-wrap">{linked.map(r => <span key={r.id} onClick={e => { e.stopPropagation(); openDetail(r); }} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-75 transition-opacity ${r.residualScore >= 12 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{r.id}</span>)}</div>
                            : <span className="text-xs text-gray-300">—</span>;
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Control detail drawer */}
          {selectedCtrl && (
            <div className="border-t border-gray-100 p-5 bg-slate-50">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-gray-600">{selectedCtrl.id}</span>
                    {selectedCtrl.ai && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-semibold">AI Control</span>}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedCtrl.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedCtrl.category} · Owner: {selectedCtrl.owner} · Last tested: {selectedCtrl.lastTested || 'Never'}</p>
                </div>
                <EffectivenessBadge effectiveness={selectedCtrl.effectiveness} score={selectedCtrl.score} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Satisfies requirements in:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCtrl.frameworks.map(ref => {
                    const matchedFw = frameworkDefs.find(f => f.id !== 'ALL' && f.match && f.match(ref));
                    return (
                      <div key={ref} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                        style={matchedFw?{background:matchedFw.color+'10',borderColor:matchedFw.color+'30'}:{background:'#F8FAFC',borderColor:'#E2E8F0'}}>
                        {matchedFw && <span className="text-sm">{matchedFw.icon}</span>}
                        <span className="text-xs font-semibold text-gray-700">{ref}</span>
                        {matchedFw && <span className="text-xs font-medium" style={{color:matchedFw.color}}>{matchedFw.shortLabel}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {(() => {
                const linked = risks.filter(r => r.controlIds.includes(selectedCtrl.id));
                if (!linked.length) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active risk dependencies ({linked.length})</p>
                    <div className="space-y-2">
                      {linked.map(r => {
                        const eff = r.controlEffectiveness?.find(ce => ce.control.startsWith(selectedCtrl.id));
                        return (
                          <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg border bg-white">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-mono text-[10px] text-gray-400">{r.id}</span>
                                {r.ai && <span className="px-1 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-semibold">AI</span>}
                              </div>
                              <p className="text-xs font-medium text-gray-700 truncate">{r.title}</p>
                              {eff && <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{eff.note}</p>}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="text-[10px] text-gray-400">Residual</p>
                              <p className={`text-sm font-bold ${r.residualScore >= 12 ? 'text-red-600' : 'text-amber-500'}`}>{r.residualScore}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NIST AI RMF Data ────────────────────────────────────────────────────────

const nistAIFunctions = [
  {
    id: 'GOVERN', label: 'GOVERN', color: '#7C3AED', bgColor: '#7C3AED15',
    description: 'Policies, accountability structures, and risk culture for AI systems',
    subcategories: [
      { ref: 'GOVERN 1.1', title: 'AI risk policies established',         ucfId: 'UCF.AI.01' },
      { ref: 'GOVERN 1.2', title: 'Accountability structures for AI risk', ucfId: 'UCF.AI.01' },
      { ref: 'GOVERN 1.4', title: 'AI vendor risk management',            ucfId: 'UCF.AI.04' },
      { ref: 'GOVERN 1.5', title: 'AI risk culture & training',           ucfId: 'UCF.07.02' },
      { ref: 'GOVERN 1.6', title: 'AI governance documentation',          ucfId: 'UCF.AI.01' },
      { ref: 'GOVERN 1.7', title: 'AI incident disclosure policies',      ucfId: 'UCF.AI.05' },
    ],
    csfCrosswalks: [
      { csfRef: 'CSF ID.GV-1', csfName: 'Policy Review Process',        ucfId: 'UCF.07.01', satisfies: 'GOVERN 1.1' },
      { csfRef: 'CSF ID.GV-3', csfName: 'Security Awareness Training',  ucfId: 'UCF.07.02', satisfies: 'GOVERN 1.5' },
      { csfRef: 'CSF ID.SC-2', csfName: 'Third Party Risk Assessment',  ucfId: 'UCF.06.01', satisfies: 'GOVERN 1.4' },
    ],
  },
  {
    id: 'MAP', label: 'MAP', color: '#0891B2', bgColor: '#0891B215',
    description: 'Categorize AI use cases, understand risk context, and map stakeholder impacts',
    subcategories: [
      { ref: 'MAP 2.1', title: 'AI use cases & risk categorization',    ucfId: 'UCF.AI.06' },
      { ref: 'MAP 2.2', title: 'AI bias & fairness assessment',         ucfId: 'UCF.AI.02' },
      { ref: 'MAP 2.3', title: 'AI stakeholder impact mapping',         ucfId: 'UCF.AI.06' },
      { ref: 'MAP 2.4', title: 'AI data provenance & lineage',          ucfId: 'UCF.AI.09' },
      { ref: 'MAP 2.5', title: 'AI security threat modeling',           ucfId: 'UCF.AI.03' },
      { ref: 'MAP 2.6', title: 'AI third-party risk mapping',           ucfId: 'UCF.AI.04' },
    ],
    csfCrosswalks: [
      { csfRef: 'CSF ID.AM-1', csfName: 'Vulnerability Scanning',       ucfId: 'UCF.03.01', satisfies: 'MAP 2.5' },
      { csfRef: 'CSF ID.RA-1', csfName: 'Vulnerability Scanning',       ucfId: 'UCF.03.01', satisfies: 'MAP 2.2' },
      { csfRef: 'CSF PR.DS-3', csfName: 'Data Encryption at Rest',      ucfId: 'UCF.02.01', satisfies: 'MAP 2.4' },
    ],
  },
  {
    id: 'MEASURE', label: 'MEASURE', color: '#059669', bgColor: '#05966915',
    description: 'Analyze and assess AI risk quantitatively and qualitatively',
    subcategories: [
      { ref: 'MEASURE 3.1', title: 'AI risk metrics & KPIs defined',    ucfId: 'UCF.AI.01' },
      { ref: 'MEASURE 3.2', title: 'AI model performance monitoring',   ucfId: 'UCF.AI.07' },
      { ref: 'MEASURE 3.3', title: 'AI bias measurement & testing',     ucfId: 'UCF.AI.02' },
      { ref: 'MEASURE 3.4', title: 'AI explainability assessment',      ucfId: 'UCF.AI.08' },
      { ref: 'MEASURE 3.5', title: 'AI security testing (adversarial)', ucfId: 'UCF.AI.03' },
    ],
    csfCrosswalks: [
      { csfRef: 'CSF DE.CM-1', csfName: 'Log Monitoring & SIEM',        ucfId: 'UCF.08.01', satisfies: 'MEASURE 3.2' },
      { csfRef: 'CSF DE.CM-8', csfName: 'Vulnerability Scanning',       ucfId: 'UCF.03.01', satisfies: 'MEASURE 3.5' },
    ],
  },
  {
    id: 'MANAGE', label: 'MANAGE', color: '#D97706', bgColor: '#D9770615',
    description: 'Prioritize, treat, and monitor AI risks through response and lifecycle management',
    subcategories: [
      { ref: 'MANAGE 4.1', title: 'AI risk treatment planning',         ucfId: 'UCF.AI.01' },
      { ref: 'MANAGE 4.2', title: 'AI incident response & recovery',    ucfId: 'UCF.AI.05' },
      { ref: 'MANAGE 4.3', title: 'AI model lifecycle management',      ucfId: 'UCF.AI.10' },
      { ref: 'MANAGE 4.4', title: 'AI supply chain management',         ucfId: 'UCF.AI.04' },
    ],
    csfCrosswalks: [
      { csfRef: 'CSF RS.RP-1', csfName: 'Incident Response Plan',       ucfId: 'UCF.04.01', satisfies: 'MANAGE 4.2' },
      { csfRef: 'CSF RC.RP-1', csfName: 'Business Continuity Plan',     ucfId: 'UCF.09.01', satisfies: 'MANAGE 4.1' },
      { csfRef: 'CSF ID.SC-4', csfName: 'Vendor Questionnaire Process', ucfId: 'UCF.06.02', satisfies: 'MANAGE 4.4' },
    ],
  },
];

// eslint-disable-next-line no-unused-vars
function _AIGovernanceLegacy() {
  const { controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [activeFunction, setActiveFunction] = useState('GOVERN');
  const [activeTab, setActiveTab] = useState('controls'); // 'controls' | 'crosswalk'

  const aiControls = controls.filter(c => c.ai);
  const fn = nistAIFunctions.find(f => f.id === activeFunction);

  // Coverage: subcategory has a control that is not not_tested
  const coveredCount = fn.subcategories.filter(s => {
    const ctrl = ctrlMap[s.ucfId];
    return ctrl && ctrl.effectiveness !== 'not_tested';
  }).length;
  const coveragePct = Math.round((coveredCount / fn.subcategories.length) * 100);

  // Overall AI RMF coverage across all functions
  const allSubs = nistAIFunctions.flatMap(f => f.subcategories);
  const totalCovered = allSubs.filter(s => {
    const ctrl = ctrlMap[s.ucfId];
    return ctrl && ctrl.effectiveness !== 'not_tested';
  }).length;
  const overallPct = Math.round((totalCovered / allSubs.length) * 100);

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">NIST AI RMF Overall Coverage</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{overallPct}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{totalCovered} / {allSubs.length} subcategories</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Separate from NIST CSF</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">NIST CSF covers cybersecurity · AI RMF covers AI-specific risk governance</p>
        </div>
        <KPICard title="AI Controls" value={aiControls.length} icon={Cpu} color="#7C3AED"
          subtitle={`${aiControls.filter(c=>c.effectiveness==='not_tested').length} not yet tested`} />
        <KPICard title="Critical Gaps" value={aiControls.filter(c=>c.effectiveness==='ineffective'||c.effectiveness==='not_tested').length}
          icon={AlertTriangle} color="#EF4444" subtitle="ineffective or untested" />
      </div>

      {/* CSF vs AI RMF explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0"><Shield size={16} className="text-blue-600" /></div>
          <div>
            <p className="text-sm font-semibold text-gray-900">How NIST CSF and NIST AI RMF relate</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              <strong>NIST CSF</strong> (Identify, Protect, Detect, Respond, Recover) governs <em>how you secure systems</em>.
              <strong> NIST AI RMF</strong> (Govern, Map, Measure, Manage) governs <em>how you manage AI-specific risk</em> · bias, explainability, model drift, data provenance, AI supply chain.
              They are complementary: your existing CSF controls satisfy some AI RMF subcategories (shown in the crosswalk below), but AI RMF requires additional controls that CSF does not cover.
            </p>
          </div>
        </div>
      </div>

      {/* 4 function selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {nistAIFunctions.map(f => {
          const fnControls = f.subcategories.map(s => ctrlMap[s.ucfId]).filter(Boolean);
          const fnCovered = fnControls.filter(c => c.effectiveness !== 'not_tested').length;
          const fnPct = Math.round((fnCovered / f.subcategories.length) * 100);
          const isActive = activeFunction === f.id;
          return (
            <button key={f.id} onClick={() => setActiveFunction(f.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${isActive ? 'shadow-lg scale-[1.02]' : 'hover:shadow-md bg-white'}`}
              style={{ borderColor: isActive ? f.color : '#E5E7EB', background: isActive ? f.bgColor : 'white' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-widest" style={{ color: f.color }}>{f.label}</span>
                <span className="text-sm font-bold text-gray-800">{fnPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full" style={{ width: `${fnPct}%`, background: f.color }} />
              </div>
              <p className="text-xs text-gray-500 leading-snug">{f.description.slice(0, 60)}…</p>
              <p className="text-xs text-gray-400 mt-1">{f.subcategories.length} subcategories</p>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[['controls','Controls & Coverage'],['crosswalk','CSF → AI RMF Crosswalk']].map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors ${activeTab===id
                ?'border-b-2 bg-opacity-40' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              style={activeTab===id?{borderBottomColor:fn.color,color:fn.color}:{}}>
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center px-5 gap-2">
            <span className="text-xs text-gray-400 font-medium">{fn.label} function</span>
            <span className="text-xs font-bold" style={{color:fn.color}}>{coveragePct}% covered</span>
          </div>
        </div>

        {activeTab === 'controls' && (
          <div>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">{fn.description}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['AI RMF Ref','Subcategory','Linked UCF Control','Frameworks','Effectiveness'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fn.subcategories.map(s => {
                  const ctrl = ctrlMap[s.ucfId];
                  return (
                    <tr key={s.ref} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{background:fn.bgColor,color:fn.color}}>{s.ref}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700 max-w-xs">{s.title}</td>
                      <td className="px-4 py-3.5">
                        {ctrl ? (
                          <div>
                            <span className="font-mono text-xs text-gray-400">{ctrl.id}</span>
                            <p className="text-xs text-gray-600 mt-0.5 max-w-[180px] truncate">{ctrl.name}</p>
                          </div>
                        ) : <span className="text-xs text-red-400 font-medium">No control mapped</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {ctrl && <div className="flex flex-wrap gap-1">{ctrl.frameworks.slice(0,2).map(f => (
                          <span key={f} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{f}</span>
                        ))}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        {ctrl
                          ? <EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score} />
                          : <span className="text-xs text-red-400">Unmapped</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'crosswalk' && (
          <div>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-xs text-gray-500">
                Existing NIST CSF controls that already satisfy {fn.label} subcategories · no duplicate effort needed for these.
              </p>
            </div>
            {fn.csfCrosswalks.length === 0
              ? <p className="px-5 py-8 text-center text-sm text-gray-400">No CSF crosswalk for this function</p>
              : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      {['CSF Reference','CSF Control Name','UCF ID','AI RMF Satisfied','Effectiveness'].map(h => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {fn.csfCrosswalks.map(cw => {
                      const ctrl = ctrlMap[cw.ucfId];
                      return (
                        <tr key={cw.csfRef} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3.5"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{cw.csfRef}</span></td>
                          <td className="px-4 py-3.5 text-sm text-gray-700">{cw.csfName}</td>
                          <td className="px-4 py-3.5"><span className="font-mono text-xs text-gray-400">{cw.ucfId}</span></td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{background:fn.bgColor,color:fn.color}}>{cw.satisfies}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            {ctrl ? <EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score} /> : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            }
            <div className="px-5 py-4 bg-amber-50 border-t border-amber-100 rounded-b-xl">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> CSF crosswalk shows which existing controls reduce your AI RMF gap, but does not replace AI-specific controls.
                {fn.subcategories.length - fn.csfCrosswalks.length} subcategories in {fn.label} have no CSF equivalent and require new AI controls.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Risk Detail Drawer ───────────────────────────────────────────────────────
function RiskDetailDrawer({ risk: r, onClose }) {
  const reductionPct = r.inherentScore > 0 ? Math.round(((r.inherentScore - r.residualScore) / r.inherentScore) * 100) : 0;
  const headerBg = getRiskColor(r.inherentScore) + '08';
  const headerBorder = getRiskColor(r.inherentScore) + '25';
  return (
    <div className="fixed right-0 top-0 h-full w-[480px] max-w-[95vw] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0" style={{ background: headerBg, borderBottomColor: headerBorder }}>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs text-gray-500 bg-white/80 px-2 py-0.5 rounded border border-gray-200">{r.id}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: getRiskColor(r.residualScore)+'20', color: getRiskColor(r.residualScore) }}>{getRiskRating(r.residualScore)} residual</span>
            {r.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-semibold">AI</span>}
            {r.signalSource && <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${r.signalSource==='vulnerability'?'bg-red-100 text-red-700':r.signalSource==='supply_chain'?'bg-orange-100 text-orange-700':'bg-purple-100 text-purple-700'}`}>{r.signalSource.replace('_',' ')}</span>}
          </div>
          <h2 className="text-base font-semibold text-gray-900 leading-snug">{r.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{r.owner} · {r.category} · Review: {r.reviewDate}</p>
        </div>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 flex-shrink-0 rounded-lg hover:bg-white/80 transition-colors"><X size={18} /></button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Score summary — 3 cells */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border text-center" style={{ borderColor: getRiskColor(r.inherentScore)+'40', background: getRiskColor(r.inherentScore)+'0C' }}>
            <p className="text-2xl font-bold" style={{ color: getRiskColor(r.inherentScore) }}>{r.inherentScore}</p>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">Inherent</p>
            <p className="text-[10px] text-gray-400">{r.likelihood}L × {r.impact}I</p>
          </div>
          <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-center">
            <p className="text-2xl font-bold text-emerald-700">{reductionPct}%</p>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">Reduced</p>
            <p className="text-[10px] text-gray-400">{r.controlIds.length} control{r.controlIds.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="p-3 rounded-xl border text-center" style={{ borderColor: getRiskColor(r.residualScore)+'40', background: getRiskColor(r.residualScore)+'0C' }}>
            <p className="text-2xl font-bold" style={{ color: getRiskColor(r.residualScore) }}>{r.residualScore}</p>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">Residual</p>
            <p className="text-[10px] text-gray-400">{getRiskRating(r.residualScore)} band</p>
          </div>
        </div>

        {/* Why it matters */}
        {r.whyItMatters && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Why it matters</p>
            <p className="text-sm text-blue-900 leading-relaxed">{r.whyItMatters}</p>
          </div>
        )}

        {/* Threat Analysis */}
        {(r.threatAgent || r.threatVector || r.vulnerability || r.assetAtRisk || r.existingExposure) && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Threat Analysis — ISO 27005</p>
            <div className="space-y-1.5">
              {[
                ['Threat Agent',      r.threatAgent],
                ['Attack Vector',     r.threatVector],
                ['Vulnerability',     r.vulnerability],
                ['Asset at Risk',     r.assetAtRisk],
                ['Existing Exposure', r.existingExposure],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treatment */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Treatment — {r.treatment}</p>
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-900 leading-relaxed">{r.treatmentPlan}</p>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">SLA: {r.slaDays} days</span>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Owner: {r.owner}</span>
            <StatusBadge status={r.status} />
          </div>
        </div>

        {/* Control effectiveness breakdown */}
        {r.controlEffectiveness?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Control Effectiveness Breakdown</p>
            <div className="space-y-2">
              {r.controlEffectiveness.map(ce => (
                <div key={ce.control} className="p-3 rounded-lg border border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">{ce.control}</span>
                    <span className={`text-xs font-bold ${ce.effectiveness >= 70 ? 'text-emerald-600' : ce.effectiveness >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{ce.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: ce.effectiveness + '%', background: ce.effectiveness >= 70 ? '#22C55E' : ce.effectiveness >= 40 ? '#EAB308' : '#EF4444' }} />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-snug">{ce.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Framework control gaps */}
        {r.controls?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Framework Control Gaps ({r.controls.length})</p>
            <div className="space-y-1.5">
              {r.controls.map(c => (
                <div key={c.framework} className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">{c.framework}</span>
                    <span className="text-[10px] text-red-600 font-medium">{c.requirement}</span>
                  </div>
                  <p className="text-[10px] text-red-800 leading-snug">{c.gap}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-100 flex gap-2 flex-shrink-0">
        <button className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Open Treatment Workflow</button>
        <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Close</button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

// ─── Control Chip with inline dropdown ───────────────────────────────────────
function ControlChip({ controlId }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const ctrl   = ctrlMap[controlId];

  const effMap = {
    effective:  { label: 'Effective',  cls: 'bg-green-50 text-green-700',  bar: '#22C55E' },
    partial:    { label: 'Partial',    cls: 'bg-amber-50 text-amber-700',  bar: '#EAB308' },
    ineffective:{ label: 'Ineffective',cls: 'bg-red-50 text-red-700',      bar: '#EF4444' },
    not_tested: { label: 'Not Tested', cls: 'bg-gray-100 text-gray-500',   bar: '#94A3B8' },
  };
  const eff = ctrl ? (effMap[ctrl.effectiveness] ?? effMap.not_tested) : null;

  const chipCls = !ctrl ? 'bg-gray-100 text-gray-400' :
    ctrl.score >= 70 ? 'bg-green-50 text-green-700 hover:bg-green-100' :
    ctrl.score >= 40 ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                       'bg-red-50   text-red-700   hover:bg-red-100';

  const toggle = useCallback((e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.max(8, r.left) });
    }
    setOpen(o => !o);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  if (!ctrl) return <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400" title={controlId}>{controlId}</span>;

  return (
    <>
      <button ref={btnRef} onClick={toggle} title={`${ctrl.name} · ${eff?.label ?? ''} · Click for details`}
        className={"font-mono text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0 transition-colors "+chipCls}>
        {controlId}
      </button>

      {open && (
        <div className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl w-72"
          style={{ top: pos.top, left: pos.left }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{ctrl.id}</span>
              {ctrl.ai && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">AI</span>}
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-snug">{ctrl.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{ctrl.category}</p>
          </div>

          {/* Effectiveness */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className={"text-xs font-semibold px-2 py-0.5 rounded "+eff.cls}>{eff.label}</span>
              <span className="text-sm font-bold tabular-nums" style={{color: eff.bar}}>{ctrl.score}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full" style={{width: ctrl.score+'%', background: eff.bar}} />
            </div>
          </div>

          {/* Meta */}
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between text-xs text-gray-500">
            <span>Owner: <span className="font-medium text-gray-700">{ctrl.owner}</span></span>
            <span>Tested: <span className="font-medium text-gray-700">{ctrl.lastTested ?? 'Never'}</span></span>
          </div>

          {/* Frameworks */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Frameworks</p>
            <div className="flex flex-wrap gap-1">
              {ctrl.frameworks.map(f => (
                <span key={f} className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{f}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Workflow Panel ───────────────────────────────────────────────────────────
function WorkflowPanel({ item, itemType, onClose }) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(item?.status || '');
  const [assignee, setAssignee] = useState(item?.owner || '');
  const owners = ['J. Martinez','A. Patel','T. Williams','K. Thompson','S. Chen'];
  if (!item) return null;
  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-100 z-50 flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{itemType} Actions</p>
          <p className="font-semibold text-gray-900 mt-0.5 text-sm truncate">{item.title||item.name||item.id}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Assign To</label>
          <select value={assignee} onChange={e=>setAssignee(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
            {owners.map(o=><option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
            {['Open','In Treatment','In Review','Accepted','Resolved','Closed'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Add Comment</label>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Add a note or update…" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none resize-none" />
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {[['Escalate','bg-red-50 text-red-600 hover:bg-red-100'],['Create Task','bg-blue-50 text-blue-600 hover:bg-blue-100'],['Mark Resolved','bg-green-50 text-green-600 hover:bg-green-100'],['Attach Evidence','bg-purple-50 text-purple-600 hover:bg-purple-100']].map(([label,cls])=>(
              <button key={label} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${cls}`}>{label}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-gray-100 flex gap-2">
        <button className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">Save Changes</button>
        <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ─── Risk Category colours ────────────────────────────────────────────────────
const RISK_CAT_COLOR = {
  'Access Control':  'bg-blue-50 text-blue-700',
  'AI Governance':   'bg-purple-50 text-purple-700',
  'AI Security':     'bg-violet-50 text-violet-700',
  'Vuln Mgmt':       'bg-orange-50 text-orange-700',
  'Data Protection': 'bg-cyan-50 text-cyan-700',
  'Third Party':     'bg-amber-50 text-amber-700',
  'BCM':             'bg-green-50 text-green-700',
};

// ─── Risk Register ────────────────────────────────────────────────────────────
function RiskRegister({ focusId }) {
  const openDetail = useRiskDetail();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [activeView, setActiveView] = useState('register');
  const [showRiskNarrative, setShowRiskNarrative] = useState(false);
  const focusRowRef = useRef(null);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 2 * 3600000));

  useEffect(() => {
    if (focusId) { setCatFilter('All'); setSearch(''); setShowAI(false); setActiveView('register'); }
  }, [focusId]);

  useEffect(() => {
    if (!focusId || !focusRowRef.current) return;
    requestAnimationFrame(() => focusRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }, [focusId]);

  const categories = ['All',...[...new Set(risks.map(r=>r.category))]];
  const filtered = risks.filter(r =>
    (catFilter==='All'||r.category===catFilter) &&
    (!showAI||r.ai) &&
    r.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a,b)=>b.inherentScore-a.inherentScore);

  const critical = risks.filter(r=>r.inherentScore>=20).length;
  const exceedsAppetite = risks.filter(r=>getAppetite(r.residualScore)!=='Within').length;
  const aiRisks = risks.filter(r=>r.ai).length;
  const open = risks.filter(r=>!['Done','Accepting/Monitoring','closed'].includes(r.status)).length;

  const HeatMatrix = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-1">Risk Heat Matrix</h3>
      <p className="text-xs text-gray-400 mb-4">Inherent risk: Likelihood x Impact · click a dot to open workflow</p>
      <div className="flex gap-3">
        <div className="flex flex-col pr-1" style={{height:220, width:32}}>
          <div className="flex flex-col justify-between h-full text-xs text-gray-400">
            {[5,4,3,2,1].map((n,idx)=>(
              <span key={n} className="leading-none flex items-center gap-1">
                <span>{n}</span>
                {n===5&&<span className="text-[9px] text-gray-300 font-medium">High</span>}
                {n===3&&<span className="text-[9px] text-gray-300 font-medium">Med</span>}
                {n===1&&<span className="text-[9px] text-gray-300 font-medium">Low</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          {[5,4,3,2,1].map(l=>(
            <div key={l} className="flex gap-1" style={{height:40}}>
              {[1,2,3,4,5].map(i=>{
                const score=l*i;
                const bg=score>=20?'#FCA5A5':score>=12?'#FEE2E2':score>=6?'#FFEDD5':score>=2?'#DCFCE7':'#F0FDF4';
                const cellRisks=risks.filter(r=>r.likelihood===l&&r.impact===i);
                return (
                  <div key={i} className="flex-1 rounded flex items-center justify-center flex-wrap gap-0.5 p-0.5" style={{background:bg}}>
                    {cellRisks.map(r=>(
                      <span key={r.id} title={r.id+': '+r.title}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:scale-125 transition-transform shadow-sm"
                        style={{background:getRiskColor(r.inherentScore),fontSize:'8px'}}
                        onClick={()=>setWorkflow(r)}>
                        {r.id.replace('RISK-2026-','').replace('RSK-','')}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map(n=><div key={n} className="flex-1 text-center text-xs text-gray-400 flex flex-col items-center gap-0.5"><span>{n}</span>{(n===1||n===3||n===5)&&<span className="text-[9px] text-gray-300">{n===1?'Low':n===3?'Med':'High'}</span>}</div>)}
          </div>
          <p className="text-xs text-center text-gray-400 mt-0.5">Impact →</p>
        </div>
      </div>
      <div className="flex gap-3 mt-3 flex-wrap">
        {[['Critical (20–25)','#FCA5A5'],['High (12–19)','#FEE2E2'],['Medium (6–11)','#FFEDD5'],['Low (2–5)','#DCFCE7']].map(([l,c])=>(
          <div key={l} className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{background:c}}/><span className="text-xs text-gray-500">{l}</span></div>
        ))}
      </div>
    </div>
  );

  const withinAppetite = risks.filter(r=>getAppetite(r.residualScore)==='Within').length;

  const riskAsk = exceedsAppetite > 0
    ? `${exceedsAppetite} risk${exceedsAppetite>1?'s':''} exceed appetite. Treatment plans need Engineering VP or CISO approval depending on severity band. Review open risks with no owner assigned first.`
    : open > 0
      ? `${open} risks in active treatment. Confirm each has an assigned owner and a next review date. AI risks require a tested control before the next audit.`
      : 'All risks within appetite or accepted. Maintain review cadence and refresh threat models on material changes.';

  return (
    <div className="space-y-4">
      {/* One-system explainer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
        <Database size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-700 mb-1">One system — all panels derive from these four records</p>
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
            {[['vulnerability','bg-red-50 text-red-600','Vulnerabilities panel'],['supply_chain','bg-orange-50 text-orange-600','Third Party / Supply Chain'],['ai_governance','bg-purple-50 text-purple-600','AI Governance panel']].map(([src,cls,label])=>(
              <span key={src} className="flex items-center gap-1">
                <span className={`px-1.5 py-0.5 rounded font-semibold ${cls}`}>{src.replace('_',' ')}</span>
                <span className="text-slate-400">→ {label}</span>
                <span className="text-slate-300 mx-1">·</span>
              </span>
            ))}
            <span className="text-slate-400 italic">Sample data — built from public threat intelligence</span>
          </div>
        </div>
      </div>

      <SectionContext
        what="All identified risks in formal treatment — each with a VSRM-style inherent and residual score, owner, treatment plan, and review date. Heat matrix shows likelihood × impact across the full portfolio."
        why="Untreated high-impact risks compound over time. The risk register is the source of truth for audit evidence, insurance underwriting, and budget justification for security investment."
        ask={riskAsk}
        askUrgency={exceedsAppetite > 0 ? 'high' : 'normal'}
      />
      {workflow && <WorkflowPanel item={workflow} itemType="Risk" onClose={()=>setWorkflow(null)} />}
      {/* KPI Row · 4 uniform cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Risks"         value={open}            icon={AlertTriangle} color="#EF4444" subtitle={critical+" critical"} />
        <KPICard title="Exceeds Appetite"   value={exceedsAppetite} icon={TrendingUp}    color="#F97316" subtitle="residual above threshold" />
        <KPICard title="AI-Related Risks"   value={aiRisks}         icon={Cpu}           color="#9333EA" subtitle="4 with no tested controls" />
        <KPICard title="Within Appetite"    value={withinAppetite}  icon={CheckCircle}   color="#22C55E" subtitle={"of "+risks.length+" total risks"} />
      </div>

      {/* Risk Register Next Action */}
      {(() => {
        const boardRisk = risks.find(r => r.residualScore > RISK_APPETITE.severe);
        const nextAction = boardRisk
          ? { action: `${boardRisk.id} requires board sign-off — residual score ${boardRisk.residualScore} significantly exceeds appetite`, owner: boardRisk.owner, deadline: RESPONSE_SLA[getRiskRating(boardRisk.residualScore)], urgency: 'high' }
          : risks.filter(r => r.status==='Open' && r.inherentScore >= 16).length > 0
          ? { action: `${risks.filter(r=>r.status==='Open'&&r.inherentScore>=16).length} risks exceed appetite — treatment plans required`, owner: 'A. Patel', deadline: 'This week', urgency: 'medium' }
          : { action: 'Risk register is within appetite thresholds', owner: 'S. Chen', deadline: 'Review Q3', urgency: 'low' };
        return <NextActionCard {...nextAction} />;
      })()}

      {/* View toggle + appetite legend on one line */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {[['register','Risk Register'],['matrix','Heat Matrix']].map(([id,label])=>(
            <button key={id} onClick={()=>setActiveView(id)}
              className={"px-4 py-2 rounded-lg text-sm font-medium transition-colors "+(activeView===id?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="text-gray-400 font-medium uppercase tracking-wider text-[10px]">Appetite</span>
          {[['Within','text-green-600','≤11'],['Approaches','text-amber-600','12–19'],['Exceeds','text-orange-600','20–24'],['Sig. Exceeds','text-red-600','25']].map(([l,c,r])=>(
            <span key={l}><span className={c+" font-semibold"}>{l}</span> <span className="text-gray-400">{r}</span></span>
          ))}
        </div>
      </div>

      {activeView==='matrix' ? <HeatMatrix /> : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <ModuleHeader title="Risk Register" subtitle={filtered.length+" risks"} search={search} setSearch={setSearch}
            syncedAt={lastSynced} onRefresh={() => setLastSynced(new Date())}
            filters={<>
              <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
              <button onClick={()=>setShowAI(a=>!a)} className={"px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 "+(showAI?'bg-purple-600 text-white border-purple-600':'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                <Cpu size={13}/> AI Only
              </button>
            </>}
            extra={
              <div className="flex items-center gap-2">
                <button onClick={() => downloadCSV(
                  `risk-register-${new Date().toISOString().slice(0,10)}.csv`,
                  ['ID','Title','Category','Inherent Score','Residual Score','Appetite','Status','Owner','Review Date','AI Risk'],
                  filtered.map(r => [r.id, r.title, r.category, r.inherentScore, r.residualScore, getAppetite(r.residualScore), r.status, r.owner, r.reviewDate||'', r.ai?'Yes':'No'])
                )} className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Download size={12} /> Export CSV
                </button>
                <button onClick={() => setShowRiskNarrative(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                  <Cpu size={12} />
                  Summarise for Board
                </button>
              </div>
            }
          />
          {showRiskNarrative && (() => {
            const top = [...risks].sort((a,b) => b.inherentScore - a.inherentScore).slice(0,3);
            const exceedingAppetite = risks.filter(r => getAppetite(r.residualScore) === 'Significantly Exceeds' || getAppetite(r.residualScore) === 'Exceeds').length;
            const aiRisksOpen = risks.filter(r => r.ai && r.status === 'Open').length;
            const riskNarrative = `The most critical unmitigated risk is "${top[0].title}" (inherent score ${top[0].inherentScore}, residual ${top[0].residualScore}) owned by ${top[0].owner}. Treatment plan: ${top[0].treatmentPlan}.\n\n${exceedingAppetite} risks currently exceed the board-approved risk appetite — these require VP+ or C-Suite sign-off before acceptance. ${aiRisksOpen} open AI-related risks have no tested controls, creating regulatory exposure under the EU AI Act.\n\nRecommended board action: approve the treatment plans for ${top[0].id} and ${risks.filter(r=>r.ai&&r.status==='Open')[0]?.id || top[1]?.id}, and authorise the DPA negotiation with OpenAI (RSK-004).`;
            return (
              <div className="mx-5 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Cpu size={13} className="text-purple-600" />
                    <span className="text-xs font-semibold text-purple-700">AI-Generated Board Narrative</span>
                  </div>
                  <button onClick={() => setShowRiskNarrative(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{riskNarrative}</p>
              </div>
            );
          })()}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                {['Risk','Category','Business Impact','Score (Inherent → Residual)','Appetite','Controls','Status','Owner',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r=>{
                  const appetite = getAppetite(r.residualScore);
                  const aptColor = appetite==='Within'?'bg-green-50 text-green-700':appetite==='Approaches'?'bg-amber-50 text-amber-700':appetite==='Exceeds'?'bg-orange-50 text-orange-700':'bg-red-50 text-red-700';
                  const avgEff = r.controlIds.length ? Math.round(r.controlIds.reduce((s,id)=>s+(CTRL_EFF[id]??50),0)/r.controlIds.length) : null;
                  const effBarColor = avgEff===null?'#94A3B8':avgEff>=70?'#22C55E':avgEff>=40?'#EAB308':'#EF4444';
                  const catClass = RISK_CAT_COLOR[r.category] ?? 'bg-slate-100 text-slate-600';
                  const bizImpact = getBusinessImpact(r.inherentScore);
                  const isFocused = focusId && r.id === focusId;
                  return (
                    <tr key={r.id}
                      ref={isFocused ? focusRowRef : null}
                      data-item-id={r.id}
                      className={`transition-colors ${isFocused ? 'bg-amber-50 outline outline-2 outline-amber-400 outline-offset-[-2px]' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                          {r.ai&&<span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded font-semibold">AI</span>}
                          {r.signalSource && (
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${r.signalSource==='vulnerability'?'bg-red-50 text-red-600':r.signalSource==='supply_chain'?'bg-orange-50 text-orange-600':r.signalSource==='ai_governance'?'bg-purple-50 text-purple-600':'bg-gray-50 text-gray-500'}`}>
                              {r.signalSource.replace('_',' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-snug">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.asset}</p>
                        {r.whyItMatters && <p className="text-[10px] text-blue-600 mt-0.5 italic leading-snug">{r.whyItMatters}</p>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={"text-xs font-medium px-2 py-0.5 rounded-full "+catClass}>{r.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${bizImpact.color}`}>{bizImpact.label}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5 max-w-[140px]">{bizImpact.hint}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:getRiskColor(r.inherentScore)}}/>
                          <span className="font-bold text-gray-700">{r.inherentScore}</span>
                          <span className="text-gray-300 mx-0.5" title="Inherent score → Residual score after controls applied">→</span>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:getRiskColor(r.residualScore)}}/>
                          <span className="font-bold text-lg text-gray-800">{r.residualScore}</span>
                        </div>
                        <p className="text-xs text-gray-400">from <span className="font-medium">{r.inherentScore}</span> inherent</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{getRiskRating(r.residualScore)} · {RESPONSE_SLA[getRiskRating(r.residualScore)]}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={"px-2 py-0.5 rounded-full text-xs font-semibold "+aptColor}>{appetite}</span>
                        {appetite === 'Significantly Exceeds' && (
                          <p className="text-[10px] text-red-600 font-semibold mt-0.5">Board sign-off required</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5" style={{minWidth:'160px',maxWidth:'200px'}}>
                        {r.controlIds.length > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex gap-1 flex-wrap">
                              {r.controlIds.map(id => <ControlChip key={id} controlId={id} />)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="h-1.5 rounded-full" style={{width:avgEff+'%',background:effBarColor}}/>
                              </div>
                              <span className="text-[10px] font-semibold tabular-nums" style={{color:effBarColor}}>{avgEff}%</span>
                            </div>
                          </div>
                        ) : <span className="text-xs text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={r.status}/></td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-600">{r.owner}</p>
                        <p className="text-[10px] text-gray-400">{ACCEPT_AUTH[getRiskRating(r.inherentScore)]}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openDetail(r)} className="px-3 py-1 text-xs font-medium bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap border border-slate-200">Detail</button>
                          <button onClick={()=>setWorkflow(r)} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">Actions</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audit Management ─────────────────────────────────────────────────────────
function AuditManagement() {
  const { controls } = useGRCData();
  const openDetail = useRiskDetail();
  const ctrlMap = Object.fromEntries(controls.map(c=>[c.id,c]));
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const findings = selectedAudit ? auditFindings.filter(f=>f.auditId===selectedAudit.id) : auditFindings;
  const openFindings = auditFindings.filter(f=>f.status!=='Resolved').length;
  const avgReadiness = Math.round(audits.reduce((s,a)=>s+a.readiness,0)/audits.length);
  const auditStatColor = { Scheduled:'bg-blue-50 text-blue-600', 'In Preparation':'bg-amber-50 text-amber-700', Planning:'bg-slate-50 text-slate-600', Completed:'bg-green-50 text-green-700' };

  return (
    <div className="space-y-4">
      {workflow && <WorkflowPanel item={workflow} itemType="Finding" onClose={()=>setWorkflow(null)} />}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Upcoming Audits"  value={audits.filter(a=>a.status!=='Completed').length} icon={FileText}     color="#2563EB" subtitle="next: SOC 2 Jul 15" />
        <KPICard title="Avg Readiness"    value={avgReadiness+"%"}                                 icon={CheckCircle}  color="#22C55E" subtitle="across all frameworks" />
        <KPICard title="Open Findings"    value={openFindings}                                      icon={AlertTriangle} color="#EF4444" subtitle="2 high severity" />
        <KPICard title="EU AI Act Ready"  value="22%"                                               icon={Cpu}          color="#DC2626" subtitle="urgent · enforcement 2026" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {audits.map(audit=>(
          <div key={audit.id} onClick={()=>setSelectedAudit(selectedAudit?.id===audit.id?null:audit)}
            className={"bg-white rounded-xl border-2 p-5 shadow-sm cursor-pointer hover:shadow-md transition-all "+(selectedAudit?.id===audit.id?'':'border-gray-100')}
            style={selectedAudit?.id===audit.id?{borderColor:audit.color}:{}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{audit.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{audit.auditor} · {audit.scope.slice(0,40)}{audit.scope.length>40?"…":""}</p>
              </div>
              <span className={"px-2 py-0.5 rounded-full text-xs font-semibold "+(auditStatColor[audit.status]||'bg-gray-50 text-gray-500')}>{audit.status}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs text-gray-500">{audit.startDate} → {audit.endDate}</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{background:audit.color+"15",color:audit.color}}>{audit.framework}</span>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Audit Readiness</span><span className="font-bold text-gray-700">{audit.readiness}%</span></div>
              <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full" style={{width:audit.readiness+"%",background:audit.readiness>=80?"#22C55E":audit.readiness>=60?"#EAB308":"#EF4444"}}/></div>
            </div>
            {auditFindings.filter(f=>f.auditId===audit.id&&f.status!=="Resolved").length>0&&(
              <p className="text-xs text-amber-600 font-medium">{auditFindings.filter(f=>f.auditId===audit.id&&f.status!=="Resolved").length} open findings</p>
            )}
          </div>
        ))}
      </div>
      {/* Risk-register audit gaps — which framework controls are failing per risk */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-sm font-semibold text-gray-800">Risk Register — Audit Control Gaps</span>
          <span className="ml-auto text-[10px] text-gray-400 italic">framework gaps per canonical risk</span>
        </div>
        <div className="divide-y divide-gray-50">
          {risks.map(r => (
            <div key={r.id} className="px-5 py-3">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{r.id}</span>
                <span className="text-xs font-medium text-gray-700">{r.title}</span>
                <StatusBadge status={r.status} />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {r.controls.map(c => (
                  <span key={c.framework} title={c.gap} className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded cursor-default">
                    {c.framework} — {c.gap.length > 55 ? c.gap.slice(0, 55) + '…' : c.gap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div><h3 className="font-semibold text-gray-900">Audit Findings</h3><p className="text-xs text-gray-400 mt-0.5">{selectedAudit?selectedAudit.name:"All audits"} · {findings.length} findings</p></div>
          {selectedAudit&&<button onClick={()=>setSelectedAudit(null)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">Show all →</button>}
        </div>
        <ModuleTable
          columns={[
            { key:"id",      label:"ID",          render:r=><span className="font-mono text-xs text-gray-400">{r.id}</span> },
            { key:"title",   label:"Finding",     render:r=><span className="text-sm font-medium text-gray-800">{r.title}</span> },
            { key:"sev",     label:"Severity",    render:r=><SeverityBadge severity={r.severity}/> },
            { key:"ctrl",    label:"Control",     render:r=>{const c=ctrlMap[r.controlId];return c?<div><span className="font-mono text-xs text-gray-400">{r.controlId}</span><p className="text-xs text-gray-500 truncate max-w-xs">{c.name}</p></div>:null} },
            { key:"eff",     label:"Effectiveness", render:r=>{const c=ctrlMap[r.controlId];return c?<EffectivenessBadge effectiveness={c.effectiveness} score={c.score}/>:null} },
            { key:"risk",    label:"Linked Risk",  render:r=>{const linked=risks.find(risk=>risk.controlIds.includes(r.controlId));return linked?<span onClick={()=>openDetail(linked)} className={`font-mono text-[10px] px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-75 transition-opacity ${linked.residualScore>=12?'bg-red-50 text-red-600 border-red-100':'bg-amber-50 text-amber-600 border-amber-100'}`}>{linked.id}</span>:null;} },
            { key:"status",  label:"Status",      render:r=><StatusBadge status={r.status}/> },
            { key:"due",     label:"Due",         render:r=>{
              const todayStr = new Date().toISOString().slice(0,10);
              const soc2Audit = audits.find(a=>a.id==='AUD-001');
              const overlapsSoc2 = soc2Audit && r.dueDate && Math.abs(daysFromToday(r.dueDate)-daysFromToday(soc2Audit.startDate))<=30;
              if (overlapsSoc2 && r.status!=='Resolved') {
                return <div><span className="text-xs text-amber-600 font-semibold">{r.dueDate}</span><p className="text-[10px] text-amber-500">SOC 2 starts {soc2Audit.startDate} ⚠</p></div>;
              }
              const days = daysFromToday(r.dueDate);
              const cls = r.dueDate<todayStr&&r.status!=='Resolved'?'text-red-500 font-semibold':days<=30&&r.status!=='Resolved'?'text-amber-600 font-medium':'text-gray-400';
              return <div><span className={"text-xs "+cls}>{r.dueDate}</span>{days>0&&r.status!=='Resolved'&&<p className="text-[10px] text-gray-400">{days}d remaining</p>}</div>;
            } },
            { key:"owner",   label:"Owner",       render:r=><span className="text-xs text-gray-500">{r.owner}</span> },
            { key:"actions", label:"",            render:r=><button onClick={()=>setWorkflow(r)} className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Actions</button> },
          ]}
          rows={findings}
          emptyMsg="No findings"
        />
      </div>
    </div>
  );
}

// ─── Evidence Locker ──────────────────────────────────────────────────────────
function EvidenceLocker() {
  const { controls } = useGRCData();
  const openDetail = useRiskDetail();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCtrl, setSelectedCtrl] = useState(null);
  const [lastSynced, setLastSynced] = useState(() => new Date(Date.now() - 6 * 3600000));

  const evByCtrl = controls.reduce((m,c)=>{m[c.id]=evidenceItems.filter(e=>e.controlId===c.id);return m;},{});
  const riskCriticalIds = [...new Set(risks.flatMap(r => r.controlIds))];
  const current  = evidenceItems.filter(e=>e.status==='Current').length;
  const expiring = evidenceItems.filter(e=>e.status==='Expiring').length;
  const expired  = evidenceItems.filter(e=>e.status==='Expired').length;
  const noEvidence = controls.filter(c=>!evByCtrl[c.id]?.length).length;
  const evStatusCls = { Current:'bg-green-50 text-green-700 border-green-200', Expiring:'bg-amber-50 text-amber-700 border-amber-200', Expired:'bg-red-50 text-red-700 border-red-200' };
  const evTypeIcon  = { Screenshot:'📸', 'Policy Document':'📄', 'Test Result':'🧪', Certificate:'🏅', Configuration:'⚙️', 'Training Record':'🎓', Assessment:'📋' };

  const filteredControls = controls.filter(c=>{
    const ev = evByCtrl[c.id]||[];
    const matchStatus = statusFilter==='All'||ev.some(e=>e.status===statusFilter)||(statusFilter==='Missing'&&!ev.length);
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase())||c.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Current Evidence" value={current}    icon={CheckCircle}   color="#22C55E" subtitle="valid and up to date" />
        <KPICard title="Expiring Soon"    value={expiring}   icon={AlertTriangle} color="#EAB308" subtitle="within 30 days" />
        <KPICard title="Expired"          value={expired}    icon={AlertTriangle} color="#EF4444" subtitle="immediate action needed" />
        <KPICard title="No Evidence"      value={noEvidence} icon={Eye}           color="#9CA3AF" subtitle="controls without evidence" />
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">Audit Readiness · Evidence Coverage</p>
        <p className="text-xs text-gray-600">{evidenceItems.length} evidence items across {[...new Set(evidenceItems.map(e=>e.controlId))].length} of {controls.length} controls. {noEvidence} controls have no evidence · required for SOC 2 Type II and ISO 27001.</p>
      </div>
      {/* Risk-critical evidence gaps — controls that directly reduce residual scores */}
      {(() => {
        const missing = riskCriticalIds.filter(id => !evByCtrl[id]?.length);
        const expired = riskCriticalIds.filter(id => evByCtrl[id]?.some(e => e.status === 'Expired'));
        if (!missing.length && !expired.length) return null;
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Risk-Critical Evidence Gaps</p>
            <p className="text-xs text-red-700 leading-relaxed">
              {missing.length > 0 && <span>{missing.length} risk-critical control{missing.length > 1 ? 's' : ''} lack evidence: <strong>{missing.join(', ')}</strong>. </span>}
              {expired.length > 0 && <span>{expired.length} have expired evidence: <strong>{expired.join(', ')}</strong>. </span>}
              These controls directly reduce residual scores in the Risk Register — missing evidence is an automatic audit finding.
            </p>
          </div>
        );
      })()}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Evidence Locker" subtitle={filteredControls.length+" controls"} search={search} setSearch={setSearch}
          syncedAt={lastSynced} onRefresh={() => setLastSynced(new Date())}
          filters={
            <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','Current','Expiring','Expired','Missing'].map(s=><option key={s}>{s}</option>)}
            </select>
          }
        />
        <div className="divide-y divide-gray-50">
          {filteredControls.map(ctrl=>{
            const ev = evByCtrl[ctrl.id]||[];
            const isOpen = selectedCtrl===ctrl.id;
            return (
              <div key={ctrl.id}>
                <div onClick={()=>setSelectedCtrl(isOpen?null:ctrl.id)} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {ctrl.ai&&<Cpu size={13} className="text-purple-400 flex-shrink-0"/>}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-gray-400">{ctrl.id}</span>
                        {ctrl.ai&&<span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">AI</span>}
                        {riskCriticalIds.includes(ctrl.id) && (() => { const r = risks.find(x => x.controlIds.includes(ctrl.id)); return <span onClick={e => { e.stopPropagation(); if (r) openDetail(r); }} className="px-1.5 py-0.5 bg-red-50 text-red-500 text-[10px] rounded border border-red-100 font-semibold cursor-pointer hover:bg-red-100 transition-colors">risk-critical</span>; })()}
                      </div>
                      <p className="text-sm font-medium text-gray-800 truncate">{ctrl.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score}/>
                    {ev.length===0
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">No evidence</span>
                      : <div className="flex gap-1">
                          {['Current','Expiring','Expired'].map(s=>{const n=ev.filter(e=>e.status===s).length;return n?<span key={s} className={"px-2 py-0.5 rounded-full text-xs font-semibold border "+(evStatusCls[s]||'')}>{n} {s}</span>:null;})}
                        </div>
                    }
                    {(()=>{
                      const firstExpiring = ev.filter(e=>e.expiryDate).sort((a,b)=>a.expiryDate.localeCompare(b.expiryDate))[0];
                      if (!firstExpiring) return null;
                      const d = daysFromToday(firstExpiring.expiryDate);
                      const cls = d < 30 ? 'text-red-600' : d < 90 ? 'text-amber-600' : 'text-emerald-600';
                      const parts = new Date(firstExpiring.expiryDate + 'T00:00:00');
                      const label = parts.toLocaleString('default', {month:'short', day:'numeric'});
                      return <span className={`text-xs font-medium ${cls} flex-shrink-0`}>{label}</span>;
                    })()}
                    <ChevronRight size={14} className={"text-gray-300 transition-transform "+(isOpen?'rotate-90':'')}/>
                  </div>
                </div>
                {isOpen&&(
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    {ev.length===0
                      ? <div className="py-4 flex items-center justify-between">
                          <p className="text-sm text-gray-400">No evidence uploaded for this control.</p>
                          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">+ Upload Evidence</button>
                        </div>
                      : <div className="space-y-2 pt-3">
                          {ev.map(e=>(
                            <div key={e.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-100 px-4 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base">{evTypeIcon[e.type]||"📁"}</span>
                                <div className="min-w-0"><p className="text-sm font-medium text-gray-800 truncate">{e.name}</p><p className="text-xs text-gray-400">{e.type} · {e.uploadDate} · {e.uploadedBy}</p></div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                <div className="text-right"><p className="text-xs text-gray-400">Expires</p><p className={"text-xs font-medium "+(e.status==='Expired'?'text-red-600':e.status==='Expiring'?'text-amber-600':'text-gray-600')}>{e.expiryDate}</p></div>
                                <span className={"px-2 py-0.5 rounded-full text-xs font-semibold border "+(evStatusCls[e.status]||'')}>{e.status}</span>
                              </div>
                            </div>
                          ))}
                          <button className="text-xs text-blue-500 hover:text-blue-700 font-medium pt-1">+ Upload additional evidence</button>
                        </div>
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


const navGroups = [
  {
    label: 'EXECUTIVE',
    items: [
      { id: 'overview',      label: 'Overview',        icon: Grid },
      { id: 'scorecard',     label: 'Scorecard',       icon: Award },
      { id: 'compliance',    label: 'Compliance',      icon: Shield },
      { id: 'leader-report', label: 'Monthly Report',  icon: Users },
    ],
  },
  {
    label: 'OPERATIONS',
    items: [
      { id: 'risks',      label: 'Risk Register',   icon: AlertTriangle },
      { id: 'vulns',      label: 'Vulnerabilities', icon: Bug },
      { id: 'incidents',  label: 'Incidents',       icon: Flame },
      { id: 'thirdparty', label: 'Third Party',     icon: Building2 },
      { id: 'policy',     label: 'Policy',          icon: BookOpen },
    ],
  },
  {
    label: 'GOVERNANCE',
    items: [
      { id: 'alignment',    label: 'Control Alignment', icon: CheckSquare },
      { id: 'audits',       label: 'Audit Management',  icon: FileText },
      { id: 'evidence',     label: 'Evidence Locker',   icon: Eye },
      { id: 'architecture', label: 'Architecture',      icon: Activity },
    ],
  },
];

// ─── Architecture (unchanged from previous) ───────────────────────────────────

const flowSteps = [
  {
    id:'ingest', label:'Signal Ingestion', icon:Database, color:'#2563EB', status:'healthy',
    stats:[{label:'Active sources',value:'4/6'},{label:'Events today',value:'1,731'}],
    detail:{
      what:'Adapters pull raw events from connected tools and normalise them into a common schema before passing to the Orchestrator.',
      numbers:[
        { label:'4 of 6 sources active', desc:'Splunk, AWS Security Hub, Jira, Okta are connected. Qualys is degraded (0 events, last sync 3h ago). Azure Sentinel is disconnected.' },
        { label:'1,731 events today', desc:'Splunk: 1,204 (SIEM alerts) | AWS Security Hub: 389 (cloud findings) | Jira: 47 (incident tickets) | Okta: 91 (identity events). Qualys: 0 (degraded).' },
      ],
      sources:[
        { name:'Splunk SIEM',        events:1204, status:'connected',    type:'Incidents / Detections' },
        { name:'AWS Security Hub',   events:389,  status:'connected',    type:'Vulnerabilities / Posture' },
        { name:'Okta',               events:91,   status:'connected',    type:'Identity / Access events' },
        { name:'Jira',               events:47,   status:'connected',    type:'Incident tickets' },
        { name:'Qualys',             events:0,    status:'warning',      type:'Vulnerability scans' },
        { name:'Azure Sentinel',     events:0,    status:'disconnected', type:'SIEM (not configured)' },
      ],
      note:'8 additional connectors available but not yet credentialed: Docker Scout, Wiz, Tenable, CrowdStrike, Datadog, GitHub, Snowflake, Drata.',
    },
  },
  {
    id:'orchestrate', label:'Orchestrator', icon:Zap, color:'#7C3AED', status:'healthy',
    stats:[{label:'Routed today',value:'187'},{label:'Avg latency',value:'1.2s'}],
    detail:{
      what:'Deduplicates, enriches, and routes normalised signals to the correct risk domain based on signal type, source, and severity.',
      numbers:[
        { label:'187 signals routed today', desc:'Out of 1,731 raw events, 1,544 were duplicates or below severity threshold. 187 unique, actionable signals passed to domain reviewers.' },
        { label:'1.2s avg latency', desc:'Time from adapter ingestion to domain assignment. Target is <5s. Spikes during batch Qualys imports.' },
      ],
      routing:[
        { signal:'CVE / vulnerability findings',    domain:'Vulnerability Mgmt',  count:89  },
        { signal:'Auth anomalies / access events',  domain:'Access Control',       count:34  },
        { signal:'SIEM detections',                 domain:'Incident Response',    count:28  },
        { signal:'Cloud posture findings',          domain:'Cloud Security',       count:21  },
        { signal:'AI-related events',              domain:'AI Governance',        count:15  },
      ],
      note:'Deduplication removed 1,544 repeat events. Cross-source correlation linked 23 Splunk alerts to existing open incidents.',
    },
  },
  {
    id:'review', label:'Domain Reviewers', icon:Shield, color:'#0891B2', status:'warning',
    stats:[{label:'Domains',value:'12'},{label:'Pending review',value:'23'}],
    detail:{
      what:'Assigned domain experts evaluate each routed signal, confirm risk rating, and decide on treatment. The warning status reflects the AI Governance backlog.',
      numbers:[
        { label:'12 risk domains', desc:'Access Control, Data Privacy, Third Party, Cloud Security, Identity, Endpoint, Network, Incident Response, Compliance, Vulnerability, Governance, AI Governance.' },
        { label:'23 pending review', desc:'Signals routed but not yet reviewed by a domain expert. Review SLA: Critical <4h, High <24h, others <72h.' },
      ],
      pending:[
        { domain:'AI Governance',   pending:8,  sla:'<24h', overdue:3 },
        { domain:'Data Privacy',    pending:5,  sla:'<24h', overdue:1 },
        { domain:'Access Control',  pending:4,  sla:'<4h',  overdue:1 },
        { domain:'Cloud Security',  pending:3,  sla:'<24h', overdue:0 },
        { domain:'Vulnerability',   pending:2,  sla:'<24h', overdue:0 },
        { domain:'Other (7)',       pending:1,  sla:'<72h', overdue:0 },
      ],
      note:'AI Governance has the highest backlog · 3 items are overdue. Driven by the EU AI Act gap (22% coverage) and 8 untested AI controls.',
    },
  },
  {
    id:'score', label:'Health Scoring', icon:Activity, color:'#059669', status:'healthy',
    stats:[{label:'Resilience score',value:'71 / 100'},{label:'Last run',value:'2h ago'}],
    detail:{
      what:'Composite score calculated from four weighted components. Recalculates automatically every 2 hours or on-demand after a domain review completes.',
      numbers:[
        { label:'71 / 100 composite score', desc:'Weighted average of the four components below. Was 68 last week · improving trend driven by MFA control progress.' },
        { label:'Last run 2h ago', desc:'Score recalculates on a 2-hour schedule or immediately when a domain reviewer closes a pending signal.' },
      ],
      components:[
        { name:'Risk Posture',          weight:'40%', score:68, contribution:27.2, note:'Dragged down by 12 open Critical/Severe risks and 3 untested AI controls' },
        { name:'Compliance Adherence',  weight:'30%', score:76, contribution:22.8, note:'EU AI Act (22%) and ISO 42001 (18%) gaps are the main detractors' },
        { name:'Operational Maturity',  weight:'20%', score:74, contribution:14.8, note:'Evidence Locker has 3 expiring items; Qualys sync degraded' },
        { name:'Security Posture',      weight:'10%', score:62, contribution:6.2,  note:'AI incident response plan untested; PAM control at 38%' },
      ],
      note:'Target score for Platinum program health is 85. Current gap: 14 points. Closing AI Governance gaps would have the highest single impact.',
    },
  },
  {
    id:'report', label:'Dashboard & Reports', icon:Eye, color:'#D97706', status:'healthy',
    stats:[{label:'Active modules',value:'13'},{label:'Reports/wk',value:'12'}],
    detail:{
      what:'Processed, scored signals surface across 13 dashboard modules. Reports are generated on demand or scheduled for leadership delivery.',
      numbers:[
        { label:'13 active modules', desc:'Overview, Risk Register, Vulnerabilities, Incidents, Policy, Third Party, Control Alignment, Compliance, Audit Management, Evidence Locker, Scorecard, Monthly Report, Architecture.' },
        { label:'12 reports/week', desc:'6 leader monthly reports (one per team), 3 framework compliance summaries, 2 audit readiness reports, 1 executive risk brief.' },
      ],
      outputs:[
        { type:'Leader Monthly Reports',        count:6,  format:'Web (shareable URL) + PDF',  audience:'Directors / VPs' },
        { type:'Framework Compliance Reports',  count:3,  format:'Dashboard + OSCAL export',   audience:'GRC team / Auditors' },
        { type:'Audit Readiness Reports',       count:2,  format:'PDF',                        audience:'External auditors' },
        { type:'Executive Risk Brief',          count:1,  format:'Dashboard scorecard',         audience:'C-Suite' },
      ],
      note:'OSCAL SSP export available in Control Alignment - downloads a NIST-compliant JSON of all 25 UCF controls for audit submission.',
    },
  },
];

const domainCards = [
  {name:'Access Control',icon:Lock,risks:42,critical:3,health:72,trend:'down'},{name:'Data Privacy',icon:Shield,risks:38,critical:5,health:65,trend:'down'},
  {name:'Third Party',icon:Globe,risks:31,critical:2,health:78,trend:'up'},{name:'Cloud Security',icon:Database,risks:27,critical:4,health:69,trend:'down'},
  {name:'Identity',icon:User,risks:21,critical:2,health:81,trend:'up'},{name:'Endpoint',icon:Activity,risks:24,critical:1,health:84,trend:'up'},
  {name:'Network',icon:Globe,risks:18,critical:1,health:88,trend:'up'},{name:'Incident Resp.',icon:AlertTriangle,risks:15,critical:0,health:91,trend:'up'},
  {name:'Compliance',icon:CheckSquare,risks:12,critical:0,health:93,trend:'up'},{name:'Vulnerability',icon:Eye,risks:29,critical:3,health:74,trend:'down'},
  {name:'Governance',icon:FileText,risks:9,critical:0,health:95,trend:'up'},{name:'AI Governance',icon:Cpu,risks:7,critical:3,health:24,trend:'down'},
];

const integrations = [
  {name:'Splunk SIEM',status:'connected',lastSync:'4 min ago',events:'1,204'},{name:'AWS Security Hub',status:'connected',lastSync:'12 min ago',events:'389'},
  {name:'Jira',status:'connected',lastSync:'1 min ago',events:'47'},{name:'Okta',status:'connected',lastSync:'2 min ago',events:'91'},
  {name:'Qualys',status:'warning',lastSync:'3h ago',events:'0'},{name:'Azure Sentinel',status:'disconnected',lastSync:'Never',events:'-'},
];

function Architecture() {
  const [selectedStep, setSelectedStep] = useState(null);
  const [archView, setArchView] = useState('flow');
  const statusDot = s => ({ healthy:'bg-emerald-500', warning:'bg-amber-400', disconnected:'bg-red-500' }[s]||'bg-gray-300');

  const openDetail = useRiskDetail();
  const categoryToDomain = { 'Vuln Mgmt':'Infrastructure', 'Third Party':'Supply Chain', 'AI Governance':'AI & Application', 'AI Security':'AI & Application' };
  const risksByDomain = risks.reduce((m, r) => {
    const d = categoryToDomain[r.category] || 'Governance & Compliance';
    if (!m[d]) m[d] = [];
    m[d].push(r);
    return m;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[['flow','Signal Flow'],['domains','Domain Reviewers'],['integrations','Integrations']].map(([id,label]) => (
          <button key={id} onClick={() => setArchView(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${archView===id?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>
        ))}
      </div>
      {archView === 'flow' && (
        <div className="space-y-4">
          {/* Pipeline strip */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Risk Signal Pipeline</h3>
            <p className="text-xs text-gray-400 mb-6">Click any stage to see a detailed breakdown</p>
            <div className="flex items-start gap-2 overflow-x-auto pb-2">
              {flowSteps.map((step, i) => {
                const Icon = step.icon;
                const isSel = selectedStep?.id === step.id;
                return (
                  <React.Fragment key={step.id}>
                    <div onClick={() => setSelectedStep(isSel ? null : step)}
                      className={`flex-shrink-0 w-44 rounded-xl border-2 p-4 cursor-pointer transition-all ${isSel?'shadow-lg scale-105':'hover:shadow-md hover:-translate-y-0.5'}`}
                      style={{ borderColor: isSel?step.color:'#E5E7EB', background: isSel?step.color+'08':'white' }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-1.5 rounded-lg" style={{ background: step.color+'18' }}><Icon size={16} style={{ color: step.color }} /></div>
                        <span className={`w-2 h-2 rounded-full ${statusDot(step.status)}`} />
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-tight mb-2">{step.label}</p>
                      <div className="flex flex-col gap-1.5">
                        {step.stats.map(s => (
                          <div key={s.label}>
                            <p className="text-sm font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {i < flowSteps.length-1 && <div className="flex-shrink-0 flex items-center pt-10"><ChevronRight size={18} className="text-gray-300" /></div>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Detailed breakdown panel */}
          {selectedStep && (() => {
            const d = selectedStep.detail;
            const color = selectedStep.color;
            return (
              <div className="bg-white rounded-xl border-2 shadow-sm" style={{ borderColor: color+'30' }}>
                <div className="p-5 border-b" style={{ borderColor: color+'20', background: color+'06' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg" style={{ background: color+'18' }}>
                      {React.createElement(selectedStep.icon, { size:14, style:{ color } })}
                    </div>
                    <h4 className="font-semibold text-gray-900">{selectedStep.label} · Breakdown</h4>
                  </div>
                  <p className="text-xs text-gray-500">{d.what}</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* What each number means */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What the numbers mean</p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {d.numbers.map(n => (
                        <div key={n.label} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-xs font-semibold text-gray-800 mb-1">{n.label}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage-specific detail tables */}
                  {d.sources && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Connected sources</p>
                      <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                        {d.sources.map(s => (
                          <div key={s.name} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(s.status)}`} />
                              <span className="text-sm font-medium text-gray-800">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-6 text-xs text-gray-500">
                              <span>{s.type}</span>
                              <span className="font-semibold text-gray-700 w-12 text-right">{s.events.toLocaleString()} events</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.routing && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Routing breakdown</p>
                      <div className="space-y-2">
                        {d.routing.map(r => (
                          <div key={r.domain} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-700 font-medium">{r.signal}</span>
                                <span className="text-gray-500">{r.count} signals</span>
                              </div>
                              <div className="text-xs text-gray-400">→ {r.domain}</div>
                            </div>
                            <div className="w-24 bg-gray-100 rounded-full h-1.5 flex-shrink-0">
                              <div className="h-1.5 rounded-full" style={{ width:`${(r.count/187)*100}%`, background: color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.pending && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending by domain</p>
                      <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                        {d.pending.map(p => (
                          <div key={p.domain} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                            <span className="text-sm font-medium text-gray-800">{p.domain}</span>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-gray-400">SLA {p.sla}</span>
                              <span className="font-semibold text-gray-700">{p.pending} pending</span>
                              {p.overdue > 0 && <span className="text-red-600 font-semibold">{p.overdue} overdue</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.components && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Score components</p>
                      <div className="space-y-3">
                        {d.components.map(c => (
                          <div key={c.name} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                                <span className="text-xs text-gray-400">{c.weight}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-400">contributes {c.contribution.toFixed(1)}</span>
                                <span className={`text-sm font-bold ${c.score >= 75 ? 'text-emerald-600' : c.score >= 65 ? 'text-amber-500' : 'text-red-500'}`}>{c.score}</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
                              <div className="h-1.5 rounded-full" style={{ width:`${c.score}%`, background: c.score>=75?'#22C55E':c.score>=65?'#F59E0B':'#EF4444' }} />
                            </div>
                            <p className="text-xs text-gray-400">{c.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.outputs && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Report outputs</p>
                      <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                        {d.outputs.map(o => (
                          <div key={o.type} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{o.type}</p>
                              <p className="text-xs text-gray-400">{o.format} · {o.audience}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-700">{o.count}/wk</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {d.note && (
                    <div className="flex items-start gap-2 p-3 rounded-lg border text-xs" style={{ borderColor: color+'30', background: color+'06' }}>
                      <AlertTriangle size={12} style={{ color }} className="flex-shrink-0 mt-0.5" />
                      <p style={{ color }}>{d.note}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Pipeline summary strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-emerald-600">4/5</p>
              <p className="text-xs text-gray-500 mt-0.5">Stages healthy</p>
              <p className="text-xs text-gray-400 mt-0.5">Domain Reviewers: warning</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">187</p>
              <p className="text-xs text-gray-500 mt-0.5">Signals routed today</p>
              <p className="text-xs text-gray-400 mt-0.5">from 1,731 raw events</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-amber-500">23</p>
              <p className="text-xs text-gray-500 mt-0.5">Pending domain review</p>
              <p className="text-xs text-red-400 mt-0.5">4 overdue (SLA breach)</p>
            </div>
          </div>
        </div>
      )}
      {archView === 'domains' && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {domainCards.map(d => {
            const Icon = d.icon;
            const healthColor = d.health>=85?'#22C55E':d.health>=70?'#EAB308':'#EF4444';
            return (
              <div key={d.name} className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${d.health<40?'border-red-200':' border-gray-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg"><Icon size={14} className="text-slate-600" /></div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${d.trend==='up'?'text-emerald-500':'text-red-400'}`}>{d.trend==='up'?'↑':'↓'} {d.health}</span>
                </div>
                <p className="text-xs font-semibold text-gray-800 mb-2">{d.name}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2"><div className="h-1.5 rounded-full" style={{ width:`${d.health}%`, background: healthColor }} /></div>
                <div className="flex justify-between text-xs text-gray-400 mb-2"><span>{d.risks} risks</span>{d.critical>0&&<span className="text-red-500 font-medium">{d.critical} critical</span>}</div>
                {risksByDomain[d.name] && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {risksByDomain[d.name].map(r => (
                      <span key={r.id} title={r.title} onClick={() => openDetail(r)} className={`text-[10px] font-mono px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-75 transition-opacity ${r.residualScore >= 12 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{r.id}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-1.5">
                  <button className="flex-1 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">View Risks</button>
                  <button className="flex-1 py-1.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">Run Review</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {archView === 'integrations' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div><h3 className="font-semibold text-gray-900">System Integrations</h3><p className="text-xs text-gray-400 mt-0.5">Connected data sources and platforms</p></div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Play size={13} /> Add Integration</button>
          </div>
          <div className="divide-y divide-gray-50">
            {integrations.map(intg => (
              <div key={intg.name} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot(intg.status)}`} />
                  <div><p className="text-sm font-medium text-gray-800">{intg.name}</p><p className="text-xs text-gray-400">Last sync: {intg.lastSync}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right"><p className="text-sm font-semibold text-gray-700">{intg.events}</p><p className="text-xs text-gray-400">events today</p></div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${intg.status==='connected'?'bg-emerald-50 text-emerald-700':intg.status==='warning'?'bg-amber-50 text-amber-700':'bg-red-50 text-red-600'}`}>{intg.status==='connected'?'Connected':intg.status==='warning'?'Degraded':'Disconnected'}</span>
                  <button className="text-blue-500 hover:text-blue-700 text-xs font-medium">{intg.status==='disconnected'?'Connect →':'Configure →'}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-gray-50 rounded-b-xl flex items-center justify-between">
            <p className="text-xs text-gray-400">4 of 6 integrations active</p>
            <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"><RefreshCw size={12} /> Sync all</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Copilot Message List ─────────────────────────────────────────────────────
function CopilotMessageList({ messages }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  return (
    <>
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
            m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
          }`}>
            {m.text}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function GRCDashboard() {
  const urlParam       = new URLSearchParams(window.location.search).get('leader');
  const [page, setPage]           = useState('overview');
  const [leaderTeamId, setLeaderTeamId] = useState(urlParam ?? null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveData, setLiveData]         = useState(null);
  const [dataLoading, setDataLoading]   = useState(isLive);

  // AI Copilot state
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([]);
  const [copilotInput, setCopilotInput] = useState('');

  // Computed alert count for header bell
  const alertCount = [
    ...vulns.filter(v => v.priority==='P0' && v.status!=='Patched'),
    ...incidents.filter(i => i.severity==='Critical' && i.status!=='Resolved'),
    ...policies.filter(p => p.status==='Missing'),
    ...risks.filter(r => getAppetite(r.residualScore)==='Significantly Exceeds'),
  ].length;

  const handleCopilotQuery = useCallback((q) => {
    if (!q.trim()) return;
    const question = q.trim();
    setCopilotMessages(msgs => [...msgs, { role: 'user', text: question }]);
    setCopilotInput('');

    let answer = '';
    const ql = question.toLowerCase();

    if (ql.includes('eu ai act') || ql.includes('compliance')) {
      const euAI = frameworks.find(f => f.name === 'EU AI Act');
      const failing = euAI ? euAI.controls - euAI.passing : 24;
      const missingPols = policies.filter(p => p.status === 'Missing' && p.ai);
      answer = `EU AI Act is at ${euAI?.progress || 22}% — ${failing} controls failing. The fastest path to improvement: (1) Create ${missingPols.map(p=>p.title).join(' and ')} — this unblocks 4 controls. (2) Test UCF.AI.01 through UCF.AI.06 — all currently untested. (3) Execute OpenAI DPA to satisfy Art.28. Realistic timeline to 60%: 8–10 weeks with dedicated effort.`;
    } else if (ql.includes('p1') || ql.includes('team') || ql.includes('unresolved')) {
      const teamVulns = teams.map(t => ({
        team: t,
        p1s: vulns.filter(v => v.priority==='P1' && v.status!=='Patched' && t.controls.includes(v.controlId)).length
      })).sort((a,b) => b.p1s - a.p1s);
      const worst = teamVulns[0];
      answer = `${worst.team.name} (${worst.team.lead}) has the most open P1 vulnerabilities with ${worst.p1s} unresolved. They own controls ${worst.team.controls.slice(0,3).join(', ')}. Recommend immediate triage session with ${worst.team.lead}.`;
    } else if (ql.includes('board') || ql.includes('risk') || ql.includes('summarise') || ql.includes('summarize')) {
      const topRisks = [..._rawRisks].sort((a,b) => (b.likelihood*b.impact)-(a.likelihood*a.impact)).slice(0,3);
      answer = `Top 3 risks for the board:\n\n1. ${topRisks[0].title} (score ${topRisks[0].likelihood*topRisks[0].impact}) — owner: ${topRisks[0].owner}, treatment: ${topRisks[0].treatmentPlan.slice(0,60)}…\n\n2. ${topRisks[1].title} (score ${topRisks[1].likelihood*topRisks[1].impact}) — ${topRisks[1].owner}\n\n3. ${topRisks[2].title} (score ${topRisks[2].likelihood*topRisks[2].impact}) — ${topRisks[2].owner}\n\nAll three require VP+ approval for risk acceptance.`;
    } else if (ql.includes('decide') || ql.includes('this week') || ql.includes('action')) {
      const p0Breach = vulns.filter(v => v.priority==='P0' && v.status!=='Patched' && daysFromToday(v.dueDate) < 0);
      const boardRisks = risks.filter(r => r.residualScore > RISK_APPETITE.severe);
      answer = `This week you need to: (1) ${p0Breach.length > 0 ? `Escalate P0 SLA breach on "${p0Breach[0].title}" — ${Math.abs(daysFromToday(p0Breach[0].dueDate))}d overdue` : 'Review P0/P1 patch SLA compliance'}. (2) ${boardRisks.length > 0 ? `Sign off on ${boardRisks[0].id} — residual score ${boardRisks[0].residualScore} significantly exceeds appetite` : 'Review risk register items approaching appetite'}. (3) Initiate OpenAI DPA process — vendor RSK-004 is your highest liability item.`;
    } else {
      answer = `Based on your current posture (71/100): ${vulns.filter(v=>v.status!=='Patched').length} open vulnerabilities, ${incidents.filter(i=>i.status!=='Resolved').length} active incidents, ${policies.filter(p=>p.status==='Missing'||p.status==='Overdue').length} policy gaps, and EU AI Act at 22%. Your most urgent action is addressing the P0 SLA breach and the 3 missing AI governance policies. What specific area would you like to dig into?`;
    }

    setTimeout(() => {
      setCopilotMessages(msgs => [...msgs, { role: 'assistant', text: answer }]);
    }, 600);
  }, []);

  useEffect(() => {
    if (!isLive) return;
    api.loadAll().then(data => {
      if (data) setLiveData({ ...data, isLive: true });
    }).finally(() => setDataLoading(false));
  }, []);

  const navigateToReport = (teamId) => {
    setLeaderTeamId(teamId);
    setPage('leader-report');
    window.history.replaceState(null, '', `?leader=${teamId}`);
  };

  const navigateBack = () => {
    setPage('scorecard');
    setLeaderTeamId(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const [focusId, setFocusId] = useState(null);
  const [detailRisk, setDetailRisk] = useState(null);

  const handleNavClick = (id, itemId = null) => {
    setPage(id);
    setFocusId(itemId);
    if (id !== 'leader-report') {
      setLeaderTeamId(null);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const allNavItems = navGroups.flatMap(g => g.items);
  const currentNav  = page === 'leader-report'
    ? { label: `${teams.find(t => t.id === leaderTeamId)?.name ?? 'Leader'} · Monthly Report` }
    : allNavItems.find(n => n.id === page);

  const pageMap = {
    overview:       <Overview navigate={handleNavClick} />,
    risks:          <RiskRegister focusId={focusId} />,
    vulns:          <Vulnerabilities focusId={focusId} />,
    incidents:      <Incidents focusId={focusId} />,
    policy:         <PolicyModule focusId={focusId} />,
    thirdparty:     <ThirdParty focusId={focusId} />,
    alignment:      <ControlAlignment />,
    compliance:     <Compliance />,
    audits:         <AuditManagement />,
    evidence:       <EvidenceLocker />,
    architecture:   <Architecture />,
    scorecard:      <Scorecard onViewReport={navigateToReport} />,
    'leader-report':<LeaderReport teamId={leaderTeamId} onBack={navigateBack} />,
  };

  return (
    <RiskDetailContext.Provider value={setDetailRisk}>
    <DataContext.Provider value={liveData}>
    {detailRisk && (
      <>
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDetailRisk(null)} />
        <RiskDetailDrawer risk={detailRisk} onClose={() => setDetailRisk(null)} />
      </>
    )}
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — overlay on mobile, flex item on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 transition-all duration-200
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
        ${!sidebarOpen ? 'lg:flex' : ''}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-56'}
      `}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Shield size={16} className="text-white" /></div>
          {(!sidebarCollapsed || sidebarOpen) && <div className="min-w-0"><p className="text-white font-semibold text-sm leading-tight truncate">{brand.tagline}</p><p className="text-slate-400 text-xs truncate">{brand.subtitle}</p></div>}
        </div>
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-4">
              {(!sidebarCollapsed || sidebarOpen) && <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</p>}
              <div className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => { handleNavClick(id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page===id?'bg-blue-600 text-white':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Icon size={15} className="flex-shrink-0" />
                    {(!sidebarCollapsed || sidebarOpen) && <span>{label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-slate-800 space-y-0.5 flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings size={15} className="flex-shrink-0" />{(!sidebarCollapsed || sidebarOpen) && <span>Settings</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(c => !c)} className="hidden lg:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Menu size={15} className="flex-shrink-0" />{!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(o => !o)} className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg flex-shrink-0">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{currentNav?.label}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Last updated: {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {dataLoading
              ? <span className="text-xs text-gray-400 animate-pulse hidden sm:block">Connecting…</span>
              : <span className={`px-2 py-1 rounded-full text-xs font-semibold hidden sm:inline-flex ${liveData ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>{liveData ? '● Live' : '◉ Demo'}</span>
            }
            <button onClick={() => setCopilotOpen(o => !o)}
              className={`p-2 rounded-lg transition-colors ${copilotOpen ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100 text-gray-400'}`}
              title="AI Copilot">
              <Cpu size={18} />
            </button>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell size={18} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {alertCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><User size={14} className="text-white" /></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{pageMap[page]}</main>
      </div>

      {/* AI Copilot Panel */}
      {copilotOpen && (
        <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-900 to-slate-900">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-purple-300" />
              <span className="text-sm font-semibold text-white">GRC Copilot</span>
              <span className="px-1.5 py-0.5 bg-purple-700 text-purple-200 text-[10px] rounded font-medium">Beta</span>
            </div>
            <button onClick={() => setCopilotOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <CopilotMessageList messages={copilotMessages} />
          </div>
          {/* Suggestions */}
          {copilotMessages.length === 0 && (
            <div className="px-4 pb-3 space-y-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Suggested questions</p>
              {[
                "What's blocking EU AI Act compliance?",
                "Which team has the most unresolved P1s?",
                "Summarise top 3 risks for the board",
                "What do I need to decide this week?",
              ].map(q => (
                <button key={q} onClick={() => handleCopilotQuery(q)}
                  className="w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg border border-gray-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}
          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2">
              <input value={copilotInput} onChange={e => setCopilotInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCopilotQuery(copilotInput)}
                placeholder="Ask anything about your GRC posture…"
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400" />
              <button onClick={() => handleCopilotQuery(copilotInput)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DataContext.Provider>
    </RiskDetailContext.Provider>
  );
}
