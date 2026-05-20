/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BuildStatus = 'queued' | 'running' | 'success' | 'failed';

export interface ActiveBuild {
  id: string;
  name: string;
  status: BuildStatus;
  branch: string;
  commitSha: string;
  dockerUrl: string;
  techStack: {
    language: string;
    version: string;
  };
  createdAt: string;
  duration?: string;
  gitRepoUrl: string;
  registryUser?: string;
}

export interface SecretItem {
  id: string;
  name: string;
  type: 'git_token' | 'registry_credential';
  identifier: string; // e.g. github.com, docker.io, etc.
  hint: string; // e.g. ghp_****XXXX
  createdAt: string;
}

export interface LogLine {
  id: string;
  timestamp: string;
  line: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
}

export type TabType = 'dashboard' | 'built-images' | 'build-logs' | 'secrets-vault' | 'settings';
