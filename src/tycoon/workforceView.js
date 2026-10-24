/**
 * Workforce & Personnel Management View Engine (Pegawai)
 * Pure JavaScript • Ultra-Lightweight • Modern 2026 Executive UI
 * Provides:
 * - Sub-nav Tier Switcher & Department Filter (prevents cognitive overload)
 * - Ergonomic Card Mode (2-3 spacious responsive columns, zero cramped buttons)
 * - Compact Matrix Table Mode (ultra-hemat spreadsheet for pro players)
 * - Global Bulk Actions (Buka/Tutup Rekrutmen, Set Gaji Massal, Auto-fill)
 * - Executive Boardroom C-Suite Table & Candidate Pool Drawer
 */

import { getIcon } from './icons.js';
import { soundEngine } from './audioEngine.js';
import { formatCurrency, formatNumber } from './economy.js';
import {
  EXECUTIVE_ROLES,
  calculateCSuiteBonuses,
  calculateWorkforceStats,
  DEFAULT_WORKFORCE,
} from './csuite.js';
import { t } from './i18n.js';

export function renderWorkforceView(app, mainEl) {
  const s = app.state;
  if (!s.workforce) {
    s.workforce = JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
  }

  // Ensure view states exist
  if (!app.workforceActiveTier) app.workforceActiveTier = 'all';
  if (!app.workforceViewMode) app.workforceViewMode = 'grid';
  if (!app.workforceDeptFilter) app.workforceDeptFilter = 'all';
  if (app.isCandidateDrawerOpen === undefined) app.isCandidateDrawerOpen = false;

  const wfStats = calculateWorkforceStats(s.workforce, s.executives);
  const execBonuses = calculateCSuiteBonuses(s.executives);

  // Helper: check department match
  const matchesDept = (item) => {
    if (app.workforceDeptFilter === 'all') return true;
    const text = `${item.department || ''} ${item.branch || ''} ${item.title || ''}`.toLowerCase();
    switch (app.workforceDeptFilter) {
      case 'tech':
        return text.includes('teknologi') || text.includes('rekayasa') || text.includes('software') || text.includes('dev') || text.includes('coding');
      case 'fin':
        return text.includes('keuangan') || text.includes('treasury') || text.includes('akuntansi') || text.includes('quant') || text.includes('pajak');
      case 'mkt':
        return text.includes('pemasaran') || text.includes('brand') || text.includes('growth') || text.includes('media') || text.includes('penjualan');
      case 'ops':
        return text.includes('operasional') || text.includes('fasilitas') || text.includes('logistik') || text.includes('support');
      case 'hr':
        return text.includes('hrd') || text.includes('people') || text.includes('sumber daya') || text.includes('siber') || text.includes('hukum');
      default:
        return true;
    }
  };

  // Filtered lists
  const filteredManagers = s.workforce.managers.filter(matchesDept);
  const filteredSeniors = s.workforce.seniors.filter(matchesDept);
  const filteredJuniors = s.workforce.juniors.filter(matchesDept);

  // Calculate morale label
  const moraleScore = wfStats.averageMorale || 85;
  const moraleLabel = moraleScore >= 90 ? 'Sangat Tinggi (Puas)' : (moraleScore >= 75 ? 'Optimal & Stabil' : 'Perlu Perhatian');
  const moraleColor = moraleScore >= 90 ? 'text-emerald-400' : (moraleScore >= 75 ? 'text-cyan-400' : 'text-amber-400');

  mainEl.innerHTML = `
    <div class="space-y-3.5 max-w-[1720px] mx-auto select-none">
      
      <!-- 1. TOP COMMAND BAR & METRICS STRIP -->
      <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 shadow-sm flex flex-col gap-2.5">
        
        <!-- Header Title & Quick View Switcher -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              ${getIcon('users', 'w-4 h-4')}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-white tracking-tight">${t('wf_title', app.lang)}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ${wfStats.totalHeadcount} Pegawai
                </span>
              </div>
              <p class="text-[11px] text-slate-400">${t('wf_sub', app.lang)}</p>
            </div>
          </div>

          <!-- View Mode Switcher & Global Batch Buttons -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Mode Switcher -->
            <div class="inline-flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
              <button class="btn-wf-view px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${app.workforceViewMode === 'grid' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}" data-mode="grid" title="Tampilan Kartu Modern & Ergonomis">
                ${getIcon('layers', 'w-3.5 h-3.5')}
                <span>Kartu Modern</span>
              </button>
              <button class="btn-wf-view px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${app.workforceViewMode === 'table' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'text-slate-400 hover:text-white'}" data-mode="table" title="Tampilan Tabel Ringkas & Hemat Ruang">
                ${getIcon('sliders', 'w-3.5 h-3.5')}
                <span>Tabel Ringkas</span>
              </button>
            </div>

            <!-- Global Action Dropdown / Buttons -->
            <div class="hidden sm:inline-flex items-center gap-1.5 bg-slate-900/80 p-1 border border-slate-800 rounded-lg">
              <button class="btn-wf-open-all px-2 py-1 text-[11px] font-mono font-semibold text-emerald-300 hover:bg-emerald-500/20 rounded transition-all cursor-pointer" title="Buka perekrutan otomatis untuk seluruh divisi">
                ⚡ Buka Semua
              </button>
              <span class="text-slate-700">|</span>
              <button class="btn-wf-close-all px-2 py-1 text-[11px] font-mono font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-all cursor-pointer" title="Hentikan perekrutan di semua unit">
                🔒 Tutup Semua
              </button>
              <span class="text-slate-700">|</span>
              <button class="btn-wf-set-market px-2 py-1 text-[11px] font-mono font-semibold text-indigo-300 hover:bg-indigo-500/20 rounded transition-all cursor-pointer" title="Setel semua gaji ke Standar Pasar">
                💰 Gaji Pasar
              </button>
              <span class="text-slate-700">|</span>
              <button class="btn-wf-fill-max px-2 py-1 text-[11px] font-mono font-semibold text-amber-300 hover:bg-amber-500/20 rounded transition-all cursor-pointer" title="Isi seluruh kuota divisi hingga maksimal">
                🚀 Isi Maksimal
              </button>
            </div>
          </div>
        </div>

        <!-- KPI Metrics Grid (Compact & Informative) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <!-- Total Headcount -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-mono block">${t('wf_kpi_headcount', app.lang)}</span>
              <span class="text-sm font-bold text-white font-mono">${wfStats.totalHeadcount} <span class="text-slate-400 text-xs font-normal">Karyawan</span></span>
            </div>
            <div class="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
              ${getIcon('users', 'w-4 h-4')}
            </div>
          </div>

          <!-- Total Payroll -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-mono block">${t('wf_kpi_payroll', app.lang)}</span>
              <span class="text-sm font-bold text-amber-400 font-mono">${formatCurrency(wfStats.totalPayroll)}<span class="text-slate-400 text-xs font-normal">/bln</span></span>
            </div>
            <div class="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              ${getIcon('coins', 'w-4 h-4')}
            </div>
          </div>

          <!-- Morale Score -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-mono block">${t('wf_kpi_morale', app.lang)}</span>
              <span class="text-sm font-bold ${moraleColor} font-mono">${moraleScore}% <span class="text-slate-400 text-[10px] font-normal">• ${moraleLabel}</span></span>
            </div>
            <div class="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              ${getIcon('activity', 'w-4 h-4')}
            </div>
          </div>

          <!-- Open Recruitment Status -->
          <div class="bg-slate-900/90 border border-slate-800/90 rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-mono block">${t('wf_kpi_recruiting', app.lang)}</span>
              <span class="text-sm font-bold ${wfStats.openRecruitingCount > 0 ? 'text-emerald-400' : 'text-slate-400'} font-mono">
                ${wfStats.openRecruitingCount} <span class="text-slate-400 text-xs font-normal">Posisi Terbuka</span>
              </span>
            </div>
            <div class="p-1.5 rounded-md ${wfStats.openRecruitingCount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}">
              ${getIcon('userPlus', 'w-4 h-4')}
            </div>
          </div>
        </div>

        <!-- Corporate Synergy Output Ribbon -->
        <div class="pt-2 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2 rounded-lg">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="text-slate-300 font-semibold flex items-center gap-1">
              ${getIcon('sparkles', 'w-3 h-3 text-amber-400')}
              Sinergi Korporat:
            </span>
            <span class="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold">
              +${wfStats.totalTechBonus} Tech Points/bln
            </span>
            <span class="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold">
              +${(wfStats.totalRevenueMultiplierBonus * 100).toFixed(1)}% Revenue Margin
            </span>
            <span class="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-bold">
              -${wfStats.totalExpenseReductionPct}% Reduksi Beban
            </span>
          </div>
          <span class="text-[10px] text-slate-500 hidden sm:inline">Payroll & Simulasi Otomatis Real-time</span>
        </div>
      </div>

      <!-- 2. SUB-NAVIGATION: TIER TABS & DEPARTMENT FILTERS -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 bg-[#0B101D] border border-slate-800 rounded-xl p-2 shadow-sm">
        
        <!-- Primary Tier Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
          ${[
            { id: 'all', label: 'Semua Tingkat', count: wfStats.totalHeadcount },
            { id: 'csuite', label: '⭐ C-Suite Direksi', count: 5 },
            { id: 'managers', label: '👑 Kepala Divisi', count: s.workforce.managers.reduce((a, b) => a + (b.count || 0), 0) },
            { id: 'seniors', label: '⚡ Tenaga Ahli', count: s.workforce.seniors.reduce((a, b) => a + (b.count || 0), 0) },
            { id: 'juniors', label: '👥 Staf Pelaksana', count: s.workforce.juniors.reduce((a, b) => a + (b.count || 0), 0) },
          ].map(tier => {
            const isActive = app.workforceActiveTier === tier.id;
            return `
              <button class="btn-wf-tier px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isActive ? 'bg-purple-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'}" data-tier="${tier.id}">
                <span>${tier.label}</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono ${isActive ? 'bg-purple-800 text-purple-100' : 'bg-slate-800 text-slate-400'}">${tier.count}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Department Filter Chips -->
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <span class="text-[11px] text-slate-500 font-mono mr-1 hidden md:inline">Departemen:</span>
          ${[
            { id: 'all', label: 'Semua' },
            { id: 'tech', label: 'Teknologi' },
            { id: 'fin', label: 'Keuangan' },
            { id: 'mkt', label: 'Marketing' },
            { id: 'ops', label: 'Operasional' },
            { id: 'hr', label: 'SDM/Legal' },
          ].map(dept => {
            const isActive = app.workforceDeptFilter === dept.id;
            return `
              <button class="btn-wf-dept px-2 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-slate-800 text-amber-400 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-dept="${dept.id}">
                ${dept.label}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 3. TIER 1: BOARD OF DIRECTORS & C-SUITE (Shown if 'all' or 'csuite') -->
      ${(app.workforceActiveTier === 'all' || app.workforceActiveTier === 'csuite') ? `
        <div class="bg-[#0B101D] border border-amber-500/30 rounded-xl p-3.5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-amber-500/20">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold font-mono uppercase tracking-wider">
                ${t('wf_tier_1', app.lang)}
              </span>
              <span class="text-xs text-slate-300 font-medium">${t('wf_tier_1_sub', app.lang)}</span>
            </div>
            
            <button class="btn-toggle-cand-drawer px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${app.isCandidateDrawerOpen ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-900 text-amber-400 border border-amber-500/40 hover:bg-slate-800'}">
              ${getIcon('userPlus', 'w-3.5 h-3.5')}
              <span>${app.isCandidateDrawerOpen ? 'Tutup Bursa Kandidat' : 'Buka Bursa Kandidat Eksekutif'}</span>
            </button>
          </div>

          <!-- 5 Executive Seats Boardroom -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            ${['CEO', 'CTO', 'CFO', 'CMO', 'COO'].map(role => {
              const exec = s.executives[role];
              const roleMeta = EXECUTIVE_ROLES[role];
              return `
                <div class="bg-slate-900/90 border ${exec ? 'border-amber-500/30' : 'border-dashed border-slate-800'} rounded-xl p-3 flex flex-col justify-between gap-2.5 min-h-[200px] transition-all hover:border-amber-500/50">
                  <div>
                    <!-- Role Header -->
                    <div class="flex items-center justify-between mb-1.5">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-mono font-bold ${roleMeta.color}">${role}</span>
                        <span class="text-[10px] text-slate-400">(${roleMeta.title})</span>
                      </div>
                      ${getIcon(roleMeta.icon, `w-4 h-4 ${roleMeta.color}`)}
                    </div>

                    ${exec ? `
                      <div class="font-bold text-white text-xs truncate mb-1">${exec.name}</div>
                      ${exec.isPlayer ? `
                        <span class="inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                          Pendiri & Pemilik Saham
                        </span>
                      ` : `
                        <!-- Skill stats -->
                        <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 mb-2">
                          <div class="bg-slate-950/60 p-1 rounded border border-slate-800">
                            <span>Keahlian: </span><span class="text-white font-bold">${exec.specialty}%</span>
                          </div>
                          <div class="bg-slate-950/60 p-1 rounded border border-slate-800">
                            <span>Moral: </span><span class="text-emerald-400 font-bold">${exec.morale}%</span>
                          </div>
                        </div>
                        <div class="p-1.5 bg-slate-950/70 border border-slate-800/80 rounded-md text-[10px] text-slate-300 mb-2 leading-tight">
                          <span class="text-amber-400 font-semibold">${exec.trait}:</span> ${exec.traitDescription || 'Mendorong output bisnis'}
                        </div>
                      `}
                    ` : `
                      <div class="text-center py-6 text-slate-500 text-xs">
                        <div class="mb-1">${getIcon('userMinus', 'w-6 h-6 mx-auto text-slate-600')}</div>
                        <span>Kursi Belum Terisi</span>
                      </div>
                    `}
                  </div>

                  <!-- Footer / Actions -->
                  <div class="pt-2 border-t border-slate-800/80">
                    ${exec ? `
                      <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                        <span>Gaji:</span>
                        <span class="text-white font-bold">${formatCurrency(exec.salaryMonthly || 0)}/bln</span>
                      </div>
                      ${!exec.isPlayer ? `
                        <button class="btn-fire-exec w-full py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300 text-[10px] font-mono font-semibold transition-all cursor-pointer flex items-center justify-center gap-1" data-role="${role}">
                          ${getIcon('trash', 'w-3 h-3')}
                          <span>Berhentikan</span>
                        </button>
                      ` : `
                        <div class="text-center text-[10px] font-mono text-amber-400/80 py-0.5">Pemimpin Utama</div>
                      `}
                    ` : `
                      <button class="btn-toggle-cand-drawer w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1">
                        ${getIcon('userPlus', 'w-3 h-3')}
                        <span>Rekrut ${role}</span>
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Expandable Candidate Drawer -->
          ${app.isCandidateDrawerOpen ? `
            <div class="mt-4 pt-3.5 border-t border-amber-500/20 bg-slate-950/80 rounded-xl p-3">
              <div class="flex items-center justify-between mb-2.5">
                <div class="flex items-center gap-2">
                  ${getIcon('award', 'w-4 h-4 text-amber-400')}
                  <span class="text-xs font-bold text-white uppercase tracking-wider">Bursa Kandidat Eksekutif Siap Kontrak</span>
                </div>
                <span class="text-[11px] font-mono text-slate-400">${s.candidatePool.length} Profil Tersedia</span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                ${s.candidatePool.map(cand => {
                  const isHired = !!s.executives[cand.role];
                  return `
                    <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between gap-2 text-xs">
                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="font-bold text-white text-xs">${cand.name}</span>
                          <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">${cand.role}</span>
                        </div>
                        <div class="text-[11px] text-slate-400 mb-1.5 leading-tight">
                          <span class="text-amber-400 font-semibold">${cand.trait}:</span> ${cand.traitDescription}
                        </div>
                        <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950 p-1 rounded">
                          <span>Gaji: <strong class="text-white">${formatCurrency(cand.salaryMonthly)}/bln</strong></span>
                          <span>Ekuitas: <strong class="text-cyan-400">${cand.equityGrantedPct}%</strong></span>
                        </div>
                      </div>
                      <button class="btn-hire-cand w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isHired ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'}" data-id="${cand.id}" ${isHired ? 'disabled' : ''}>
                        ${getIcon('userPlus', 'w-3 h-3')}
                        <span>${isHired ? `Kursi ${cand.role} Terisi` : `Angkat sebagai ${cand.role}`}</span>
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- 4. OPERATIONAL TIERS (TINGKAT 2, 3, 4) -->
      ${renderOperationalTierSection(app, s, 'managers', 'TINGKAT 2: KEPALA DIVISI & DIREKTUR UNIT', 'Manajemen Menengah & Pengendali Operasi Unit', 'border-indigo-500/30', 'text-indigo-300', filteredManagers)}
      ${renderOperationalTierSection(app, s, 'seniors', 'TINGKAT 3: KARYAWAN SENIOR & TENAGA AHLI', 'Tenaga Spesialis, Arsitek Sistem & Mesin Pertumbuhan', 'border-teal-500/30', 'text-teal-300', filteredSeniors)}
      ${renderOperationalTierSection(app, s, 'juniors', 'TINGKAT 4: KARYAWAN JUNIOR & STAF PELAKSANA', 'Staf Operasional, Tim Pendukung & Tulang Punggung Harian', 'border-emerald-500/30', 'text-emerald-300', filteredJuniors)}

    </div>
  `;

  // Attach all workforce event listeners
  attachWorkforceEvents(app, mainEl);
}

/**
 * Renders an operational workforce tier (Managers, Seniors, or Juniors)
 * Automatically adapts between Ergonomic Card Mode and Compact Table Mode.
 */
function renderOperationalTierSection(app, s, tierKey, title, subtitle, borderColor, badgeColor, items) {
  if (app.workforceActiveTier !== 'all' && app.workforceActiveTier !== tierKey) {
    return '';
  }

  if (items.length === 0) {
    return '';
  }

  return `
    <div class="bg-[#0B101D] border ${borderColor} rounded-xl p-3.5 shadow-sm space-y-3">
      <!-- Section Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[10px] font-bold font-mono uppercase tracking-wider ${badgeColor}">
            ${title}
          </span>
          <span class="text-xs text-slate-300 font-medium">${subtitle}</span>
        </div>
        <div class="text-[11px] font-mono text-slate-400">
          ${items.length} Divisi Aktif
        </div>
      </div>

      <!-- Content according to View Mode -->
      ${app.workforceViewMode === 'grid' 
        ? renderTierCardGrid(app, tierKey, items)
        : renderTierTableView(app, tierKey, items)
      }
    </div>
  `;
}

/**
 * Ergonomic Card Mode: 2-3 spacious columns, zero cramped buttons
 */
function renderTierCardGrid(app, tierKey, items) {
  // Determine adaptive grid columns based on tier
  const colClass = tierKey === 'managers' 
    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
    : (tierKey === 'seniors' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4');

  return `
    <div class="grid ${colClass} gap-3">
      ${items.map(item => {
        const currentRate = item.salaryRates[item.salaryTier] || item.salaryRates.market;
        const subtotalMonthly = (item.count || 0) * currentRate;
        const fillPct = Math.min(100, Math.round(((item.count || 0) / item.maxCount) * 100));

        // Quick batch steps based on tier
        const batchStep = tierKey === 'managers' ? 1 : (tierKey === 'seniors' ? 5 : 20);

        return `
          <div class="bg-[#0E1424] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between gap-3 text-xs transition-all hover:border-slate-700 shadow-sm">
            <div>
              <!-- Header: Department Badge & Recruitment Switch -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-md ${item.badgeBg || 'bg-slate-800 text-slate-300'} font-bold">
                  ${item.department || item.branch}
                </span>

                <!-- Modern Recruitment Switch -->
                <button class="btn-toggle-recruiting inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all cursor-pointer ${item.isRecruiting ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-sm' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'}" data-tier="${tierKey}" data-id="${item.id}" title="Klik untuk mengaktifkan/menonaktifkan perekrutan otomatis tiap siklus">
                  <span class="w-2 h-2 rounded-full ${item.isRecruiting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}"></span>
                  <span>${item.isRecruiting ? 'REKRUT: AKTIF' : 'DITUTUP'}</span>
                </button>
              </div>

              <!-- Role Title & Icon -->
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div class="font-bold text-white text-xs leading-snug">${item.title}</div>
                ${getIcon(item.icon, `w-4 h-4 shrink-0 ${item.color || 'text-slate-400'}`)}
              </div>

              <!-- Synergy Perk Highlight -->
              <div class="p-1.5 rounded-md bg-slate-950/70 border border-slate-800/80 text-[10px] text-cyan-300 font-mono mb-2.5 leading-tight flex items-center gap-1.5">
                ${getIcon('zap', 'w-3 h-3 text-cyan-400 shrink-0')}
                <span>${item.bonusDesc}</span>
              </div>

              <!-- Stepper: Headcount Quota Control -->
              <div class="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2 mb-2">
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Jumlah Staf:</span>
                  <div class="flex items-center gap-1">
                    <span class="text-white font-bold text-sm tabular-nums">${item.count}</span>
                    <span class="text-slate-500">/ ${item.maxCount}</span>
                  </div>
                </div>

                <!-- Stepper Buttons & Quick Batch -->
                <div class="flex items-center gap-1.5">
                  <button class="btn-adjust-quota h-7 w-7 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed" data-tier="${tierKey}" data-id="${item.id}" data-delta="-1" ${item.count <= 0 ? 'disabled' : ''} title="Kurangi 1 staf">
                    -
                  </button>

                  <div class="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                    <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300" style="width: ${fillPct}%"></div>
                  </div>

                  <button class="btn-adjust-quota h-7 w-7 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed" data-tier="${tierKey}" data-id="${item.id}" data-delta="1" ${item.count >= item.maxCount ? 'disabled' : ''} title="Tambah 1 staf">
                    +
                  </button>

                  <!-- Batch Pill -->
                  <button class="btn-adjust-quota h-7 px-2 rounded-md bg-slate-800 hover:bg-purple-900/60 border border-slate-700 hover:border-purple-500/50 text-slate-300 hover:text-purple-200 text-[10px] font-mono font-bold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" data-tier="${tierKey}" data-id="${item.id}" data-delta="${batchStep}" ${item.count + batchStep > item.maxCount ? 'disabled' : ''} title="Tambah ${batchStep} staf sekaligus">
                    +${batchStep}
                  </button>
                </div>
              </div>

              <!-- Salary Tier Selection (Segmented Control) -->
              <div class="bg-slate-950/80 border border-slate-800/90 rounded-lg p-2">
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>Standar Gaji:</span>
                  <span class="text-white font-bold">${formatCurrency(currentRate)}/bln</span>
                </div>
                <div class="grid grid-cols-3 gap-1">
                  ${['budget', 'market', 'elite'].map(tier => {
                    const isSelected = item.salaryTier === tier;
                    const tierRate = item.salaryRates[tier] || currentRate;
                    const tierName = tier === 'budget' ? 'Hemat' : (tier === 'market' ? 'Pasar' : 'Elit');
                    return `
                      <button class="btn-set-salary py-1 px-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer text-center ${isSelected ? 'bg-purple-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'}" data-tier="${tierKey}" data-id="${item.id}" data-tier-val="${tier}" title="${tierName}: ${formatCurrency(tierRate)}/bln">
                        ${tierName}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Card Footer: Subtotal Expense -->
            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Beban Bulanan:</span>
              <span class="font-bold text-amber-400 text-xs">${formatCurrency(subtotalMonthly)}/bln</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Compact Matrix Table Mode: Ultra-hemat high density spreadsheet
 */
function renderTierTableView(app, tierKey, items) {
  return `
    <div class="overflow-x-auto rounded-lg border border-slate-800/90 bg-slate-950/60">
      <table class="w-full text-left text-xs text-slate-300 font-mono">
        <thead class="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
          <tr>
            <th class="py-2.5 px-3">Divisi & Jabatan</th>
            <th class="py-2.5 px-3">Sinergi Output</th>
            <th class="py-2.5 px-3">Jumlah & Kuota</th>
            <th class="py-2.5 px-3">Standar Gaji</th>
            <th class="py-2.5 px-3">Perekrutan</th>
            <th class="py-2.5 px-3 text-right">Beban/Bulan</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60">
          ${items.map(item => {
            const currentRate = item.salaryRates[item.salaryTier] || item.salaryRates.market;
            const subtotalMonthly = (item.count || 0) * currentRate;
            return `
              <tr class="hover:bg-slate-900/50 transition-colors">
                <!-- Title & Unit -->
                <td class="py-2.5 px-3">
                  <div class="font-bold text-white text-xs">${item.title}</div>
                  <div class="text-[10px] text-slate-400 font-sans">${item.department || item.branch}</div>
                </td>

                <!-- Bonus -->
                <td class="py-2.5 px-3 text-cyan-300 text-[11px]">
                  ${item.bonusDesc}
                </td>

                <!-- Count Stepper -->
                <td class="py-2.5 px-3">
                  <div class="flex items-center gap-1.5">
                    <button class="btn-adjust-quota w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-30" data-tier="${tierKey}" data-id="${item.id}" data-delta="-1" ${item.count <= 0 ? 'disabled' : ''}>-</button>
                    <span class="w-12 text-center font-bold text-white">${item.count} <span class="text-slate-500 font-normal">/${item.maxCount}</span></span>
                    <button class="btn-adjust-quota w-6 h-6 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center cursor-pointer disabled:opacity-30" data-tier="${tierKey}" data-id="${item.id}" data-delta="1" ${item.count >= item.maxCount ? 'disabled' : ''}>+</button>
                  </div>
                </td>

                <!-- Salary Selector -->
                <td class="py-2.5 px-3">
                  <div class="inline-flex rounded-md p-0.5 bg-slate-900 border border-slate-800">
                    ${['budget', 'market', 'elite'].map(tier => `
                      <button class="btn-set-salary px-2 py-0.5 text-[10px] rounded transition-all cursor-pointer ${item.salaryTier === tier ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}" data-tier="${tierKey}" data-id="${item.id}" data-tier-val="${tier}">
                        ${tier === 'budget' ? 'Hemat' : (tier === 'market' ? 'Pasar' : 'Elit')}
                      </button>
                    `).join('')}
                  </div>
                  <span class="text-[10px] text-slate-400 ml-1.5">${formatCurrency(currentRate)}</span>
                </td>

                <!-- Recruitment Toggle -->
                <td class="py-2.5 px-3">
                  <button class="btn-toggle-recruiting inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${item.isRecruiting ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'}" data-tier="${tierKey}" data-id="${item.id}">
                    <span class="w-1.5 h-1.5 rounded-full ${item.isRecruiting ? 'bg-emerald-400' : 'bg-slate-500'}"></span>
                    <span>${item.isRecruiting ? 'AKTIF' : 'DITUTUP'}</span>
                  </button>
                </td>

                <!-- Subtotal Monthly -->
                <td class="py-2.5 px-3 text-right font-bold text-amber-400">
                  ${formatCurrency(subtotalMonthly)}/bln
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Attaches all event handlers for the workforce management tab
 */
function attachWorkforceEvents(app, mainEl) {
  const s = app.state;

  // View Mode Switcher
  mainEl.querySelectorAll('.btn-wf-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      app.workforceViewMode = e.currentTarget.getAttribute('data-mode');
      soundEngine.playKeyboardClick();
      renderWorkforceView(app, mainEl);
    });
  });

  // Tier Selector
  mainEl.querySelectorAll('.btn-wf-tier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      app.workforceActiveTier = e.currentTarget.getAttribute('data-tier');
      soundEngine.playKeyboardClick();
      renderWorkforceView(app, mainEl);
    });
  });

  // Department Filter Chips
  mainEl.querySelectorAll('.btn-wf-dept').forEach(btn => {
    btn.addEventListener('click', (e) => {
      app.workforceDeptFilter = e.currentTarget.getAttribute('data-dept');
      soundEngine.playKeyboardClick();
      renderWorkforceView(app, mainEl);
    });
  });

  // Candidate Drawer Toggle
  mainEl.querySelectorAll('.btn-toggle-cand-drawer').forEach(btn => {
    btn.addEventListener('click', () => {
      app.isCandidateDrawerOpen = !app.isCandidateDrawerOpen;
      soundEngine.playKeyboardClick();
      renderWorkforceView(app, mainEl);
    });
  });

  // Global Bulk Actions
  mainEl.querySelector('.btn-wf-open-all')?.addEventListener('click', () => {
    ['managers', 'seniors', 'juniors'].forEach(tier => {
      s.workforce[tier]?.forEach(item => item.isRecruiting = true);
    });
    soundEngine.playCashChime();
    app.updateHeaderBar();
    renderWorkforceView(app, mainEl);
  });

  mainEl.querySelector('.btn-wf-close-all')?.addEventListener('click', () => {
    ['managers', 'seniors', 'juniors'].forEach(tier => {
      s.workforce[tier]?.forEach(item => item.isRecruiting = false);
    });
    soundEngine.playKeyboardClick();
    app.updateHeaderBar();
    renderWorkforceView(app, mainEl);
  });

  mainEl.querySelector('.btn-wf-set-market')?.addEventListener('click', () => {
    ['managers', 'seniors', 'juniors'].forEach(tier => {
      s.workforce[tier]?.forEach(item => item.salaryTier = 'market');
    });
    soundEngine.playKeyboardClick();
    app.updateHeaderBar();
    renderWorkforceView(app, mainEl);
  });

  mainEl.querySelector('.btn-wf-fill-max')?.addEventListener('click', () => {
    ['managers', 'seniors', 'juniors'].forEach(tier => {
      s.workforce[tier]?.forEach(item => item.count = item.maxCount);
    });
    soundEngine.playCashChime();
    app.updateHeaderBar();
    renderWorkforceView(app, mainEl);
  });

  // Hire Executive Candidate
  mainEl.querySelectorAll('.btn-hire-cand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const cand = s.candidatePool.find(c => c.id === id);
      if (cand && !s.executives[cand.role]) {
        s.executives[cand.role] = { ...cand };
        soundEngine.playCashChime();
        app.addChatMessage({
          sender: 'Dewan Komisaris',
          role: 'C-Suite Appointment',
          icon: 'crown',
          text: `${cand.name} resmi diangkat sebagai ${cand.role} (${EXECUTIVE_ROLES[cand.role].title})!`,
          tag: 'general',
        });
        app.updateHeaderBar();
        renderWorkforceView(app, mainEl);
      }
    });
  });

  // Fire Executive
  mainEl.querySelectorAll('.btn-fire-exec').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const role = e.currentTarget.getAttribute('data-role');
      const exec = s.executives[role];
      if (exec && !exec.isPlayer) {
        s.executives[role] = null;
        soundEngine.playKeyboardClick();
        app.addChatMessage({
          sender: 'Dewan Komisaris',
          role: 'C-Suite Termination',
          icon: 'briefcase',
          text: `Kontrak kerja ${exec.name} sebagai ${role} telah dihentikan secara resmi.`,
          tag: 'general',
        });
        app.updateHeaderBar();
        renderWorkforceView(app, mainEl);
      }
    });
  });

  // Adjust Headcount Quota
  mainEl.querySelectorAll('.btn-adjust-quota').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = e.currentTarget.getAttribute('data-tier');
      const id = e.currentTarget.getAttribute('data-id');
      const delta = parseInt(e.currentTarget.getAttribute('data-delta'), 10) || 0;
      const list = s.workforce[tier];
      if (list) {
        const item = list.find(x => x.id === id);
        if (item) {
          const newCount = Math.max(0, Math.min(item.maxCount, (item.count || 0) + delta));
          if (newCount !== item.count) {
            item.count = newCount;
            soundEngine.playKeyboardClick();
            app.updateHeaderBar();
            renderWorkforceView(app, mainEl);
          }
        }
      }
    });
  });

  // Set Salary Tier
  mainEl.querySelectorAll('.btn-set-salary').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = e.currentTarget.getAttribute('data-tier');
      const id = e.currentTarget.getAttribute('data-id');
      const tierVal = e.currentTarget.getAttribute('data-tier-val');
      const list = s.workforce[tier];
      if (list) {
        const item = list.find(x => x.id === id);
        if (item && item.salaryTier !== tierVal) {
          item.salaryTier = tierVal;
          soundEngine.playKeyboardClick();
          app.updateHeaderBar();
          renderWorkforceView(app, mainEl);
        }
      }
    });
  });

  // Toggle Open/Closed Recruitment
  mainEl.querySelectorAll('.btn-toggle-recruiting').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = e.currentTarget.getAttribute('data-tier');
      const id = e.currentTarget.getAttribute('data-id');
      const list = s.workforce[tier];
      if (list) {
        const item = list.find(x => x.id === id);
        if (item) {
          item.isRecruiting = !item.isRecruiting;
          soundEngine.playKeyboardClick();
          app.updateHeaderBar();
          renderWorkforceView(app, mainEl);
        }
      }
    });
  });
}
