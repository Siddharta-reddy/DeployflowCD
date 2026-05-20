/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  GitBranch, 
  Cpu, 
  Lock, 
  Database, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  FileCode2, 
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { ActiveBuild } from '../types';

interface WizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBuild: (newBuild: ActiveBuild, pipelineRunPayload: any) => void;
  vaultSecrets: { id: string; name: string; type: string; hint: string }[];
}

export default function Wizard({ isOpen, onClose, onSubmitBuild, vaultSecrets }: WizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Connect Repo
  const [gitRepoUrl, setGitRepoUrl] = useState('https://github.com/siddharta02/node-microservice');
  const [gitBranch, setGitBranch] = useState('main');
  const [commitSha, setCommitSha] = useState('d3f9a71e845c926b429cd038a8e1b2f4c9a59b12');

  // Step 2: Tech Stack Details
  const [language, setLanguage] = useState('Node.js');
  const [version, setVersion] = useState('18');
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const [contextPath, setContextPath] = useState('./');
  const [buildTimeout, setBuildTimeout] = useState('15m');
  const [enableCache, setEnableCache] = useState(true);

  // Step 3: Secrets Authentication
  const [selectedGitSecret, setSelectedGitSecret] = useState('');
  const [selectedRegistrySecret, setSelectedRegistrySecret] = useState('');
  // Inline/Alternative raw input (if not referencing vault directly, but let's allow either selecting or creating)
  const [rawGitToken, setRawGitToken] = useState('ghp_****************************A1b2');
  const [rawRegistryPass, setRawRegistryPass] = useState('dckr_pat_**************************cd34');

  // Step 4: Image Destination
  const [imagePath, setImagePath] = useState('docker.io/siddhartareddy/node-api-service');
  const [versionTag, setVersionTag] = useState('v1.0.0');

  // Tekton JSON Payload preview
  const [generatedPayload, setGeneratedPayload] = useState<any>(null);

  // Automatically update selected secrets or raw tokens
  useEffect(() => {
    const gitSec = vaultSecrets.find(s => s.type === 'git_token');
    if (gitSec && !selectedGitSecret) {
      setSelectedGitSecret(gitSec.id);
    }
    const regSec = vaultSecrets.find(s => s.type === 'registry_credential');
    if (regSec && !selectedRegistrySecret) {
      setSelectedRegistrySecret(regSec.id);
    }
  }, [vaultSecrets, selectedGitSecret, selectedRegistrySecret]);

  // Generate the Tekton PipelineRun payload
  const buildName = `build-${language.toLowerCase().replace('.', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const generateTektonPayload = () => {
    return {
      apiVersion: 'tekton.dev/v1beta1',
      kind: 'PipelineRun',
      metadata: {
        name: buildName,
        namespace: 'devflow-cd-execution',
        labels: {
          'devflow.cd/pipeline': 'docker-build-push',
          'devflow.cd/repository': gitRepoUrl.split('/').pop() || 'repo',
          'devflow.cd/built-by': 'SiddhartaReddy',
        }
      },
      spec: {
        pipelineRef: {
          name: 'git-to-image-pipeline'
        },
        params: [
          { name: 'git-url', value: gitRepoUrl },
          { name: 'git-revision', value: gitBranch },
          { name: 'git-commit-sha', value: commitSha },
          { name: 'tech-stack-language', value: language },
          { name: 'tech-stack-version', value: version },
          { name: 'build-context-path', value: contextPath },
          { name: 'build-timeout', value: buildTimeout },
          { name: 'enable-build-cache', value: String(enableCache) },
          { name: 'image-destination', value: `${imagePath}:${versionTag}` },
          { 
            name: 'vault-git-secret-id', 
            value: selectedGitSecret || 'direct-token-ref' 
          },
          { 
            name: 'vault-registry-secret-id', 
            value: selectedRegistrySecret || 'direct-password-ref' 
          }
        ],
        workspaces: [
          {
            name: 'shared-workspace',
            volumeClaimTemplate: {
              spec: {
                accessModes: ['ReadWriteOnce'],
                resources: {
                  requests: {
                    storage: '2Gi'
                  }
                }
              }
            }
          },
          {
            name: 'docker-credentials',
            secret: {
              secretName: 'supabase-vault-credentials-proxy'
            }
          }
        ]
      }
    };
  };

  // Keep payload in sync with changes
  useEffect(() => {
    setGeneratedPayload(generateTektonPayload());
  }, [gitRepoUrl, gitBranch, commitSha, language, version, contextPath, buildTimeout, enableCache, imagePath, versionTag, selectedGitSecret, selectedRegistrySecret]);

  if (!isOpen) return null;

  const steps = [
    { title: 'Repo Details', desc: 'Git source' },
    { title: 'Tech Stack', desc: 'Compiler config' },
    { title: 'Registry Auth', desc: 'Encrypted Vault secrets' },
    { title: 'Destination', desc: 'Docker Target' }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the JSON Payload explicitly as required
    console.log('GEN_TEKTON_PIPELINERUN_PAYLOAD:', generatedPayload);

    // Create a new active build object
    const newBuild: ActiveBuild = {
      id: generateRandomId(),
      name: buildName,
      status: 'queued', // Starts as queued
      branch: gitBranch,
      commitSha: commitSha.substring(0, 7),
      dockerUrl: `${imagePath}:${versionTag}`,
      techStack: {
        language,
        version
      },
      createdAt: new Date().toISOString(),
      gitRepoUrl,
      registryUser: imagePath.split('/')[1] || 'siddhartareddy'
    };

    onSubmitBuild(newBuild, generatedPayload);
    onClose();
    // Reset steps
    setCurrentStep(1);
  };

  const generateRandomId = () => Math.random().toString(36).substring(2, 9);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="wizard-drawer-container">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col focus:outline-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-lg font-sans font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></span>
              Create Tekton PipelineRun
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Define declarative triggers to compile container images without raw YAML headaches</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Multi-Step Progress Tracker */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-b border-slate-800/80 flex justify-between items-center text-xs">
          {steps.map((s, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            return (
              <React.Fragment key={stepNum}>
                <div className="flex items-center gap-2 select-none">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    isCompleted 
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/50' 
                      : isActive 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? '✓' : stepNum}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`font-semibold ${isActive ? 'text-violet-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[90px]">{s.desc}</p>
                  </div>
                </div>
                {stepNum < 4 && (
                  <div className={`flex-1 h-px mx-2 ${currentStep > stepNum ? 'bg-violet-500/30' : 'bg-slate-800'}`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Wizard Content Panel */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: Connect Repo */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center gap-3">
                <Globe className="w-8 h-8 text-violet-400" />
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Git Integration</h4>
                  <p className="text-xs text-slate-400">Specify your remote Git Repository to pull code into the Tekton agent.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Git URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">URL:</span>
                  <input 
                    type="url" 
                    required
                    value={gitRepoUrl}
                    onChange={(e) => setGitRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full pl-12 pr-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">E.g., public or private GitHub repository</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Branch</label>
                  <div className="relative">
                    <GitBranch className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={gitBranch}
                      onChange={(e) => setGitBranch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition appearance-none"
                    >
                      <option value="main">main</option>
                      <option value="master">master</option>
                      <option value="dev">dev</option>
                      <option value="preview">preview</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Commit SHA</label>
                  <input 
                    type="text" 
                    required
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    placeholder="Commit hex SHA"
                    className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tech Stack Selection */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-violet-400 animate-spin-slow" />
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Tech Stack MVP Selection</h4>
                  <p className="text-xs text-slate-400">We dynamically pair base builder images with Tekton task templates.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      if (e.target.value === 'Node.js') setVersion('18');
                      else if (e.target.value === 'Python') setVersion('3.10');
                      else if (e.target.value === 'Java') setVersion('17');
                    }}
                    className="w-full px-3 py-2 bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  >
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Target Version</label>
                  <select 
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  >
                    {language === 'Node.js' && (
                      <>
                        <option value="18">Node.js 18 (LTS)</option>
                        <option value="20">Node.js 20</option>
                        <option value="16">Node.js 16 (Deprecated)</option>
                      </>
                    )}
                    {language === 'Python' && (
                      <>
                        <option value="3.10">Python 3.10 (Standard)</option>
                        <option value="3.11">Python 3.11</option>
                        <option value="3.9">Python 3.9</option>
                      </>
                    )}
                    {language === 'Java' && (
                      <>
                        <option value="17">Java 17 (Temurin LTS)</option>
                        <option value="11">Java 11</option>
                        <option value="21">Java 21</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setAdvancedSettings(!advancedSettings)}
                  className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 focus:outline-hidden"
                >
                  <span>{advancedSettings ? 'Hide' : 'Show'} Advanced Build Settings</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-sm">Toggle</span>
                </button>

                {advancedSettings && (
                  <div className="mt-4 p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 space-y-4 animate-slideDown">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">Context Directory</label>
                        <input 
                          type="text" 
                          value={contextPath} 
                          onChange={(e) => setContextPath(e.target.value)} 
                          className="w-full px-3 py-1.5 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">Build Timeout</label>
                        <input 
                          type="text" 
                          value={buildTimeout} 
                          onChange={(e) => setBuildTimeout(e.target.value)} 
                          className="w-full px-3 py-1.5 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md" 
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-300">Enable Tekton Build Caching</span>
                        <p className="text-[10px] text-slate-500">Speed up node_modules pip/maven dependencies caching</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={enableCache}
                        onChange={(e) => setEnableCache(e.target.checked)}
                        className="w-4 h-4 text-violet-600 bg-slate-950 border-slate-800 rounded-sm focus:ring-violet-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Registry Authentication */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-850 flex items-center gap-3">
                <Lock className="w-8 h-8 text-violet-400" />
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Supabase Vault (pgsodium) Encryption</h4>
                  <p className="text-xs text-slate-400">Sensitive variables are encrypted at the PostgreSQL physical row level. Cluster engines fetch credentials only on-the-fly during pipeline deployment runs.</p>
                </div>
              </div>

              {/* Secure input fields representing Git token and registry password */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Git Access Token</label>
                    <span className="text-[10px] text-violet-400 bg-violet-950/45 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Supabase Vault Secured
                    </span>
                  </div>
                  {vaultSecrets.filter(s => s.type === 'git_token').length > 0 ? (
                    <select
                      value={selectedGitSecret}
                      onChange={(e) => setSelectedGitSecret(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                    >
                      {vaultSecrets.filter(s => s.type === 'git_token').map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name} ({sec.hint})</option>
                      ))}
                      <option value="">-- Use Custom Password Token --</option>
                    </select>
                  ) : (
                    <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-md border border-slate-850">No Git credentials declared in Vault. Using temporary inline mock token.</p>
                  )}

                  {(!selectedGitSecret || vaultSecrets.filter(s => s.type === 'git_token').length === 0) && (
                    <input 
                      type="password"
                      value={rawGitToken}
                      onChange={(e) => setRawGitToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-850 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Container Registry Password/Secret</label>
                    <span className="text-[10px] text-violet-400 bg-violet-950/45 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Supabase Vault Secured
                    </span>
                  </div>
                  {vaultSecrets.filter(s => s.type === 'registry_credential').length > 0 ? (
                    <select
                      value={selectedRegistrySecret}
                      onChange={(e) => setSelectedRegistrySecret(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                    >
                      {vaultSecrets.filter(s => s.type === 'registry_credential').map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name} ({sec.hint})</option>
                      ))}
                      <option value="">-- Use Custom Password Secret --</option>
                    </select>
                  ) : (
                    <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-md border border-slate-850">No registry credentials declared in Vault. Using temporary inline mock credential.</p>
                  )}

                  {(!selectedRegistrySecret || vaultSecrets.filter(s => s.type === 'registry_credential').length === 0) && (
                    <input 
                      type="password"
                      value={rawRegistryPass}
                      onChange={(e) => setRawRegistryPass(e.target.value)}
                      placeholder="Registry token or credentials"
                      className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-850 rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Image Destination */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-800 flex items-center gap-3">
                <Database className="w-8 h-8 text-violet-400" />
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Image Registry Targets</h4>
                  <p className="text-xs text-slate-400">We push the completed Docker image directly to this external repository path.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Docker Image Target Path</label>
                  <input 
                    type="text" 
                    required
                    value={imagePath}
                    onChange={(e) => setImagePath(e.target.value)}
                    placeholder="docker.io/myuser/my-app"
                    className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Tag</label>
                  <input 
                    type="text" 
                    required
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 rounded-md focus:outline-hidden focus:border-violet-600 transition"
                  />
                </div>
              </div>

              {/* Dev Note alerting Tekton generation */}
              <div className="p-3 bg-violet-950/30 border border-violet-800/40 rounded-lg flex gap-2.5 items-start">
                <AlertTriangle className="w-4.5 h-4.5 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-violet-300 leading-snug">
                  <p className="font-bold">Automated Container Verification</p>
                  <p className="mt-0.5">DevFlowCD will inject a standard Kubernetes health verification webhook post-compile to confirm repository credentials before tagging as production-ready.</p>
                </div>
              </div>

              {/* JSON preview accordion pane */}
              <div className="rounded-lg border border-slate-800/80 bg-slate-950 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 font-sans flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-violet-400" /> Dynamic Tekton PipelineRun Spec
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">JSON output format</span>
                </div>
                <pre className="p-4 text-[10px] font-mono text-violet-300 overflow-x-auto max-h-48 terminal-scrollbar">
                  {JSON.stringify(generatedPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </form>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-slate-800 ${
              currentStep === 1 
                ? 'text-slate-600 bg-transparent cursor-not-allowed' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800 transition'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-4 py-2 rounded-md text-xs font-semibold tracking-wide transition shadow-md hover:shadow-violet-600/20"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFormSubmit}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-md shadow-violet-600/30 font-sans"
            >
              <Terminal className="w-4 h-4" />
              Build Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
