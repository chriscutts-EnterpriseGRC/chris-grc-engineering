import React, { useState, useEffect, useContext, createContext } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Shield, AlertTriangle, TrendingUp, TrendingDown, CheckCircle,
  Grid, Search, Bell, Settings, User, Menu, Activity,
  ArrowUpRight, ArrowDownRight, ChevronRight, Zap, Database,
  Lock, Globe, Eye, RefreshCw, Play, FileText,
  CheckSquare, Bug, Flame, BookOpen, Building2, Cpu,
  Users, Download, Award, BarChart2
} from 'lucide-react';
import { api } from './lib/api';
import { isLive } from './lib/supabase';

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
  { id: 'V-001', cve: 'CVE-2024-1234', title: 'Log4Shell RCE in log4j-core',          severity: 'Critical', cvss: 10.0, status: 'Open',        asset: 'prod-api-01',       controlId: 'UCF.03.02', discovered: '2026-05-10' },
  { id: 'V-002', cve: 'CVE-2024-5678', title: 'OpenSSL buffer overflow',               severity: 'High',     cvss: 8.1,  status: 'In Progress', asset: 'auth-service',      controlId: 'UCF.03.02', discovered: '2026-05-12' },
  { id: 'V-003', cve: 'CVE-2024-9012', title: 'SMB lateral movement path',             severity: 'Critical', cvss: 9.3,  status: 'Open',        asset: 'corp-workstations', controlId: 'UCF.05.01', discovered: '2026-05-08' },
  { id: 'V-004', cve: 'CVE-2024-3456', title: 'nginx path traversal',                  severity: 'Medium',   cvss: 6.5,  status: 'Patched',     asset: 'web-proxy',         controlId: 'UCF.03.01', discovered: '2026-05-15' },
  { id: 'V-005', cve: 'CVE-2024-7890', title: 'AWS IAM privilege escalation',          severity: 'High',     cvss: 8.8,  status: 'Open',        asset: 'aws-prod',          controlId: 'UCF.01.02', discovered: '2026-05-14' },
  { id: 'V-006', cve: 'CVE-2024-2468', title: 'Docker container escape',               severity: 'High',     cvss: 7.9,  status: 'In Progress', asset: 'k8s-cluster',       controlId: 'UCF.05.01', discovered: '2026-05-18' },
  { id: 'V-007', cve: 'CVE-2024-1357', title: 'Unencrypted secrets in env vars',       severity: 'Medium',   cvss: 6.2,  status: 'Open',        asset: 'ci-pipeline',       controlId: 'UCF.02.01', discovered: '2026-05-20' },
  { id: 'V-008', cve: 'LLM-2024-001',  title: 'Prompt injection in AI chat endpoint', severity: 'High',     cvss: 8.0,  status: 'Open',        asset: 'ai-assistant-api',  controlId: 'UCF.AI.03', discovered: '2026-05-25', ai: true },
  { id: 'V-009', cve: 'LLM-2024-002',  title: 'AI model training data exfiltration',  severity: 'Critical', cvss: 9.1,  status: 'Open',        asset: 'ml-training-env',   controlId: 'UCF.AI.02', discovered: '2026-05-28', ai: true },
];

