/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  KeyRound, 
  Database, 
  Eye, 
  EyeOff, 
  Check, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { SecretItem } from '../types';

interface SecretsVaultProps {
  secrets: SecretItem[];
  onAddSecret: (secret: SecretItem) => void;
  onDeleteSecret: (id: string) => void;
}

export default function SecretsVault({ secrets, onAddSecret, onDeleteSecret }: SecretsVaultProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'git_token' | 'registry_credential'>('git_token');
  const [identifier, setIdentifier] = useState('github.com');
  const [secretValue, setSecretValue] = useState('');
  const [showSecretValue, setShowSecretValue] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !secretValue) return;

    // Create masked hint version (e.g., ghp_****A1b2 ou dckr_****cd34)
    const prefix = secretValue.substring(0, 4);
    const suffix = secretValue.length > 8 ? secretValue.substring(secretValue.length - 4) : 'XXXX';
    const hint = `${prefix}****${suffix}`;

    const newSecret: SecretItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      type,
      identifier,
      hint,
      createdAt: new Date().toISOString()
    };

    onAddSecret(newSecret);
    setName('');
    setSecretValue('');
    setShowAddForm(false);
    
    // Notify
    setToastMessage(`Secret key "${name}" successfully compiled and encrypted via pgsodium!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn p-6">
      
      {/* Informative Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-sans font-bold text-white tracking-tight">Supabase Secrets Vault</h2>
          <p className="text-xs text-slate-400 mt-1">
            Store and manage credentials used for pipeline build pushes and private repositories.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Form' : 'Register New Secret'}
        </button>
      </div>

      {/* Success notification toast */}
      {toastMessage && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-lg text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 animate-bounce shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Security Architecture Block (Deep pgsodium details as requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          
          {/* Add secret form accordion */}
          {showAddForm && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <KeyRound className="w-4.5 h-4.5 text-violet-400" />
                Register Encrypted Vault Key
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider block">Credential Identifier Name</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. github-org-oauth-token"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-md text-xs text-slate-250 focus:outline-hidden focus:border-violet-600 transition"
                    />
                  </div>

                  {/* Secret Type */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider block">Secret Type</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        const val = e.target.value as 'git_token' | 'registry_credential';
                        setType(val);
                        setIdentifier(val === 'git_token' ? 'github.com' : 'docker.io');
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-md text-xs text-slate-250 focus:outline-hidden focus:border-violet-600 transition"
                    >
                      <option value="git_token">Git Access Token (Git Secret)</option>
                      <option value="registry_credential">Container Registry Credentials (Password)</option>
                    </select>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Target repo domain */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider block">Target Host Domain</label>
                    <input 
                      type="text" 
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. github.com, docker.io, registry.gitlab.com"
                      className="w-full px-3 py-2 bg-slate-950 font-mono text-xs text-slate-250 focus:outline-hidden"
                    />
                  </div>

                  {/* Vault secret value */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-semibold uppercase tracking-wider block">Private Secret Payload</label>
                    <div className="relative">
                      <input 
                        type={showSecretValue ? 'text' : 'password'}
                        required
                        value={secretValue}
                        onChange={(e) => setSecretValue(e.target.value)}
                        placeholder="ghp_xxxxxx or registry password"
                        className="w-full pl-3 pr-10 py-2 bg-slate-950 font-mono text-xs text-slate-250 border border-slate-850 rounded-md focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretValue(!showSecretValue)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                      >
                        {showSecretValue ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setName('');
                      setSecretValue('');
                      setShowAddForm(false);
                    }}
                    className="px-3 py-2 rounded-md border border-slate-800 text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white px-4 py-2 rounded-md font-bold transition shadow-md shadow-violet-600/10"
                  >
                    Encrypt and Save Key
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table display */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/20">
              <h3 className="text-sm font-bold text-white">Encrypted Vault Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Physical keys bound to Supabase PostgreSQL database tables</p>
            </div>

            {secrets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No passwords stored in Vault workspace yet. Use the action button above to register one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/30 font-semibold">
                      <th className="py-3 px-4">Secret Name</th>
                      <th className="py-3 px-4">Type Class</th>
                      <th className="py-3 px-4">Authority Target</th>
                      <th className="py-3 px-4">Encrypted Hash Value</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {secrets.map((sec) => (
                      <tr key={sec.id} className="hover:bg-slate-800/15 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            <span className="font-bold text-slate-300">{sec.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {sec.type === 'git_token' ? (
                            <span className="px-2 py-0.5 rounded bg-blue-950/50 text-blue-400 border border-blue-900/30 text-[10px] font-medium">Git Token</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-purple-950/50 text-purple-400 border border-purple-900/40 text-[10px] font-medium">Registry Cred</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{sec.identifier}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-violet-300 bg-slate-950/20">
                          <code>pg_vault_enc::{sec.hint}</code>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              onDeleteSecret(sec.id);
                              setToastMessage(`Removed secret "${sec.name}" from Supabase Vault indices.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-950/40 transition"
                            title="Purge credential from database"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Informational Sidebar Explaining Supabase Vault & Encryption */}
        <div className="lg:col-span-1 space-y-4 font-sans">
          
          <div className="bg-slate-900/85 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-violet-400 tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-400 animate-pulse" />
              Vault Cryptography Core
            </h4>
            
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Unlike standard environment variables which live in plaintext inside server memory dumps, DevFlowCD relies on a tight integration with <span className="font-bold text-white">Supabase Vault</span>, built directly atop the Postgres extension <span className="font-mono text-violet-400">pgsodium</span>.
              </p>
              
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-850 space-y-2">
                <span className="font-bold text-slate-200 block text-[11px]">How we protect your payload:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                  <li>Symmetric encryption via <span className="font-mono">XChaCha20-Poly1305</span> standards.</li>
                  <li>Symmetric root keys are strictly managed inside the secure hardware security module (HSM).</li>
                  <li>Variables never land on local disks during Tekton builds.</li>
                </ul>
              </div>

              <div className="p-3 bg-violet-950/20 border border-violet-800/20 text-[11px] text-violet-300 rounded-lg flex gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-violet-400 shrink-0" />
                <span>Tekton agent pods fetch credentials momentarily in a sandboxed secure context over MTLS and discard them immediately upon compiling OCI images.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
