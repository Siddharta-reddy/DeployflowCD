/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  TerminalSquare, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Search, 
  ArrowRight,
  GitCommit, 
  Clock, 
  HelpCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { ActiveBuild, LogLine } from '../types';

interface BuildLogsProps {
  builds: ActiveBuild[];
  selectedBuild: ActiveBuild | null;
  onSelectBuild: (build: ActiveBuild | null) => void;
  logLines: Record<string, LogLine[]>; // cache
  onAddLogLine: (buildId: string, line: LogLine) => void;
}

export default function BuildLogs({ 
  builds, 
  selectedBuild, 
  onSelectBuild,
  logLines,
  onAddLogLine
}: BuildLogsProps) {
  const [activeStepTab, setActiveStepTab] = useState('kaniko-compile');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Focus bottom of terminal on logs update
  useEffect(() => {
    if (isAutoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logLines, selectedBuild, activeStepTab, isAutoScroll]);

  // Tekton standard pipeline steps
  const tektonSteps = [
    { id: 'git-clone', title: '1. git-clone', desc: 'Pull repository sources' },
    { id: 'setup-environment', title: '2. setup-environment', desc: 'Secure secrets assembly' },
    { id: 'kaniko-compile', title: '3. kaniko-compile', desc: 'Unprivileged OCI build' },
    { id: 'registry-push', title: '4. registry-push', desc: 'Secure signature tags' }
  ];

  // Helper to format logs for different tasks
  const getLogsForStep = (buildId: string, stepId: string): LogLine[] => {
    const list = logLines[buildId] || [];
    // Filter lines based on matching keyword for steps or return subset
    if (stepId === 'git-clone') {
      return list.filter(l => l.line.includes('git') || l.line.includes('Clone') || l.line.includes('git-clone') || l.line.includes('Revision'));
    }
    if (stepId === 'setup-environment') {
      return list.filter(l => l.line.includes('Vault') || l.line.includes('secret') || l.line.includes('pgsodium') || l.line.includes('Node') || l.line.includes('Python') || l.line.includes('Java') || l.line.includes('SDK'));
    }
    if (stepId === 'kaniko-compile') {
      return list.filter(l => !l.line.includes('git') && !l.line.includes('Vault') && !l.line.includes('Pushing') && !l.line.includes('successfully') && !l.line.includes('tag'));
    }
    if (stepId === 'registry-push') {
      return list.filter(l => l.line.includes('Pushing') || l.line.includes('successfully') || l.line.includes('tag') || l.line.includes('digest') || l.line.includes('index') || l.line.includes('URL'));
    }
    return list;
  };

  const activeLines = selectedBuild ? getLogsForStep(selectedBuild.id, activeStepTab) : [];

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      
      {/* Upper select and controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">Tekton Terminal logs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Raw stdout streaming from custom sandboxed Kubernetes pod runtimes orchestrating the build.
          </p>
        </div>

        {/* Build selector dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-sans shrink-0">Focus Build:</span>
          <select
            value={selectedBuild?.id || ''}
            onChange={(e) => {
              const b = builds.find(x => x.id === e.target.value);
              onSelectBuild(b || null);
            }}
            className="bg-slate-905 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 w-full md:w-56 focus:outline-hidden focus:border-violet-600 font-mono"
          >
            <option value="">-- Select Active Build --</option>
            {builds.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.status.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main split work board */}
      {!selectedBuild ? (
        <div className="p-16 text-center bg-slate-900/40 border border-slate-800 rounded-xl" id="logs-empty-state">
          <TerminalSquare className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
          <h4 className="text-sm font-bold text-white">No build run selected</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
            To query standard stdout pipeline logs, click on a pipeline row on the Dashboard or select an option from the dropdown selector above.
          </p>
          {builds.length > 0 && (
            <div className="mt-5 flex justify-center gap-2">
              <button
                onClick={() => onSelectBuild(builds[0])}
                className="bg-slate-950 border border-slate-800 hover:border-violet-600 hover:text-white transition rounded px-3 py-1.5 text-xs text-slate-300 flex items-center gap-1.5 font-sans"
              >
                Focus Most Recent Run: <span className="font-mono text-violet-400">{builds[0].name}</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 tracking-tight font-sans">
          
          {/* Sidebar Step selection */}
          <div className="lg:col-span-1 space-y-3.5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3.5 space-y-3 shadow-xs">
              <h4 className="text-xs uppercase text-slate-500 font-bold tracking-wider">TEKTON WORKSPACE PIPELINE</h4>
              
              <div className="space-y-2">
                {tektonSteps.map((step) => {
                  const isActive = activeStepTab === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepTab(step.id)}
                      className={`w-full text-left p-2.5 rounded-md border text-xs transition duration-150 flex flex-col gap-0.5 ${
                        isActive 
                          ? 'bg-violet-900/15 border-violet-500/35 text-violet-400 font-semibold' 
                          : 'bg-slate-950/40 border-slate-850/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span className="font-mono">{step.title}</span>
                      <span className="text-[10px] text-slate-550 truncate font-sans">{step.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Build parameters descriptor */}
            <div className="bg-slate-950/45 border border-slate-850 rounded-lg p-3.5 text-xs space-y-2.5">
              <h5 className="font-semibold text-slate-300">Run Configuration</h5>
              <div className="space-y-2 text-[11px] font-mono text-slate-450">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Language</span>
                  <span className="text-slate-300 font-semibold">{selectedBuild.techStack.language} {selectedBuild.techStack.version}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Branch</span>
                  <span className="text-slate-300">{selectedBuild.branch}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>Revision</span>
                  <span className="text-violet-400">{selectedBuild.commitSha}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Registry</span>
                  <span className="text-slate-300 truncate max-w-[120px]" title={selectedBuild.dockerUrl}>
                    {selectedBuild.dockerUrl.split('/')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal window viewport */}
          <div className="lg:col-span-3 flex flex-col rounded-xl border border-slate-850 shadow-2xl bg-slate-950 overflow-hidden min-h-[480px]">
            
            {/* Terminal Top bar */}
            <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-slate-850/80 select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-slate-500 font-mono text-xs mx-1">|</span>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  stdout - {selectedBuild.name} ({activeStepTab})
                </span>
              </div>

              {/* Console options */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoScroll(!isAutoScroll)}
                  className={`text-[11px] px-2 py-1 rounded transition border font-mono ${
                    isAutoScroll 
                      ? 'bg-violet-950/30 border-violet-500/30 text-violet-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-500'
                  }`}
                  title="Toggle automatic terminal scroll to bottom on new events"
                >
                  Auto-Scroll: {isAutoScroll ? 'ON' : 'OFF'}
                </button>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeLines.length} lines
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div 
              ref={terminalRef}
              className="flex-1 p-5 font-mono text-xs text-slate-300 overflow-y-auto max-h-[440px] terminal-scrollbar bg-slate-950 space-y-1"
              id="terminal-stdout-viewport"
            >
              {activeLines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-1 p-8">
                  <RefreshCw className="w-5 h-5 text-slate-700 animate-spin-slow" />
                  <p className="font-mono text-xs mt-2">Connecting state hook stream...</p>
                  <p className="text-[10px] text-slate-700 max-w-xs text-center mt-1">
                    No stdout logs emitted yet for step &apos;{activeStepTab}&apos; on {selectedBuild.name}.
                  </p>
                </div>
              ) : (
                activeLines.map((line) => {
                  let textStyle = 'text-slate-300';
                  if (line.type === 'success') textStyle = 'text-emerald-400';
                  if (line.type === 'error') textStyle = 'text-red-400 font-semibold';
                  if (line.type === 'warning') textStyle = 'text-amber-400';
                  if (line.type === 'command') textStyle = 'text-violet-400 font-semibold';

                  return (
                    <div key={line.id} className="leading-relaxed hover:bg-slate-905/60 px-1.5 py-0.5 rounded transition">
                      <span className="text-slate-600 mr-3.5 text-[10px] select-none">{line.timestamp}</span>
                      {line.type === 'command' && <span className="text-violet-500 mr-1.5 select-none">$</span>}
                      <span className={`break-words ${textStyle}`}>{line.line}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Terminal Status bar */}
            <div className="bg-slate-900/60 border-t border-slate-850 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
                Workpath: /workspace/shared-workspace
              </span>
              <span className="flex items-center gap-1">
                Status: 
                <span className={`font-semibold uppercase ${
                  selectedBuild.status === 'success' ? 'text-emerald-400' :
                  selectedBuild.status === 'running' ? 'text-violet-400 animate-pulse' :
                  selectedBuild.status === 'failed' ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {selectedBuild.status}
                </span>
              </span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
