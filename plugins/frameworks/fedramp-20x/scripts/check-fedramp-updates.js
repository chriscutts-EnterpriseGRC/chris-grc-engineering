#!/usr/bin/env node

/**
 * FedRAMP 20X Policy Auto-Sync Script
 *
 * Checks the official FedRAMP/docs GitHub repository for updates
 * to machine-readable policy files and syncs them locally.
 *
 * Repository: https://github.com/FedRAMP/docs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEDRAMP_REPO = 'FedRAMP/docs';
const GITHUB_API = 'https://api.github.com';
const RAW_GITHUB = 'https://raw.githubusercontent.com';

// Policy files to sync
const POLICY_FILES = [
  'FRMR.KSI.key-security-indicators.json',
  'FRMR.VDR.vulnerability-detection-and-response.json',
  'FRMR.MAS.minimum-assessment-scope.json',
  'FRMR.PVA.persistent-validation-and-assessment.json',
  'FRMR.ICP.incident-communications-procedures.json',
  'FRMR.SCN.significant-change-notifications.json',
  'FRMR.CCM.collaborative-continuous-monitoring.json',
  'FRMR.ADS.authorization-data-sharing.json',
  'FRMR.RSC.recommended-secure-configuration.json',
  'FRMR.UCM.using-cryptographic-modules.json',
  'FRMR.FSI.fedramp-security-inbox.json',
  'FRMR.FRD.fedramp-definitions.json'
];

const CONFIG_DIR = path.join(__dirname, '..', 'config', '20x-policies');
const LAST_SYNC_FILE = path.join(CONFIG_DIR, '.last-sync.json');

async function getLastCommit() {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${FEDRAMP_REPO}/commits/main`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      sha: data.sha,
      date: data.commit.committer.date,
      message: data.commit.message
    };
  } catch (error) {
    return null;
  }
}

function getLastSync() {
  try {
    if (fs.existsSync(LAST_SYNC_FILE)) {
      return JSON.parse(fs.readFileSync(LAST_SYNC_FILE, 'utf8'));
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

function saveLastSync(commitInfo) {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(LAST_SYNC_FILE, JSON.stringify({
      ...commitInfo,
      syncedAt: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error('Failed to save sync info:', error.message);
  }
}

async function downloadPolicy(filename) {
  try {
    const url = `${RAW_GITHUB}/${FEDRAMP_REPO}/main/${filename}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function syncPolicies(force = false) {
  console.log('Checking FedRAMP/docs for updates...\n');

  const lastCommit = await getLastCommit();
  if (!lastCommit) {
    console.log('Could not reach FedRAMP/docs repository.');
    return;
  }

  const lastSync = getLastSync();

  if (!force && lastSync && lastSync.sha === lastCommit.sha) {
    console.log('Policies are up to date.');
    console.log(`Last sync: ${lastSync.syncedAt}`);
    return;
  }

  console.log('Updates available!');
  console.log(`Latest commit: ${lastCommit.sha.substring(0, 7)}`);
  console.log(`Message: ${lastCommit.message.split('\n')[0]}`);
  console.log(`Date: ${lastCommit.date}\n`);

  console.log('Downloading policy files...');

  let downloaded = 0;
  let failed = 0;

  for (const filename of POLICY_FILES) {
    const policy = await downloadPolicy(filename);
    if (policy) {
      const localPath = path.join(CONFIG_DIR, filename);
      fs.writeFileSync(localPath, JSON.stringify(policy, null, 2));
      console.log(`  ✓ ${filename}`);
      downloaded++;
    } else {
      console.log(`  ✗ ${filename} (not found or error)`);
      failed++;
    }
  }

  saveLastSync(lastCommit);

  console.log(`\nSync complete: ${downloaded} downloaded, ${failed} failed`);
}

async function checkOnly() {
  const lastCommit = await getLastCommit();
  const lastSync = getLastSync();

  if (!lastCommit) {
    return;
  }

  if (!lastSync || lastSync.sha !== lastCommit.sha) {
    console.log('FedRAMP 20X policy updates available.');
    console.log('Run /fedramp-20x:sync-docs to update.');
  }
}

// Main
const args = process.argv.slice(2);
const quiet = args.includes('--quiet');
const force = args.includes('--force');
const check = args.includes('--check');

if (quiet) {
  // Quiet mode: only notify if updates available
  checkOnly();
} else if (check) {
  // Check mode: show status without downloading
  checkOnly();
} else {
  // Full sync
  syncPolicies(force);
}
