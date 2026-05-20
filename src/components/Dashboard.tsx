/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  HelpCircle, 
  GitBranch, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink,
  Hourglass,
  RefreshCw,
  Cpu,
  Layers,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { ActiveBuild } from '../types';

interface DashboardProps {
  builds: ActiveBuild[];
  onTriggerWizard: () => void;
  onSelectBuild: (build: ActiveBuild) => void;
  githubConnected: boolean;
  registryConnected: boolean;
}

export default function Dashboard({ 
  builds, 
  onTriggerWizard, 
  onSelectBuild,
  githubConnected,
  registryConnected
}: DashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Compute onboarding checklist progress
  const hasBuilds = builds.length > 0;
  
  // Calculate stats
  const totalBuilds = builds.length;
  const runningBuilds = builds.filter(b => b.status === 'running').length;
  const successBuilds = builds.filter(b => b.status === 'success').length;
  const failedBuilds = builds.filter(b => b.status === 'failed').length;

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">Active Builds Control Plane</h2>
          <p className="text-xs text-slate-400 mt-1">
            Declarative Kubernetes pod orchestration triggered through Tekton pipelines
          </p>
        </div>
        
        <button
          onClick={onTriggerWizard}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-violet-600/25 active:shadow-none transition-all duration-200 glow-btn cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Build
        </button>
      </div>

      {/* Onboarding Checklist Box (MVP First-time Users / Contextual Box) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 relative overflow-hidden elegant-glow">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> DevFlowCD Quick Start Guide
            </div>
            <h3 className="text-sm font-sans font-bold text-white">Let&apos;s deploy onto Kubernetes &amp; Tekton</h3>
            <p className="text-xs text-slate-400 mt-0.5">Follow these standard configurations to secure your cloud development pipeline.</p>
          </div>

          {/* Connected state horizontal list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-[65%]">
            
            {/* Step 1: Connect GitHub */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between h-24 transition-all duration-200 ${
              githubConnected 
                ? 'bg-violet-900/10 border-violet-500/30' 
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold">STEP 01</span>
                {githubConnected ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/50 rounded-xs">CONNECTED</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-950/40 rounded-xs">PENDING</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Connect GitHub</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Authorizes Git source token fetch</p>
              </div>
            </div>

            {/* Step 2: Add Registry Credentials */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between h-24 transition-all duration-200 ${
              registryConnected 
                ? 'bg-violet-900/10 border-violet-500/30' 
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold">STEP 02</span>
                {registryConnected ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/50 rounded-xs">CONNECTED</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-amber-400 bg-amber-950/40 rounded-xs">PENDING</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Add Registry Auth</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Encrypted via Supabase Vault</p>
              </div>
            </div>

            {/* Step 3: Build your first Docker Image */}
            <div className={`p-3 rounded-lg border flex flex-col justify-between h-24 transition-all duration-200 ${
              hasBuilds 
                ? 'bg-violet-900/10 border-violet-500/30 font-bold' 
                : 'bg-slate-950/40 border-slate-800/80'
            }`}>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-slate-500 font-bold">STEP 03</span>
                {hasBuilds ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-950/50 rounded-xs">DONE</span>
                ) : (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-950/80 rounded-xs">READY</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Build Docker Image</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Push verified YAML manifests</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Cluster telemetry / Quick stats metrics widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-905 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Total Build Requests</span>
            <Layers className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-1.5">{totalBuilds}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Tekton PipelineRuns triggered</p>
        </div>

        <div className="bg-slate-905 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Executing Now</span>
            <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
          </div>
          <p className="text-xl font-mono font-bold text-violet-400 mt-1.5">{runningBuilds}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pod workers active</p>
        </div>

        <div className="bg-slate-905 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Compiled Images</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-1.5">{successBuilds}</p>
          <p className="text-[10px] text-emerald-500 font-mono mt-0.5">{successBuilds}/{totalBuilds} successful builds</p>
        </div>

        <div className="bg-slate-905 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
            <span>Scylla-Vitals Check</span>
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-1.5">99.8%</p>
          <p className="text-[10px] text-emerald-500 mt-0.5">Kubernetes node resource OK</p>
        </div>
      </div>

      {/* Main builds table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-800/70 bg-slate-950/20 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
              <span>Dynamic Active Builds Plane</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 rounded-xs text-slate-400">
                {builds.length} total
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Real-time compilation states registered on the Tekton side</p>
          </div>
          {builds.length > 0 && (
            <span className="text-slate-500 text-xs font-mono">Auto-refreshes on cluster ticks</span>
          )}
        </div>

        {/* Dynamic empty/populated state check */}
        {!hasBuilds ? (
          <div className="p-16 text-center" id="dashboard-empty-state">
            <div className="w-14 h-14 bg-slate-800/40 border border-slate-700/60 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hourglass className="w-6 h-6 text-slate-500 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-white">No active builds registered yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
              Get started by defining custom compilation coordinates. DevFlowCD compiles sources using sandboxed k8s pods.
            </p>
            <button
              onClick={onTriggerWizard}
              className="mt-5 inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-md transition shadow-md shadow-violet-600/10"
            >
              <Plus className="w-4 h-4" /> Assemble First Pipeline
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto" id="dashboard-populated-state">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40 font-semibold">
                  <th className="py-3.5 px-5">Build Target Name</th>
                  <th className="py-3.5 px-4">Compile Pipeline Status</th>
                  <th className="py-3.5 px-4">Source Config</th>
                  <th className="py-3.5 px-4">Resulting Docker Image URL (Vault Secret Key)</th>
                  <th className="py-3.5 px-4">Created Time</th>
                  <th className="py-3.5 px-5 text-right">Cluster Pipeline Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-350">
                {builds.map((build) => {
                  return (
                    <tr 
                      key={build.id}
                      onClick={() => onSelectBuild(build)}
                      className="group hover:bg-slate-800/30 cursor-pointer transition-colors duration-150"
                    >
                      {/* Name / Technology */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                          <div>
                            <p className="font-bold text-slate-200 group-hover:text-violet-400 transition-colors">{build.name}</p>
                            <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                              Language: <span className="text-slate-400">{build.techStack.language} v{build.techStack.version}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {build.status === 'queued' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 text-slate-400 font-semibold text-[11px] border border-slate-700/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></span>
                            Queued
                          </span>
                        )}
                        {build.status === 'running' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-violet-900/15 text-violet-400 font-semibold text-[11px] border border-violet-500/30">
                            <RefreshCw className="w-3 h-3 animate-spin text-violet-400" />
                            Compiling...
                          </span>
                        )}
                        {build.status === 'success' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/40 text-emerald-400 font-semibold text-[11px] border border-emerald-800/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Success
                          </span>
                        )}
                        {build.status === 'failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/40 text-rose-400 font-semibold text-[11px] border border-rose-800/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Branch & Commit */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-[11px] space-y-0.5">
                          <span className="text-slate-200 flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-slate-500" /> {build.branch}
                          </span>
                          <span className="text-slate-500 block">SHA: {build.commitSha}</span>
                        </div>
                      </td>

                      {/* Docker Image Target path */}
                      <td className="py-4 px-4 font-mono max-w-xs">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="bg-slate-950 px-2 py-1 rounded text-violet-300 border border-slate-850 truncate select-all">
                            {build.dockerUrl}
                          </span>
                          <button
                            onClick={(e) => handleCopy(e, build.dockerUrl, build.id)}
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-850"
                            title="Copy image target URL"
                          >
                            {copiedId === build.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(build.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="text-[10px] text-slate-500 block italic">Today</span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectBuild(build)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 hover:text-violet-400 hover:border-violet-600 transition duration-150"
                        >
                          <Terminal className="w-3.5 h-3.5 text-slate-500" />
                          View Logs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