const incidents = [
  { id: 'INC-001', title: 'Unauthorized SSH access attempt',           severity: 'Critical', status: 'Resolved',     type: 'Intrusion',     detected: '2026-05-28', mttr: '4h',  controlId: 'UCF.01.01', systems: 3 },
  { id: 'INC-002', title: 'Sensitive data exfiltration alert',         severity: 'High',     status: 'Investigating', type: 'Data Breach',   detected: '2026-05-30', mttr: null,  controlId: 'UCF.02.02', systems: 1 },
  { id: 'INC-003', title: 'Ransomware execution blocked',              severity: 'Critical', status: 'Contained',    type: 'Malware',       detected: '2026-05-29', mttr: null,  controlId: 'UCF.08.01', systems: 2 },
  { id: 'INC-004', title: 'Phishing campaign — 12 users clicked',      severity: 'Medium',   status: 'Resolved',     type: 'Phishing',      detected: '2026-05-27', mttr: '2h',  controlId: 'UCF.07.02', systems: 12 },
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
  { id: 'TP-001', name: 'Salesforce',  category: 'SaaS — CRM',              tier: 1, riskScore: 72, status: 'Questionnaire Overdue', contractExpiry: '2026-12-31', dataShared: 'Customer PII',     controlId: 'UCF.06.02', lastAssessed: '2025-11-20', ai: false },
  { id: 'TP-002', name: 'AWS',         category: 'Cloud Infrastructure',     tier: 1, riskScore: 35, status: 'Compliant',             contractExpiry: '2027-03-15', dataShared: 'All Prod Data',    controlId: 'UCF.06.01', lastAssessed: '2026-03-10', ai: false },
  { id: 'TP-003', name: 'Accenture',   category: 'Professional Services',    tier: 2, riskScore: 58, status: 'Review Pending',        contractExpiry: '2026-09-30', dataShared: 'Project Data',     controlId: 'UCF.06.01', lastAssessed: '2026-01-15', ai: false },
  { id: 'TP-004', name: 'Twilio',      category: 'Communications',           tier: 1, riskScore: 67, status: 'SLA Breach',            contractExpiry: '2026-08-15', dataShared: 'Contact Data',     controlId: 'UCF.06.01', lastAssessed: '2026-02-28', ai: false },
  { id: 'TP-005', name: 'Okta',        category: 'Identity Provider',        tier: 1, riskScore: 42, status: 'Compliant',             contractExpiry: '2027-01-01', dataShared: 'Identity Data',    controlId: 'UCF.01.01', lastAssessed: '2026-05-01', ai: false },
  { id: 'TP-006', name: 'Snowflake',   category: 'Data Warehouse',           tier: 1, riskScore: 61, status: 'Review Pending',        contractExpiry: '2026-07-20', dataShared: 'Analytics Data',   controlId: 'UCF.02.01', lastAssessed: '2026-01-30', ai: false },
  { id: 'TP-007', name: 'OpenAI',      category: 'AI — LLM Provider',        tier: 1, riskScore: 81, status: 'No Contract',           contractExpiry: null,         dataShared: 'Prompts & Data',   controlId: 'UCF.AI.04', lastAssessed: null,         ai: true },
  { id: 'TP-008', name: 'Anthropic',   category: 'AI — LLM Provider',        tier: 1, riskScore: 74, status: 'Review Pending',        contractExpiry: '2026-09-01', dataShared: 'Prompts & Data',   controlId: 'UCF.AI.04', lastAssessed: '2026-04-01', ai: true },
  { id: 'TP-009', name: 'Cohere',      category: 'AI — Embeddings',          tier: 2, riskScore: 68, status: 'Questionnaire Overdue', contractExpiry: '2026-10-31', dataShared: 'Text Data',        controlId: 'UCF.AI.04', lastAssessed: '2026-02-15', ai: true },
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
const RISK_APPETITE = { medium: 11, high: 19 };
const getRiskRating = s => s >= 20 ? 'Critical' : s >= 12 ? 'High' : s >= 6 ? 'Medium' : 'Low';
const getRiskColor  = s => s >= 20 ? '#EF4444' : s >= 12 ? '#F97316' : s >= 6 ? '#EAB308' : '#22C55E';
const getAppetite   = s => s > RISK_APPETITE.high ? 'Significantly Exceeds' : s > RISK_APPETITE.medium ? 'Exceeds' : 'Within';
const CTRL_EFF = {'UCF.01.01':92,'UCF.01.02':38,'UCF.02.02':45,'UCF.03.02':41,'UCF.AI.02':33,'UCF.AI.03':0,'UCF.AI.04':51,'UCF.AI.05':0,'UCF.04.01':87,'UCF.05.01':71,'UCF.06.01':63,'UCF.06.02':62,'UCF.07.01':74,'UCF.09.01':69,'UCF.AI.01':29};

const _rawRisks = [
  { id:'RSK-001', title:'Privileged accounts without MFA',               category:'Access Control', asset:'Identity Platform',       owner:'J. Martinez', likelihood:4, impact:5, controlIds:['UCF.01.01','UCF.01.02'], treatment:'Mitigate', treatmentPlan:'Enforce Okta MFA for all admin accounts by 2026-06-15',              status:'Open',        reviewDate:'2026-06-15', linkedModule:'vulns',      ai:false },
  { id:'RSK-002', title:'AI model training data exfiltration risk',      category:'AI Governance',  asset:'ML Training Environment', owner:'A. Patel',    likelihood:3, impact:5, controlIds:['UCF.AI.02','UCF.AI.03'], treatment:'Mitigate', treatmentPlan:'Implement strict access controls on ML environments',                status:'Open',        reviewDate:'2026-06-30', linkedModule:'incidents',  ai:true  },
  { id:'RSK-003', title:'Critical vulnerabilities unpatched >30 days',   category:'Vuln Mgmt',      asset:'Production Systems',      owner:'T. Williams', likelihood:4, impact:4, controlIds:['UCF.03.02'],             treatment:'Mitigate', treatmentPlan:'Deploy automated patch pipeline and enforce 14-day SLA',            status:'Open',        reviewDate:'2026-06-20', linkedModule:'vulns',      ai:false },
  { id:'RSK-004', title:'OpenAI vendor — no contract or DPA',            category:'Third Party',    asset:'AI Chat Features',        owner:'S. Chen',     likelihood:3, impact:4, controlIds:['UCF.AI.04','UCF.06.01'], treatment:'Mitigate', treatmentPlan:'Execute DPA and security addendum with OpenAI by 2026-07-01',      status:'In Treatment',reviewDate:'2026-07-01', linkedModule:'thirdparty', ai:true  },
  { id:'RSK-005', title:'DLP controls ineffective — cloud storage gaps', category:'Data Protection', asset:'AWS S3 / GCS Buckets',   owner:'A. Patel',    likelihood:3, impact:4, controlIds:['UCF.02.02'],             treatment:'Mitigate', treatmentPlan:'Deploy cloud DLP scanning across all storage tiers',               status:'Open',        reviewDate:'2026-07-15', linkedModule:'vulns',      ai:false },
  { id:'RSK-006', title:'No AI usage or governance policy in place',     category:'AI Governance',  asset:'All AI Systems',          owner:'A. Patel',    likelihood:4, impact:3, controlIds:['UCF.AI.01'],             treatment:'Mitigate', treatmentPlan:'Draft, ratify and publish AI Usage and Ethics Policies',           status:'Open',        reviewDate:'2026-06-30', linkedModule:'policy',     ai:true  },
  { id:'RSK-007', title:'AI incident response plan never tested',        category:'AI Security',    asset:'AI Systems',              owner:'K. Thompson', likelihood:3, impact:4, controlIds:['UCF.AI.05','UCF.04.01'], treatment:'Mitigate', treatmentPlan:'Run AI-specific tabletop exercise Q3 2026',                        status:'Open',        reviewDate:'2026-08-30', linkedModule:'incidents',  ai:true  },
  { id:'RSK-008', title:'Vendor questionnaire backlog — 18 vendors',    category:'Third Party',    asset:'18 Vendor Relationships', owner:'S. Chen',     likelihood:3, impact:3, controlIds:['UCF.06.02'],             treatment:'Mitigate', treatmentPlan:'Automate questionnaire distribution via Vanta integration',        status:'In Treatment',reviewDate:'2026-08-01', linkedModule:'thirdparty', ai:false },
  { id:'RSK-009', title:'Prompt injection in public AI endpoint',        category:'AI Security',    asset:'AI Assistant API',        owner:'T. Williams', likelihood:4, impact:4, controlIds:['UCF.AI.03'],             treatment:'Mitigate', treatmentPlan:'Implement input validation and OWASP LLM Top 10 controls',         status:'Open',        reviewDate:'2026-06-15', linkedModule:'vulns',      ai:true  },
  { id:'RSK-010', title:'Password policy — 4 outstanding exceptions',   category:'Access Control', asset:'Employee Accounts',       owner:'J. Martinez', likelihood:2, impact:3, controlIds:['UCF.01.01'],             treatment:'Accept',   treatmentPlan:'Review all 4 exceptions for documented business justification',    status:'Accepted',    reviewDate:'2026-09-30', linkedModule:'policy',     ai:false },
  { id:'RSK-011', title:'Business continuity plan not validated',        category:'BCM',            asset:'Critical Systems',        owner:'K. Thompson', likelihood:2, impact:4, controlIds:['UCF.09.01'],             treatment:'Mitigate', treatmentPlan:'Conduct DR test and tabletop exercise by end Q3 2026',            status:'Open',        reviewDate:'2026-09-01', linkedModule:'policy',     ai:false },
  { id:'RSK-012', title:'Employee offboarding access revocation lag',    category:'Access Control', asset:'All Systems',             owner:'J. Martinez', likelihood:2, impact:2, controlIds:['UCF.01.01','UCF.01.02'], treatment:'Accept',   treatmentPlan:'Current 24h SLA acceptable — review quarterly',                   status:'Accepted',    reviewDate:'2026-10-01', linkedModule:'incidents',  ai:false },
];
const risks = _rawRisks.map(r => {
  const inherentScore = r.likelihood * r.impact;
  const reductionFactor = r.controlIds.reduce((f,id) => f * (1 - ((CTRL_EFF[id]??50)/100)*0.5), 1);
  const residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
  return { ...r, inherentScore, residualScore };
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
  if (!ctrl) return <span className="text-xs text-gray-400">—</span>;
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

function KPICard({ title, value, delta, deltaType, icon: Icon, color, subtitle }) {
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
    </div>
  );
}

function SeverityBadge({ severity }) {
  const s = { Critical:'bg-red-50 text-red-700 border border-red-200', High:'bg-orange-50 text-orange-700 border border-orange-200', Medium:'bg-yellow-50 text-yellow-700 border border-yellow-200', Low:'bg-green-50 text-green-700 border border-green-200' };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${s[severity]||s.Low}`}>{severity}</span>;
}

function StatusBadge({ status }) {
  const s = { 'Open':'bg-red-50 text-red-600', 'In Progress':'bg-blue-50 text-blue-600', 'Investigating':'bg-blue-50 text-blue-600', 'Contained':'bg-orange-50 text-orange-700', 'Mitigating':'bg-amber-50 text-amber-700', 'Resolved':'bg-green-50 text-green-600', 'Patched':'bg-green-50 text-green-600', 'Current':'bg-green-50 text-green-600', 'Due for Review':'bg-amber-50 text-amber-700', 'Overdue':'bg-red-50 text-red-600', 'Missing':'bg-red-50 text-red-600', 'Compliant':'bg-green-50 text-green-600', 'SLA Breach':'bg-red-50 text-red-600', 'No Contract':'bg-red-50 text-red-600', 'Review Pending':'bg-amber-50 text-amber-700', 'Questionnaire Overdue':'bg-orange-50 text-orange-700' };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s[status]||'bg-gray-50 text-gray-600'}`}>{status}</span>;
}

function HealthRing({ score }) {
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? '#22C55E' : score >= 65 ? '#EAB308' : '#EF4444';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F3F4F6" strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="block text-xs text-gray-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

function ModuleTable({ columns, rows, emptyMsg = 'No items found' }) {
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
            : rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {columns.map(c => (
                  <td key={c.key} className="px-4 py-3.5 align-middle">{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

function ModuleHeader({ title, subtitle, search, setSearch, filters, extra }) {
  return (
    <div className="p-5 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
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
  const [score, setScore] = useState(0);
  useEffect(() => { const t = setTimeout(() => setScore(71), 300); return () => clearTimeout(t); }, []);

  const effCounts = controls.reduce((a, c) => { a[c.effectiveness] = (a[c.effectiveness] || 0) + 1; return a; }, {});
  const allGaps = controls.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested');
  const failingControls = [...controls].filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').sort((a, b) => a.score - b.score).slice(0, 6);

  // Control gaps grouped by category
  const gapsByCategory = controls.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = { total: 0, gaps: 0 };
    acc[c.category].total++;
    if (c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested') acc[c.category].gaps++;
    return acc;
  }, {});
  const categoryGaps = Object.entries(gapsByCategory)
    .filter(([, v]) => v.gaps > 0)
    .sort((a, b) => b[1].gaps - a[1].gaps);

  const moduleSummaries = [
    { id: 'vulns',     label: 'Vulnerabilities', icon: Bug,       color: '#EF4444', count: vulns.filter(v=>v.status==='Open'||v.status==='In Progress').length,   unit: 'open',      ctrlId: 'UCF.03.02' },
    { id: 'incidents', label: 'Incidents',        icon: Flame,     color: '#F97316', count: incidents.filter(i=>i.status!=='Resolved').length,                    unit: 'active',    ctrlId: 'UCF.04.01' },
    { id: 'policy',    label: 'Policy',           icon: BookOpen,  color: '#7C3AED', count: policies.filter(p=>p.status==='Overdue'||p.status==='Missing').length, unit: 'overdue',   ctrlId: 'UCF.07.01' },
    { id: 'thirdparty',label: 'Third Party',      icon: Building2, color: '#0891B2', count: vendors.filter(v=>v.riskScore>=60).length,                            unit: 'high risk', ctrlId: 'UCF.06.01' },
  ];

  const riskScoreColor = (s) => s >= 20 ? 'text-red-600' : s >= 12 ? 'text-orange-500' : s >= 6 ? 'text-amber-500' : 'text-green-600';
  const riskBand = (s) => s >= 20 ? 'Critical' : s >= 12 ? 'High' : s >= 6 ? 'Medium' : 'Low';
  const riskBandBg = (s) => s >= 20 ? 'bg-red-50 text-red-700' : s >= 12 ? 'bg-orange-50 text-orange-700' : s >= 6 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Vulnerabilities" value={vulns.filter(v=>v.status!=='Patched').length} delta="3" deltaType="up" icon={Bug} color="#EF4444" subtitle="2 critical unpatched" />
        <KPICard title="Active Incidents"     value={incidents.filter(i=>i.status!=='Resolved').length} delta="2" deltaType="up" icon={Flame} color="#F97316" subtitle="2 unresolved critical" />
        <KPICard title="Policy Gaps"          value={policies.filter(p=>p.status==='Overdue'||p.status==='Missing').length} delta="2" deltaType="up" icon={BookOpen} color="#7C3AED" subtitle={`${policies.filter(p=>p.status==='Missing').length} missing`} />
        <KPICard title="Control Gaps"         value={allGaps.length} delta="1" deltaType="up" icon={AlertTriangle} color="#DC2626" subtitle={`${allGaps.filter(c=>!c.ai).length} core · ${allGaps.filter(c=>c.ai).length} AI`} />
      </div>

      {/* Resilience score + module cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-semibold text-gray-900 mb-1">Resilience Score</h3>
          <p className="text-xs text-gray-400 mb-3">Composite across all modules</p>
          <HealthRing score={score} />
          <p className="text-xs text-amber-600 font-medium mt-2">{allGaps.length} controls need remediation</p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {moduleSummaries.map(m => {
            const ctrl = ctrlMap[m.ctrlId];
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => navigate(m.id)}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all text-left group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 rounded-lg" style={{ background: m.color + '15' }}><Icon size={15} style={{ color: m.color }} /></div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-xl font-bold text-gray-900">{m.count} <span className="text-sm font-normal text-gray-400">{m.unit}</span></p>
                <p className="text-sm font-medium text-gray-700 mb-2">{m.label}</p>
                {ctrl && <EffectivenessBadge effectiveness={ctrl.effectiveness} score={ctrl.score} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control effectiveness + gaps by category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Control Effectiveness — UCF Library</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(effConfig).map(([key, cfg]) => (
              <div key={key} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                <p className={`text-2xl font-bold ${cfg.text}`}>{effCounts[key] || 0}</p>
                <p className={`text-xs font-medium ${cfg.text} mt-0.5`}>{cfg.label}</p>
              </div>
            ))}
          </div>
          <div className="w-full flex h-2 rounded-full overflow-hidden gap-0.5">
            {Object.entries(effConfig).map(([key, cfg]) => (
              <div key={key} className="h-2 rounded-full" style={{ width: `${((effCounts[key]||0)/controls.length)*100}%`, background: cfg.bar }} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{controls.length} total UCF controls mapped</p>
        </div>

        <div className="bg-white rounded-xl border border-red-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-semibold text-gray-900">Control Gaps by Category</h3>
            <span className="ml-auto px-2 py-0.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full">{allGaps.length} total</span>
          </div>
          <div className="space-y-2">
            {categoryGaps.map(([cat, v]) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 truncate">{cat}</span>
                    <span className="text-xs text-red-600 font-semibold ml-2 flex-shrink-0">{v.gaps}/{v.total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${(v.gaps/v.total)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk Register Snapshot */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Open Risk Register</h3>
            <p className="text-xs text-gray-400 mt-0.5">Top risks by inherent score — click Risks tab for full register</p>
          </div>
          <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">{openRisks.filter(r=>r.status!=='closed').length} open</span>
        </div>
        <div className="divide-y divide-gray-50">
          {openRisks.map(r => (
            <div key={r.risk_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-lg font-bold flex-shrink-0 ${riskScoreColor(r.inherent.score)}`}>{r.inherent.score}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">{r.risk_id}</span>
                    <span className={`px-1.5 py-0.5 text-xs font-semibold rounded ${riskBandBg(r.inherent.score)}`}>{riskBand(r.inherent.score)}</span>
                  </div>
                  <p className="text-sm text-gray-800 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.owner.team} · {r.treatment}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {r.residual && <span className="text-xs text-gray-400">residual <strong className="text-gray-700">{r.residual.score}</strong></span>}
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All failing controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Failing Controls</h3>
            <p className="text-xs text-gray-400 mt-0.5">All ineffective and untested controls across every domain</p>
          </div>
          <span className="text-xs text-gray-400">{allGaps.length} controls</span>
        </div>
        <div className="divide-y divide-gray-50">
          {failingControls.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                {c.ai && <Cpu size={14} className="text-purple-400 flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">{c.id}</span>
                    <span className="text-sm font-medium text-gray-800 truncate">{c.name}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">{c.category}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{c.frameworks.slice(0,3).join(' · ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <span className="text-xs text-gray-400">{c.owner}</span>
                <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} />
              </div>
            </div>
          ))}
          {allGaps.length > 6 && (
            <div className="px-5 py-3 text-xs text-gray-400 text-center">+{allGaps.length - 6} more — view Control Alignment for full list</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Vulnerabilities ──────────────────────────────────────────────────────────

function Vulnerabilities() {
  const { vulns, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);

  const data = vulns.filter(v =>
    (sevFilter === 'All' || v.severity === sevFilter) &&
    (!showAI || v.ai) &&
    (v.title.toLowerCase().includes(search.toLowerCase()) || v.cve.toLowerCase().includes(search.toLowerCase()))
  );

  const ctrl = ctrlMap['UCF.03.02'];
  const aiCtrl = ctrlMap['UCF.AI.03'];
  const openCount = vulns.filter(v => v.status !== 'Patched').length;
  const critCount = vulns.filter(v => v.severity === 'Critical' && v.status !== 'Patched').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Open Vulnerabilities" value={openCount} icon={Bug} color="#EF4444" subtitle={`${critCount} critical`} />
        <KPICard title="Avg CVSS Score" value="8.2" icon={AlertTriangle} color="#F97316" subtitle="across open vulns" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm col-span-2">
          <p className="text-xs text-gray-400 mb-1">Primary Control — {ctrl?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrl?.name}</p>
          <EffectivenessBadge effectiveness={ctrl?.effectiveness} score={ctrl?.score} />
          <p className="text-xs text-gray-400 mt-1">{ctrl?.frameworks.join(' · ')}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-800">AI Security Gap — {aiCtrl?.id}: {aiCtrl?.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">2 AI-specific vulnerabilities open. Control status: <strong className="text-red-600">Not Tested</strong>. No OWASP LLM Top 10 assessment completed. Mapped to {aiCtrl?.frameworks.join(', ')}.</p>
        </div>
        <EffectivenessBadge effectiveness={aiCtrl?.effectiveness} score={aiCtrl?.score} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Vulnerability Register" subtitle={`${data.length} vulnerabilities`} search={search} setSearch={setSearch}
          filters={<>
            <select value={sevFilter} onChange={e => setSevFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none">
              {['All','Critical','High','Medium','Low'].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowAI(a => !a)} className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${showAI ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Cpu size={13} /> AI Only
            </button>
          </>}
        />
        <ModuleTable
          columns={[
            { key: 'id',     label: 'ID',         render: r => <span className="font-mono text-xs text-gray-400">{r.id}</span> },
            { key: 'cve',    label: 'CVE / Ref',  render: r => <div className="flex items-center gap-1.5"><span className="font-mono text-xs text-blue-600">{r.cve}</span>{r.ai && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">AI</span>}</div> },
            { key: 'title',  label: 'Title',      render: r => <span className="text-sm text-gray-800 font-medium">{r.title}</span> },
            { key: 'severity',label:'Severity',   render: r => <SeverityBadge severity={r.severity} /> },
            { key: 'cvss',   label: 'CVSS',       render: r => <span className={`text-sm font-bold ${r.cvss>=9?'text-red-600':r.cvss>=7?'text-orange-500':'text-yellow-600'}`}>{r.cvss}</span> },
            { key: 'status', label: 'Status',     render: r => <StatusBadge status={r.status} /> },
            { key: 'asset',  label: 'Asset',      render: r => <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{r.asset}</span> },
            { key: 'ctrl',   label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',    label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
          ]}
          rows={data}
        />
      </div>
    </div>
  );
}

// ─── Incidents ────────────────────────────────────────────────────────────────

function Incidents() {
  const { incidents, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);

  const data = incidents.filter(i =>
    (statusFilter === 'All' || i.status === statusFilter) &&
    (!showAI || i.ai) &&
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  const active = incidents.filter(i => i.status !== 'Resolved');
  const mttrAvg = '3.2h';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Incidents"  value={active.length}  icon={Flame}         color="#F97316" subtitle="2 critical unresolved" />
        <KPICard title="Avg MTTR"          value={mttrAvg}        icon={RefreshCw}      color="#2563EB" subtitle="last 30 days" />
        <KPICard title="AI-Related"        value={incidents.filter(i=>i.ai).length} icon={Cpu} color="#9333EA" subtitle="2 open, 0 controls tested" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">IR Control — {ctrlMap['UCF.04.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.04.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.04.01']?.effectiveness} score={ctrlMap['UCF.04.01']?.score} />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">AI Incident Response Gap — {ctrlMap['UCF.AI.05']?.id}</p>
          <p className="text-xs text-gray-600 mt-0.5">No AI-specific IR playbook exists. 2 AI incidents (INC-007, INC-008) have no defined response procedure. Control mapped to {ctrlMap['UCF.AI.05']?.frameworks.join(', ')}.</p>
        </div>
        <EffectivenessBadge effectiveness={ctrlMap['UCF.AI.05']?.effectiveness} score={ctrlMap['UCF.AI.05']?.score} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Incident Register" subtitle={`${data.length} incidents`} search={search} setSearch={setSearch}
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
            { key: 'detected', label: 'Detected',render: r => <span className="text-xs text-gray-500">{r.detected}</span> },
            { key: 'mttr',     label: 'MTTR',    render: r => <span className="text-xs text-gray-500">{r.mttr || '—'}</span> },
            { key: 'systems',  label: 'Systems', render: r => <span className="text-xs font-semibold text-gray-600">{r.systems}</span> },
            { key: 'ctrl',     label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',      label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
          ]}
          rows={data}
        />
      </div>
    </div>
  );
}

// ─── Policy ───────────────────────────────────────────────────────────────────

function PolicyModule() {
  const { policies, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);

  const data = policies.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    (!showAI || p.ai) &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const missing = policies.filter(p => p.status === 'Missing').length;
  const overdue = policies.filter(p => p.status === 'Overdue').length;
  const exceptions = policies.reduce((s, p) => s + p.exceptions, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Missing Policies"  value={missing}    icon={AlertTriangle} color="#EF4444" subtitle="3 AI policies" />
        <KPICard title="Overdue Reviews"   value={overdue}    icon={FileText}      color="#F97316" subtitle="oldest: 2026-04-30" />
        <KPICard title="Open Exceptions"   value={exceptions} icon={Eye}           color="#EAB308" subtitle="across all policies" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Policy Control — {ctrlMap['UCF.07.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.07.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.07.01']?.effectiveness} score={ctrlMap['UCF.07.01']?.score} />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">3 AI Policies Missing — Action Required</p>
          <p className="text-xs text-gray-600 mt-0.5">AI Usage & Governance Policy (overdue since Mar 2026), AI Ethics & Bias Policy, and AI Vendor Risk Policy do not exist. Required by EU AI Act, ISO/IEC 42001, and GDPR Art.22. Controls {ctrlMap['UCF.AI.01']?.id}, {ctrlMap['UCF.AI.02']?.id}, {ctrlMap['UCF.AI.04']?.id} are ineffective until resolved.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Policy Library" subtitle={`${data.length} policies`} search={search} setSearch={setSearch}
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
            { key: 'version',     label: 'Version',    render: r => <span className="text-xs font-mono text-gray-500">{r.version || '—'}</span> },
            { key: 'reviewDate',  label: 'Review Due', render: r => <span className={`text-xs ${!r.reviewDate||r.reviewDate<'2026-06-01'?'text-red-500 font-medium':'text-gray-500'}`}>{r.reviewDate || 'Not set'}</span> },
            { key: 'exceptions',  label: 'Exceptions', render: r => <span className={`text-sm font-semibold ${r.exceptions>0?'text-amber-600':'text-gray-400'}`}>{r.exceptions}</span> },
            { key: 'owner',       label: 'Owner',      render: r => <span className="text-xs text-gray-500">{r.owner}</span> },
            { key: 'ctrl',        label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',         label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
          ]}
          rows={data}
        />
      </div>
    </div>
  );
}

// ─── Third Party ──────────────────────────────────────────────────────────────

function ThirdParty() {
  const { vendors, controls } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAI, setShowAI] = useState(false);

  const data = vendors.filter(v =>
    (statusFilter === 'All' || v.status === statusFilter) &&
    (!showAI || v.ai) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const noContract = vendors.filter(v => v.status === 'No Contract').length;
  const highRisk = vendors.filter(v => v.riskScore >= 60).length;
  const aiVendors = vendors.filter(v => v.ai).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="High-Risk Vendors"  value={highRisk}    icon={Building2}     color="#EF4444" subtitle="risk score ≥ 60" />
        <KPICard title="No Contract"        value={noContract}  icon={AlertTriangle} color="#F97316" subtitle="uncontracted AI vendors" />
        <KPICard title="AI Vendors"         value={aiVendors}   icon={Cpu}           color="#9333EA" subtitle="LLM & AI tool providers" />
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">TP Control — {ctrlMap['UCF.06.01']?.id}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{ctrlMap['UCF.06.01']?.name}</p>
          <EffectivenessBadge effectiveness={ctrlMap['UCF.06.01']?.effectiveness} score={ctrlMap['UCF.06.01']?.score} />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">AI Vendor Risk Gap — {ctrlMap['UCF.AI.04']?.id}: {ctrlMap['UCF.AI.04']?.name}</p>
          <p className="text-xs text-gray-600 mt-0.5">OpenAI has no contract and no last assessment date. Anthropic and Cohere questionnaires are overdue. These vendors process prompt data potentially including PII. Control effectiveness: <strong className="text-amber-700">Partial (51%)</strong>. Required by {ctrlMap['UCF.AI.04']?.frameworks.join(', ')}.</p>
        </div>
        <EffectivenessBadge effectiveness={ctrlMap['UCF.AI.04']?.effectiveness} score={ctrlMap['UCF.AI.04']?.score} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <ModuleHeader title="Third Party Register" subtitle={`${data.length} vendors`} search={search} setSearch={setSearch}
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
            { key: 'contractExpiry',label:'Contract',   render: r => <span className={`text-xs ${!r.contractExpiry?'text-red-500 font-semibold':r.contractExpiry<'2026-09-01'?'text-amber-600':'text-gray-500'}`}>{r.contractExpiry||'None'}</span> },
            { key: 'lastAssessed', label: 'Last Assessed', render: r => <span className={`text-xs ${!r.lastAssessed?'text-red-500 font-semibold':'text-gray-500'}`}>{r.lastAssessed||'Never'}</span> },
            { key: 'ctrl',         label: 'Linked Control', render: r => <ControlCell controlId={r.controlId} /> },
            { key: 'eff',          label: 'Control Effectiveness', render: r => { const c = ctrlMap[r.controlId]; return c ? <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} /> : null; } },
          ]}
          rows={data}
        />
      </div>
    </div>
  );
}

// ─── Compliance ───────────────────────────────────────────────────────────────

function Compliance() {
  const { frameworks } = useGRCData();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {frameworks.map(f => {
          const statusColor = f.status === 'Certified' || f.status === 'Compliant' ? 'text-emerald-600 bg-emerald-50' : f.status === 'Gap' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
          return (
            <div key={f.name} className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow ${f.status==='Gap'?'border-red-200':' border-gray-100'}`}>
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
            </div>
          );
        })}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Cpu size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-gray-800">AI Compliance Gaps — EU AI Act &amp; ISO/IEC 42001</p>
          <p className="text-xs text-gray-600 mt-0.5">EU AI Act coverage is 22% (7/31 controls passing). ISO/IEC 42001 is 18% (8/44 controls). Primary blockers: missing AI policies, untested AI security controls, and no AI model governance programme. Immediate action required before EU AI Act enforcement.</p>
        </div>
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
    description: 'Every UCF control across all frameworks — one control ID satisfies multiple regulatory requirements simultaneously.',
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
    description: 'AI Risk Management Framework (2023). Four functions — Govern, Map, Measure, Manage — designed specifically for AI-related risks including bias, explainability, model drift, and AI supply chain.',
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

// ─── Leadership Scorecard ─────────────────────────────────────────────────────

function Scorecard() {
  const { controls, vulns, incidents } = useGRCData();
  const ctrlMap = Object.fromEntries(controls.map(c => [c.id, c]));
  const [expanded, setExpanded] = useState(null);

  const teamStats = teams.map(team => {
    const owned = team.controls.map(id => ctrlMap[id]).filter(Boolean);
    const effective   = owned.filter(c => c.effectiveness === 'effective').length;
    const partial     = owned.filter(c => c.effectiveness === 'partial').length;
    const gaps        = owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').length;
    const health      = owned.length ? Math.round(((effective + partial * 0.5) / owned.length) * 100) : 0;
    const openVulns   = vulns.filter(v => owned.some(c => c.id === v.controlId) && v.status !== 'Patched').length;
    const openInc     = incidents.filter(i => owned.some(c => c.id === i.controlId) && i.status !== 'Resolved').length;
    const worstCtrl   = owned.filter(c => c.effectiveness === 'ineffective' || c.effectiveness === 'not_tested').sort((a,b) => a.score - b.score)[0];
    const riskScore   = openRisks.filter(r => r.owner.team === team.name || owned.some(c => c.owner === team.lead)).reduce((s, r) => Math.max(s, r.inherent.score), 0);
    return { ...team, owned, effective, partial, gaps, health, openVulns, openInc, worstCtrl, riskScore };
  });

  const criticalTeams = teamStats.filter(t => t.health < 50).length;
  const totalGaps     = teamStats.reduce((s, t) => s + t.gaps, 0);
  const avgHealth     = Math.round(teamStats.reduce((s, t) => s + t.health, 0) / teamStats.length);

  const healthColor = (h) => h >= 80 ? 'text-emerald-600' : h >= 60 ? 'text-amber-500' : 'text-red-500';
  const healthBg    = (h) => h >= 80 ? 'bg-emerald-500' : h >= 60 ? 'bg-amber-400' : 'bg-red-500';
  const healthBorder= (h) => h >= 80 ? 'border-emerald-200' : h >= 60 ? 'border-amber-200' : 'border-red-200';

  return (
    <div className="space-y-5">
      {/* Program KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Program Health"     value={`${avgHealth}%`}    icon={Award}    color="#2563EB" subtitle="avg across all teams" />
        <KPICard title="Teams At Risk"      value={criticalTeams}       icon={AlertTriangle} color="#EF4444" subtitle="health below 50%" />
        <KPICard title="Total Control Gaps" value={totalGaps}           icon={CheckSquare}   color="#D97706" subtitle="ineffective + untested" />
        <KPICard title="Open Risk Exposure" value={openRisks.filter(r=>r.inherent.score>=15).length} icon={BarChart2} color="#7C3AED" subtitle="critical + high risks" />
      </div>

      {/* Team scorecard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamStats.map(team => {
          const Icon = team.icon;
          const isOpen = expanded === team.id;
          return (
            <div key={team.id} className={`bg-white rounded-xl border shadow-sm transition-all ${healthBorder(team.health)}`}>
              <button className="w-full p-5 text-left" onClick={() => setExpanded(isOpen ? null : team.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ background: team.color + '18' }}>
                      <Icon size={15} style={{ color: team.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{team.name}</p>
                      <p className="text-xs text-gray-400">{team.dept} · {team.lead}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-bold ${healthColor(team.health)}`}>{team.health}%</p>
                    <p className="text-xs text-gray-400">health</p>
                  </div>
                </div>

                {/* Health bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                  <div className={`h-1.5 rounded-full ${healthBg(team.health)} transition-all`} style={{ width: `${team.health}%` }} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><p className="text-sm font-bold text-emerald-600">{team.effective}</p><p className="text-xs text-gray-400">Effective</p></div>
                  <div><p className="text-sm font-bold text-amber-500">{team.partial}</p><p className="text-xs text-gray-400">Partial</p></div>
                  <div><p className="text-sm font-bold text-red-500">{team.gaps}</p><p className="text-xs text-gray-400">Gaps</p></div>
                  <div><p className="text-sm font-bold text-orange-500">{team.openVulns + team.openInc}</p><p className="text-xs text-gray-400">Issues</p></div>
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-3">
                  {team.worstCtrl && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">Critical Gap</p>
                      <p className="font-mono text-xs text-red-400">{team.worstCtrl.id}</p>
                      <p className="text-xs text-red-800 font-medium">{team.worstCtrl.name}</p>
                      <p className="text-xs text-red-500 mt-1">{team.worstCtrl.frameworks.slice(0,2).join(' · ')}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {team.owned.map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-mono text-xs text-gray-400 mr-1.5">{c.id}</span>
                          <span className="text-xs text-gray-700 truncate">{c.name}</span>
                        </div>
                        <EffectivenessBadge effectiveness={c.effectiveness} score={c.score} />
                      </div>
                    ))}
                  </div>
                  {team.riskScore > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-gray-500">Max risk exposure: <strong className={healthColor(100 - team.riskScore * 4)}>{team.riskScore}/25</strong></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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

function ControlAlignment() {
  const { controls } = useGRCData();
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
          "system-name": "Resilience Operations Platform",
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

  return (
    <div className="space-y-5">

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
              className={`rounded-xl border-2 p-3 text-left transition-all ${isActive?'shadow-lg scale-[1.03]':'hover:shadow-md bg-white'}`}
              style={{ borderColor: isActive ? f.color : '#E5E7EB', background: isActive ? f.color+'10' : 'white' }}>
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
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100"><p className="text-xs text-gray-500">Existing NIST CSF controls that already satisfy {nistFn.label} subcategories — no duplicate effort needed.</p></div>
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
              <h3 className="font-semibold text-gray-900">{fw?.id === 'ALL' ? 'All UCF Controls — Framework Alignment Matrix' : `${fw?.label} Controls`}</h3>
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
                          {aligned.length === 0 && <span className="text-xs text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{ctrl.owner}</td>
                      <td className="px-4 py-3.5"><span className={`text-xs ${!ctrl.lastTested?'text-red-500 font-semibold':'text-gray-400'}`}>{ctrl.lastTested||'Never'}</span></td>
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
              <strong> NIST AI RMF</strong> (Govern, Map, Measure, Manage) governs <em>how you manage AI-specific risk</em> — bias, explainability, model drift, data provenance, AI supply chain.
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
                Existing NIST CSF controls that already satisfy {fn.label} subcategories — no duplicate effort needed for these.
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

// ─── Sidebar Nav ──────────────────────────────────────────────────────────────

const navGroups = [
  {
    label: 'RESILIENCE OPS',
    items: [
      { id: 'overview',    label: 'Overview',        icon: Grid },
      { id: 'risks',       label: 'Risk Register',   icon: AlertTriangle },
      { id: 'vulns',       label: 'Vulnerabilities', icon: Bug },
      { id: 'incidents',   label: 'Incidents',       icon: Flame },
      { id: 'policy',      label: 'Policy',          icon: BookOpen },
      { id: 'thirdparty',  label: 'Third Party',     icon: Building2 },
    ],
  },
  {
    label: 'GRC',
    items: [
      { id: 'alignment',   label: 'Control Alignment', icon: CheckSquare },
      { id: 'compliance',  label: 'Compliance',        icon: Shield },
      { id: 'audits',      label: 'Audit Management',  icon: FileText },
      { id: 'evidence',    label: 'Evidence Locker',   icon: Eye },
      { id: 'architecture',label: 'Architecture',      icon: Activity },
    ],
  },
];

// ─── Architecture (unchanged from previous) ───────────────────────────────────

const flowSteps = [
  { id:'ingest',     label:'Signal Ingestion',    icon:Database, color:'#2563EB', status:'healthy',  stats:[{label:'Sources',value:'14'},{label:'Events/day',value:'2.4K'}], actions:[{label:'View Sources'},{label:'Add Source'}] },
  { id:'orchestrate',label:'Orchestrator',        icon:Zap,      color:'#7C3AED', status:'healthy',  stats:[{label:'Routed today',value:'187'},{label:'Avg latency',value:'1.2s'}], actions:[{label:'View Queue'},{label:'Run Now'}] },
  { id:'review',     label:'Domain Reviewers',    icon:Shield,   color:'#0891B2', status:'warning',  stats:[{label:'Domains',value:'12'},{label:'Pending',value:'23'}], actions:[{label:'View Domains'},{label:'Run Review'}] },
  { id:'score',      label:'Health Scoring',      icon:Activity, color:'#059669', status:'healthy',  stats:[{label:'Current score',value:'71'},{label:'Last run',value:'2h ago'}], actions:[{label:'Score Breakdown'},{label:'Recalculate'}] },
  { id:'report',     label:'Dashboard & Reports', icon:Eye,      color:'#D97706', status:'healthy',  stats:[{label:'Active views',value:'7'},{label:'Reports/wk',value:'12'}], actions:[{label:'View Reports'},{label:'Schedule'}] },
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
  {name:'Qualys',status:'warning',lastSync:'3h ago',events:'0'},{name:'Azure Sentinel',status:'disconnected',lastSync:'Never',events:'—'},
];

function Architecture() {
  const [selectedStep, setSelectedStep] = useState(null);
  const [archView, setArchView] = useState('flow');
  const statusDot = s => ({ healthy:'bg-emerald-500', warning:'bg-amber-400', disconnected:'bg-red-500' }[s]||'bg-gray-300');

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[['flow','Signal Flow'],['domains','Domain Reviewers'],['integrations','Integrations']].map(([id,label]) => (
          <button key={id} onClick={() => setArchView(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${archView===id?'bg-blue-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{label}</button>
        ))}
      </div>
      {archView === 'flow' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Risk Signal Pipeline</h3>
            <p className="text-xs text-gray-400 mb-6">Click any stage to inspect and act</p>
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
                      <div className="flex gap-2">
                        {step.stats.map(s => (
                          <div key={s.label} className="flex-1 text-center">
                            <p className="text-sm font-bold text-gray-900">{s.value}</p>
                            <p className="text-xs text-gray-400 leading-tight">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {i < flowSteps.length-1 && <div className="flex-shrink-0 flex items-center pt-8"><ChevronRight size={18} className="text-gray-300" /></div>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          {selectedStep && (
            <div className="bg-white rounded-xl border shadow-sm p-5" style={{ borderColor: selectedStep.color+'40' }}>
              <h4 className="font-semibold text-gray-900 mb-1">{selectedStep.label}</h4>
              <div className="flex gap-2 mt-3">
                {selectedStep.actions.map(({label}) => (
                  <button key={label} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">{label}</button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-emerald-600">4/5</p><p className="text-xs text-gray-500 mt-0.5">Stages healthy</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-gray-900">187</p><p className="text-xs text-gray-500 mt-0.5">Signals processed today</p></div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-center"><p className="text-2xl font-bold text-amber-500">23</p><p className="text-xs text-gray-500 mt-0.5">Pending review</p></div>
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
                <div className="flex justify-between text-xs text-gray-400 mb-3"><span>{d.risks} risks</span>{d.critical>0&&<span className="text-red-500 font-medium">{d.critical} critical</span>}</div>
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

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function GRCDashboard() {
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [dataLoading, setDataLoading] = useState(isLive);

  useEffect(() => {
    if (!isLive) return;
    api.loadAll().then(data => {
      if (data) setLiveData({ ...data, isLive: true });
    }).finally(() => setDataLoading(false));
  }, []);

  const allNavItems = navGroups.flatMap(g => g.items);
  const currentNav = allNavItems.find(n => n.id === page);

  const pageMap = {
    overview:     <Overview navigate={setPage} />,
    risks:        <RiskRegister />,
    vulns:        <Vulnerabilities />,
    incidents:    <Incidents />,
    policy:       <PolicyModule />,
    thirdparty:   <ThirdParty />,
    alignment:    <ControlAlignment />,
    compliance:   <Compliance />,
    audits:       <AuditManagement />,
    evidence:     <EvidenceLocker />,
    architecture: <Architecture />,
  };

  return (
    <DataContext.Provider value={liveData}>
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className={`${sidebarOpen?'w-56':'w-16'} flex-shrink-0 bg-slate-900 flex flex-col transition-all duration-200`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"><Shield size={16} className="text-white" /></div>
          {sidebarOpen && <div className="min-w-0"><p className="text-white font-semibold text-sm leading-tight truncate">Resilience Ops</p><p className="text-slate-400 text-xs truncate">Chris Cutts</p></div>}
        </div>
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-4">
              {sidebarOpen && <p className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.label}</p>}
              <div className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setPage(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${page===id?'bg-blue-600 text-white':'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                    <Icon size={15} className="flex-shrink-0" />
                    {sidebarOpen && <span>{label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-slate-800 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Settings size={15} className="flex-shrink-0" />{sidebarOpen&&<span>Settings</span>}</button>
          <button onClick={() => setSidebarOpen(o => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Menu size={15} className="flex-shrink-0" />{sidebarOpen&&<span>Collapse</span>}</button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-semibold text-gray-900">{currentNav?.label}</h1>
            <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p>
          </div>
          <div className="flex items-center gap-3">
            {dataLoading
              ? <span className="text-xs text-gray-400 animate-pulse">Connecting…</span>
              : <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${liveData ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{liveData ? '● Live' : '○ Demo'}</span>
            }
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"><Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /></button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"><User size={14} className="text-white" /></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{pageMap[page]}</main>
      </div>
    </div>
    </DataContext.Provider>
  );
}
