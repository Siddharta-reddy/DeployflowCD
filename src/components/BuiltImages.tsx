/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ShieldAlert, 
  Layers, 
  Download, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { ActiveBuild } from '../types';

interface BuiltImagesProps {
  builds: ActiveBuild[];
}

export default function BuiltImages({ builds }: BuiltImagesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const successBuilds = builds.filter(b => b.status === 'success');

  const handleCopyCmd = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 1500);
  };

  // Mock technical image data generated from Tekton task specs
  const mockImageSizing = [
    { size: '84.2 MB', compressed: '32.1 MB', layers: 8, arch: 'linux/amd64', scan: '0 Critical, 2 Medium' },
    { size: '142.5 MB', compressed: '54.8 MB', layers: 12, arch: 'linux/amd64', scan: '0 Critical, 0 Medium' },
    { size: '210.1 MB', compressed: '88.3 MB', layers: 15, arch: 'linux/amd64', scan: '1 Critical, 5 High' }
  ];

  const filteredImages = successBuilds.filter(b => 
    b.dockerUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.techStack.language.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      
      {/* Title block */}
      <div>
        <h2 className="text-xl font-sans font-bold text-white tracking-tight">Compiled Container Registries</h2>
        <p className="text-xs text-slate-400 mt-1">
          Historical repository catalog of built container layers successfully pushed to Docker targets.
        </p>
      </div>

      {/* Query Search / Filter layout */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Filter images by URL pattern or runtime..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-violet-600 font-sans transition"
          />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 font-sans text-xs text-slate-400 rounded-lg hover:text-white transition">
          <Filter className="w-3.5 h-3.5" />
          Filter: All registries
        </button>
      </div>

      {successBuilds.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/25 border border-slate-800 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-5 h-5 text-slate-500" />
          </div>
          <h4 className="text-sm font-bold text-white">No compiled image targets in registry</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal">
            Verify Git parameters and successfully run a Tekton `PipelineRun` compilation to populate this registry catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredImages.map((build, index) => {
            const dataIndex = index % mockImageSizing.length;
            const techData = mockImageSizing[dataIndex];
            const pullToken = `docker pull ${build.dockerUrl}`;

            return (
              <div 
                key={build.id}
                className="bg-slate-900/40 border border-slate-800 hover:border-violet-600/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition duration-200"
              >
                
                {/* Meta details */}
                <div className="space-y-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono bg-violet-950/40 border border-violet-800/40 text-violet-300 px-2 py-0.5 rounded-sm">
                      #{build.name}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2 py-0.5 rounded-sm">
                      Tag: {build.dockerUrl.split(':').pop() || 'latest'}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs text-white break-all select-all font-semibold bg-slate-950/60 p-2 rounded-md border border-slate-850">
                      {build.dockerUrl}
                    </h3>
                  </div>

                  {/* Grid attributes info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <div>
                      <span className="text-slate-500 block">Virtual Size:</span>
                      <span className="text-slate-250 font-medium">{techData.size}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Compressed:</span>
                      <span className="text-slate-252 font-medium">{techData.compressed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">No. of Layers:</span>
                      <span className="text-slate-254 font-medium">{techData.layers} levels</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Arch Node:</span>
                      <span className="text-slate-256 font-medium">{techData.arch}</span>
                    </div>
                  </div>
                </div>

                {/* Pull block command */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-2.5">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                    <span className="text-[10px] font-sans font-semibold text-slate-500 block mb-1 uppercase tracking-wider">PULL SYNTAX</span>
                    <div className="flex items-center gap-2 justify-between">
                      <code className="text-xs font-mono text-emerald-400 select-all shrink-0 max-w-[200px] truncate">{pullToken}</code>
                      <button
                        onClick={() => handleCopyCmd(pullToken)}
                        className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                        title="Copy command"
                      >
                        {copiedUrl === pullToken ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Security scanner details */}
                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono text-rose-400/90">
                      <ShieldAlert className="w-3.5 h-3.5" /> Checked CVE scan
                    </span>
                    <span className="text-slate-400 font-mono font-medium">{techData.scan}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
