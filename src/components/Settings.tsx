/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Database, 
  Map, 
  Check, 
  CloudRain, 
  HelpCircle,
  AlertTriangle,
  Github,
  CloudLightning,
  Activity
} from 'lucide-react';

interface SettingsProps {
  githubConnected: boolean;
  onToggleGithub: () => void;
  registryConnected: boolean;
  onToggleRegistry: () => void;
}

export default function SettingsView({ 
  githubConnected, 
  onToggleGithub, 
  registryConnected, 
  onToggleRegistry 
}: SettingsProps) {
  const [namespace, setNamespace] = useState('devflow-cd-execution');
  const [clusterNode, setClusterNode] = useState('k8s-cluster.devflow.io');
  const [webhookUrl, setWebhookUrl] = useState('https://ais-dev-gdndoxayc7cbdppje2dqi7.asia-east1.run.app/api/tekton-hooks');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn p-6 max-w-4xl">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-sans font-bold text-white tracking-tight">Control Plane &amp; Profile Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure physical Kubernetes orchestrations and manage developer credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        
        {/* Left Side: Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-violet-605 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            
            <div className="w-16 h-16 rounded-full bg-violet-600/10 border-2 border-violet-500/20 flex items-center justify-center mx-auto mt-2 mb-3.5">
              <User className="w-8 h-8 text-violet-400" />
            </div>

            <h3 className="text-sm font-bold text-white">Siddharta Reddy</h3>
            <p className="text-[11px] text-slate-400">siddhartareddy02@gmail.com</p>
            <p className="text-[10px] text-slate-550 mt-1 uppercase tracking-wider font-mono">WORKSPACE ROLE: ADMIN</p>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-left space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-450">
                <span>Account Tier</span>
                <span className="text-violet-400 font-bold uppercase tracking-wide">Developer Pro</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>Billing Cycle</span>
                <span className="text-slate-200">Standard</span>
              </div>
              <div className="flex justify-between text-slate-450">
                <span>Orgs Connected</span>
                <span className="text-slate-200">2 GitHub, 1 Docker</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-905 border border-slate-805 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wide flex items-center gap-1.5">
              <CloudLightning className="w-4 h-4 text-violet-400" /> Integration Actions
            </h4>

            {/* GitHub Oauth mock toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">GitHub Workspace:</span>
                <span className={`font-semibold text-[10px] ${githubConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {githubConnected ? 'OAuth Active' : 'Disconnected'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleGithub}
                className={`w-full py-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1 transition ${
                  githubConnected 
                    ? 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-xs'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                {githubConnected ? 'Disconnect Github OAuth' : 'Authorize GitHub via Supabase'}
              </button>
            </div>

            {/* Docker auth toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Container Registry Key:</span>
                <span className={`font-semibold text-[10px] ${registryConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {registryConnected ? 'Active' : 'Unconfigured'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleRegistry}
                className={`w-full py-1.5 rounded-md text-[11px] font-semibold transition ${
                  registryConnected 
                    ? 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800' 
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                }`}
              >
                {registryConnected ? 'Clear Docker Secret Key' : 'Configure Docker Host Secret'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Cluster Form settings */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-violet-400" />
              Physical Cluster Orchestration Targets
            </h3>

            {isSaved && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-md text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Credentials and targets updated!
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Kubernetes Execution Namespace</label>
                <input 
                  type="text" 
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850  rounded-md font-mono text-xs text-slate-200 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-505 italic">Pod execution scheduler target domain</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Tekton Engine K8s Master Host Node</label>
                <input 
                  type="text" 
                  value={clusterNode}
                  onChange={(e) => setClusterNode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-md font-mono text-xs text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold uppercase tracking-wider">Supabase Edge Pipeline Webhook Trigger URL</label>
                <input 
                  type="url" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-md font-mono text-xs text-slate-200 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-violet-950/20 border border-violet-800/20 text-[11px] text-violet-300 rounded-lg flex gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-violet-400 shrink-0 mt-0.5" />
                <span>Modifying webhook settings triggers cluster credentials recycling. Unsaved changes might restrict Tekton executor deployment pipelines!</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider transition shadow-md shadow-violet-600/10"
              >
                Save Settings Configuration
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
