/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Terminal, 
  Lock, 
  Settings, 
  Activity, 
  CloudRain,
  ShieldCheck,
  Disc,
  CircleDot
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  buildsCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, buildsCount }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'built-images' as TabType, label: 'Built Images', icon: Layers },
    { id: 'build-logs' as TabType, label: 'Build Logs', icon: Terminal, badge: buildsCount > 0 ? buildsCount : undefined },
    { id: 'secrets-vault' as TabType, label: 'Secrets Vault', icon: Lock },
    { id: 'settings' as TabType, label: 'Settings/Profile', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      {/* Brand & Identity */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 tracking-tight rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md hover:shadow-violet-500/20 transition-all">
          DF
        </div>
        <div>
          <h1 className="font-sans font-bold text-white text-base tracking-tight leading-none">DevFlowCD</h1>
          <span className="text-xs text-slate-500 font-mono tracking-wider">TEKTON CTRL PLANE</span>
        </div>
      </div>

      {/* Cluster Status Indicator */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-500 font-medium">Tekton Engine</span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Connected
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="truncate">k8s-cluster.devflow</span>
          <span className="text-slate-500 font-mono">v1.28.4</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-violet-600/15 text-violet-400 border border-violet-500/30'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full ${
                  isActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Vault pgsodium banner indicator */}
      <div className="p-4 mx-4 mb-4 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-violet-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-[11px] leading-snug">
          <p className="font-semibold text-slate-300">Supabase Vault Active</p>
          <p className="text-slate-500 mt-0.5">Secrets heavily encrypted with AES-256 via <span className="font-mono text-violet-400/90 font-bold">pgsodium</span> at rest.</p>
        </div>
      </div>

      {/* Connected User Identity Footprint */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs uppercase hover:bg-slate-705 transition-colors">
            SR
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-xs truncate">Siddharta Reddy</p>
            <p className="text-[10px] text-slate-500 truncate">siddhartareddy02@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
