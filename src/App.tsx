/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TabType, ActiveBuild, SecretItem, LogLine } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Wizard from './components/Wizard';
import BuiltImages from './components/BuiltImages';
import BuildLogs from './components/BuildLogs';
import SecretsVault from './components/SecretsVault';
import SettingsView from './components/Settings';

// Initial Mock Secrets to signify Supabase Vault Postgres keys are active
const INITIAL_SECRETS: SecretItem[] = [
  {
    id: 'sec-git-prod',
    name: 'github-production-deploy-key',
    type: 'git_token',
    identifier: 'github.com',
    hint: 'ghp_8i7Y...hP89',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'sec-reg-dh',
    name: 'dockerhub-siddharta-push-key',
    type: 'registry_credential',
    identifier: 'docker.io',
    hint: 'dckr_pat_U71y...Lp13',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

// Seed/Initial builds to show beautiful loaded workspace on start
const INITIAL_BUILDS: ActiveBuild[] = [
  {
    id: 'b-node-9182',
    name: 'build-nodejs-9182',
    status: 'success',
    branch: 'main',
    commitSha: 'e912a7a',
    dockerUrl: 'docker.io/siddhartareddy/node-api-service:v1.0.0',
    techStack: { language: 'Node.js', version: '18' },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    gitRepoUrl: 'https://github.com/siddharta02/node-microservice',
    registryUser: 'siddhartareddy'
  },
  {
    id: 'b-py-2019',
    name: 'build-python-2019',
    status: 'failed',
    branch: 'release-v3',
    commitSha: '8bf41cc',
    dockerUrl: 'docker.io/siddhartareddy/fastapi-ml-model:v0.9.1',
    techStack: { language: 'Python', version: '3.10' },
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    gitRepoUrl: 'https://github.com/siddharta02/fastapi-nlp-model',
    registryUser: 'siddhartareddy'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [builds, setBuilds] = useState<ActiveBuild[]>(INITIAL_BUILDS);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState<ActiveBuild | null>(null);
  
  // Vault secret state lists configurations
  const [secrets, setSecrets] = useState<SecretItem[]>(INITIAL_SECRETS);

  // Checks for onboarding checklist
  const githubConnected = secrets.some(s => s.type === 'git_token');
  const registryConnected = secrets.some(s => s.type === 'registry_credential');

  // Logs cache by buildId
  const [logLines, setLogLines] = useState<Record<string, LogLine[]>>({});

  // Seed default logs for initialized mock items
  useEffect(() => {
    // Generate success logs for 'b-node-9182'
    const successLogs: LogLine[] = generateStaticMockLogs('b-node-9182', 'Node.js', '18', 'main', 'e912a7a', 'docker.io/siddhartareddy/node-api-service:v1.0.0', false);
    // Generate failed logs for 'b-py-2019'
    const failedLogs: LogLine[] = generateStaticMockLogs('b-py-2019', 'Python', '3.10', 'release-v3', '8bf41cc', 'docker.io/siddhartareddy/fastapi-ml-model:v0.9.1', true);
    
    setLogLines({
      'b-node-9182': successLogs,
      'b-py-2019': failedLogs
    });
  }, []);

  // Watch queued/running builds to advance their state with simulated live streaming logs!
  useEffect(() => {
    // Look for builds in queued state
    const queuedBuild = builds.find(b => b.status === 'queued');
    if (queuedBuild) {
      // Transition from queued to running in 2.5 seconds
      const timer = setTimeout(() => {
        setBuilds(prev => prev.map(b => b.id === queuedBuild.id ? { ...b, status: 'running' } : b));
        
        // Initialize dynamic log array for this build
        setLogLines(prev => ({
          ...prev,
          [queuedBuild.id]: [
            { id: 'l-0', timestamp: getTimestampStr(), line: 'TEKTON PIPELINE RUN INITIATED - namespace: devflow-cd-execution', type: 'info' },
            { id: 'l-1', timestamp: getTimestampStr(), line: `PipelineRun coordinates: ${queuedBuild.name}`, type: 'info' },
            { id: 'l-2', timestamp: getTimestampStr(), line: 'Fetching Vault credentials from Supabase via TLS keys...', type: 'info' },
            { id: 'l-3', timestamp: getTimestampStr(), line: 'Decrypting row secret metadata using pgsodium extension...', type: 'info' },
            { id: 'l-4', timestamp: getTimestampStr(), line: 'Successfully authenticated Git deployment token hook!', type: 'success' },
            { id: 'l-5', timestamp: getTimestampStr(), line: `git clone ${queuedBuild.gitRepoUrl} --branch ${queuedBuild.branch} --single-branch`, type: 'command' },
            { id: 'l-6', timestamp: getTimestampStr(), line: `Cloning into &apos;/workspace/shared-workspace&apos;...`, type: 'info' },
            { id: 'l-7', timestamp: getTimestampStr(), line: `remote: Enumerating objects: 142, done.`, type: 'info' },
            { id: 'l-8', timestamp: getTimestampStr(), line: `remote: Counting objects: 100% (142/142), done.`, type: 'info' },
            { id: 'l-9', timestamp: getTimestampStr(), line: `HEAD is now at ${queuedBuild.commitSha} Merge pull request #82 from siddharta/feature/k8s-tekton`, type: 'success' },
          ]
        }));
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Look for builds in running state
    const runningBuild = builds.find(b => b.status === 'running');
    if (runningBuild) {
      const existingLogs = logLines[runningBuild.id] || [];
      const currentLogCount = existingLogs.length;

      // We have a list of compilation statements to append dynamically
      const compileSteps = getLanguageCompileStatements(runningBuild);

      if (currentLogCount - 10 < compileSteps.length) {
        // Append next statement
        const nextStepIndex = currentLogCount - 10;
        const timer = setTimeout(() => {
          const nextLine = compileSteps[nextStepIndex];
          setLogLines(prev => ({
            ...prev,
            [runningBuild.id]: [
              ...(prev[runningBuild.id] || []),
              {
                id: `l-dyn-${nextStepIndex}`,
                timestamp: getTimestampStr(),
                line: nextLine.line,
                type: nextLine.type as any
              }
            ]
          }));
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        // Complete the build with a success state!
        const timer = setTimeout(() => {
          setBuilds(prev => prev.map(b => b.id === runningBuild.id ? { ...b, status: 'success' } : b));
          
          setLogLines(prev => ({
            ...prev,
            [runningBuild.id]: [
              ...(prev[runningBuild.id] || []),
              { id: 'l-end-1', timestamp: getTimestampStr(), line: 'Pushing image layers to Docker Registry endpoint...', type: 'command' },
              { id: 'l-end-2', timestamp: getTimestampStr(), line: `Preparing layer mappings for destination: ${runningBuild.dockerUrl}`, type: 'info' },
              { id: 'l-end-3', timestamp: getTimestampStr(), line: 'Pushed l-layer 1 digest sha256:d82e1c31904aef...', type: 'info' },
              { id: 'l-end-4', timestamp: getTimestampStr(), line: 'Pushed l-layer 2 digest sha256:e9a18ceb1d84ca...', type: 'info' },
              { id: 'l-end-5', timestamp: getTimestampStr(), line: `Successfully tagged image: ${runningBuild.dockerUrl}`, type: 'success' },
              { id: 'l-end-6', timestamp: getTimestampStr(), line: 'PipelineRun finished with execution code 0 (Success)', type: 'success' },
              { id: 'l-end-7', timestamp: getTimestampStr(), line: 'Kubernetes Pod worker successfully deleted from pool.', type: 'info' }
            ]
          }));
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [builds, logLines]);

  // Handler to register a newly formulated build
  const handleAddNewBuild = (newBuild: ActiveBuild, pipelineRunPayload: any) => {
    setBuilds(prev => [newBuild, ...prev]);
    // Auto focus the Build Logs/Terminal screen to let user observe live stream!
    setSelectedBuild(newBuild);
    setActiveTab('build-logs');
  };

  const handleSelectBuildForLogs = (build: ActiveBuild | null) => {
    setSelectedBuild(build);
    setActiveTab('build-logs');
  };

  // Add a secret into Vault
  const handleAddSecret = (newSecret: SecretItem) => {
    setSecrets(prev => [newSecret, ...prev]);
  };

  // Delete secret from Vault
  const handleDeleteSecret = (id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        buildsCount={builds.filter(b => b.status === 'running' || b.status === 'queued').length}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
        
        {/* Top Control Plane Banner Hub */}
        <header className="px-6 py-4.5 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 font-mono tracking-wider uppercase">ENV: PRODUCTION</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-slate-400">Kubernetes Schedulers Healthy</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="text-slate-500 block">Supabase VAULT</span>
              <span className="text-violet-400 font-mono font-bold">Enabled (pgsodium Active)</span>
            </div>
            <span className="text-slate-800 font-mono">|</span>
            <div>
              <span className="text-slate-505 block">System User</span>
              <span className="text-slate-200 font-semibold truncate max-w-[120px] inline-block">Siddharta Reddy</span>
            </div>
          </div>
        </header>

        {/* View switching panel */}
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard 
              builds={builds} 
              onTriggerWizard={() => setIsWizardOpen(true)}
              onSelectBuild={handleSelectBuildForLogs}
              githubConnected={githubConnected}
              registryConnected={registryConnected}
            />
          )}

          {activeTab === 'built-images' && (
            <BuiltImages builds={builds} />
          )}

          {activeTab === 'build-logs' && (
            <BuildLogs 
              builds={builds}
              selectedBuild={selectedBuild}
              onSelectBuild={setSelectedBuild}
              logLines={logLines}
              onAddLogLine={(bId, line) => {
                setLogLines(prev => ({ ...prev, [bId]: [...(prev[bId] || []), line] }));
              }}
            />
          )}

          {activeTab === 'secrets-vault' && (
            <SecretsVault 
              secrets={secrets}
              onAddSecret={handleAddSecret}
              onDeleteSecret={handleDeleteSecret}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView 
              githubConnected={githubConnected}
              onToggleGithub={() => {
                // Mock toggle of github details inside Vault
                const exists = secrets.some(s => s.type === 'git_token');
                if (exists) {
                  setSecrets(prev => prev.filter(s => s.type !== 'git_token'));
                } else {
                  setSecrets(prev => [...prev, {
                    id: 'sec-git-mock',
                    name: 'github-onboarding-token',
                    type: 'git_token',
                    identifier: 'github.com',
                    hint: 'ghp_oAnB...vN02',
                    createdAt: new Date().toISOString()
                  }]);
                }
              }}
              registryConnected={registryConnected}
              onToggleRegistry={() => {
                // Mock toggle of docker hub credentials
                const exists = secrets.some(s => s.type === 'registry_credential');
                if (exists) {
                  setSecrets(prev => prev.filter(s => s.type !== 'registry_credential'));
                } else {
                  setSecrets(prev => [...prev, {
                    id: 'sec-reg-mock',
                    name: 'dockerhub-onboarding-token',
                    type: 'registry_credential',
                    identifier: 'docker.io',
                    hint: 'dckr_****cd34',
                    createdAt: new Date().toISOString()
                  }]);
                }
              }}
            />
          )}
        </div>

      </main>

      {/* Slide-out Panel Wizard Trigger Drawer */}
      <Wizard 
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmitBuild={handleAddNewBuild}
        vaultSecrets={secrets}
      />

    </div>
  );
}

// Helpers for dynamic mock logs synthesis
function getTimestampStr() {
  const d = new Date();
  return `${d.toLocaleTimeString([], { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

function getLanguageCompileStatements(build: ActiveBuild) {
  if (build.techStack.language === 'Node.js') {
    return [
      { line: 'Fetching compiler sandbox configuration...', type: 'info' },
      { line: 'Injected environment variables - NODE_ENV=production', type: 'info' },
      { line: 'npm ci --prefer-offline --no-audit', type: 'command' },
      { line: 'added 384 packages, and audited 385 packages in 8s', type: 'info' },
      { line: 'Evaluating workspace dependencies check... TypeScript 5.4 found.', type: 'info' },
      { line: 'npm run build', type: 'command' },
      { line: 'vite v5.2.10 building for production...', type: 'info' },
      { line: '✓ 48 modules transformed.', type: 'info' },
      { line: 'dist/assets/index-B72u1a.js   142.50 kB │ gzip: 44.11 kB', type: 'info' },
      { line: 'dist/assets/index-C89c4a.css    12.10 kB │ gzip:  3.12 kB', type: 'info' },
      { line: '✓ built in 3.12s', type: 'success' },
      { line: 'Preparing Kaniko OCI context for image generation...', type: 'info' },
      { line: 'Found compliant multi-stage Dockerfile in root folder.', type: 'success' },
      { line: 'Executing Kaniko: /kaniko/executor --context=dir:///workspace/shared-workspace --dockerfile=Dockerfile --destination=docker.io/...', type: 'command' }
    ];
  }
  
  if (build.techStack.language === 'Python') {
    return [
      { line: 'Fetching compiler sandbox configuration...', type: 'info' },
      { line: 'Injected environment variables - PYTHONUNBUFFERED=1', type: 'info' },
      { line: 'pip install -r requirements.txt --target=/workspace/dependencies', type: 'command' },
      { line: 'Collecting fastapi (from -r requirements.txt)', type: 'info' },
      { line: 'Downloading fastapi-0.110.0-py3-none-any.whl (92 kB)', type: 'info' },
      { line: 'Installing collected packages: fastapi, uvicorn, pydantic', type: 'info' },
      { line: 'Successfully installed requirements in 4.8s', type: 'success' },
      { line: 'python -m compileall ./src', type: 'command' },
      { line: 'Compiling ./src/main.py...', type: 'info' },
      { line: 'Compiling ./src/api/routes.py...', type: 'info' },
      { line: 'Preparing Kaniko OCI context for image generation...', type: 'info' },
      { line: 'Found compliant Dockerfile using python:3.10-slim.', type: 'success' },
      { line: 'Executing Kaniko: /kaniko/executor --context=dir:///workspace/shared-workspace --dockerfile=Dockerfile --destination=docker.io/...', type: 'command' }
    ];
  }

  // Java
  return [
    { line: 'Fetching Maven SDK configurations...', type: 'info' },
    { line: 'Using JDK 17.0.8 Temurin distribution compiler.', type: 'info' },
    { line: 'mvn clean package -DskipTests', type: 'command' },
    { line: '[INFO] Scanning for projects...', type: 'info' },
    { line: '[INFO] Building spring-boot-app 0.0.1-SNAPSHOT', type: 'info' },
    { line: '[INFO] --- maven-compiler-plugin:3.8.1:compile (default-compile) ---', type: 'info' },
    { line: '[INFO] Changes detected - recompiling the module!', type: 'info' },
    { line: '[INFO] Compiling 24 source files to /workspace/shared-workspace/target/classes', type: 'info' },
    { line: '[INFO] Packaging jar: /workspace/shared-workspace/target/spring-boot-app.jar', type: 'success' },
    { line: '[INFO] BUILD SUCCESS', type: 'success' },
    { line: 'Preparing OCI context configuration...', type: 'info' },
    { line: 'Executing Kaniko compiler over spring target layer jar file...', type: 'command' }
  ];
}

function generateStaticMockLogs(
  buildId: string, 
  language: string, 
  version: string, 
  branch: string, 
  commitSha: string, 
  dockerUrl: string,
  isFailed: boolean
): LogLine[] {
  const timestamp = '17:42:01.120';
  const logs: LogLine[] = [
    { id: `${buildId}-0`, timestamp, line: 'TEKTON PIPELINE RUN INITIATED - namespace: devflow-cd-execution', type: 'info' },
    { id: `${buildId}-1`, timestamp, line: `Decrypted credentials via Supabase Vault utilizing pgsodium integration.`, type: 'info' },
    { id: `${buildId}-2`, timestamp, line: `git clone https://github.com/siddharta02/repo --branch ${branch}`, type: 'command' },
    { id: `${buildId}-3`, timestamp, line: `Cloning into &apos;/workspace/shared-workspace&apos;...`, type: 'info' },
    { id: `${buildId}-4`, timestamp, line: `HEAD is now at ${commitSha} Merge branch &apos;main&apos;`, type: 'success' },
  ];

  if (language === 'Node.js') {
    logs.push(
      { id: `${buildId}-5`, timestamp, line: 'node --version', type: 'command' },
      { id: `${buildId}-6`, timestamp, line: `v${version}.2.0`, type: 'info' },
      { id: `${buildId}-7`, timestamp, line: 'npm ci && npm run build', type: 'command' },
      { id: `${buildId}-8`, timestamp, line: 'added 148 packages in 4.22s', type: 'info' },
      { id: `${buildId}-9`, timestamp, line: 'dist compiled successfully', type: 'success' }
    );
  } else {
    logs.push(
      { id: `${buildId}-5`, timestamp, line: 'python --version', type: 'command' },
      { id: `${buildId}-6`, timestamp, line: `Python ${version}`, type: 'info' },
      { id: `${buildId}-7`, timestamp, line: 'pip install -r requirements.txt', type: 'command' }
    );
    if (isFailed) {
      logs.push(
        { id: `${buildId}-8`, timestamp, line: 'ERROR: Could not find a version that satisfies the requirement fastapi>=9.9.9 (from requirements.txt)', type: 'error' },
        { id: `${buildId}-9`, timestamp, line: 'PipelineRun unsuccessful: error building source dependency trees', type: 'error' }
      );
      return logs;
    } else {
      logs.push(
        { id: `${buildId}-8`, timestamp, line: 'requirements installed', type: 'success' }
      );
    }
  }

  logs.push(
    { id: `${buildId}-10`, timestamp, line: 'Executing Kaniko compiler on unprivileged sandbox', type: 'info' },
    { id: `${buildId}-11`, timestamp, line: `Preparing layers to target: ${dockerUrl}`, type: 'command' },
    { id: `${buildId}-12`, timestamp, line: 'Pushing image layers to Docker Registry...', type: 'info' },
    { id: `${buildId}-13`, timestamp, line: `Successfully tagged image: ${dockerUrl}`, type: 'success' },
    { id: `${buildId}-14`, timestamp, line: 'PipelineRun finished with execution code 0 (Success)', type: 'success' }
  );

  return logs;
}
