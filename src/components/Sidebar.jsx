import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Grid2X2,
  Plus,
  Pencil,
  Volume2,
  VolumeX,
  RefreshCw,
  Trash2,
  Monitor,
  Cpu,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  Check
} from 'lucide-react';

function formatUptime(createdAt) {
  if (!createdAt) return '00m 00s';
  const diffMs = Math.max(0, Date.now() - createdAt);
  const diffSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  if (hours > 0) {
    return `${hours}h ${minutes < 10 ? '0' : ''}${minutes}m`;
  }
  return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;
}

export default function Sidebar({
  cells,
  gridMode,
  setGridMode,
  focusedCellId,
  setFocusedCellId,
  onAddCell,
  onUpdateCell,
  onRemoveCell,
  useWebViewsInstance,
  isSidebarOpen,
  setIsSidebarOpen,
  workspaceTitle,
  setWorkspaceTitle
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(workspaceTitle || 'Principal');
  const [editingCellId, setEditingCellId] = useState(null);
  const [cellCustomName, setCellCustomName] = useState('');
  const [, setTick] = useState(0);

  // Re-render a cada 10s para atualizar o timer visual de uptime das sessões
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const statsMap = new Map();
  if (useWebViewsInstance && useWebViewsInstance.stats && useWebViewsInstance.stats.partitions) {
    useWebViewsInstance.stats.partitions.forEach(p => {
      statsMap.set(p.cellId, p);
    });
  }

  // Soma total de consumo
  let totalCpu = 0;
  let totalRam = 0;
  cells.forEach(c => {
    const st = statsMap.get(c.id);
    if (st) {
      totalCpu += parseFloat(st.cpu || 0);
      totalRam += parseInt(st.ram || 0, 10);
    }
  });

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (setWorkspaceTitle) setWorkspaceTitle(tempTitle.trim() || 'Principal');
    setEditingTitle(false);
  };

  const handleStartCellRename = (cell) => {
    setEditingCellId(cell.id);
    setCellCustomName(cell.customName || cell.partitionId.replace('persist:', ''));
  };

  const handleCellRenameSubmit = (cellId) => {
    onUpdateCell(cellId, { customName: cellCustomName.trim() });
    setEditingCellId(null);
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={() => setIsSidebarOpen(true)}
        title="Abrir Barra Lateral com Janelas e Consumo"
        className="fixed top-16 left-2 z-40 bg-panelBg border border-borderDark hover:border-accentBlue text-slate-300 p-2 rounded-xl shadow-2xl transition hover:bg-slate-800 flex items-center gap-1.5 font-sans text-xs font-bold"
      >
        <ChevronRight className="w-4 h-4 text-accentEmerald" />
        <span className="hidden md:inline">Barra Lateral</span>
      </button>
    );
  }

  return (
    <aside className="w-72 bg-darkBg border-r border-borderDark/90 flex flex-col h-full select-none shrink-0 font-sans z-30 relative shadow-2xl">
      {/* Top Header Barra Lateral */}
      <div className="p-3 border-b border-borderDark/80 flex items-center justify-between bg-panelBg/80">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>

          {editingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="w-full bg-darkBg text-xs font-bold text-white px-2 py-1 rounded border border-accentBlue outline-none"
                autoFocus
              />
              <button type="submit" className="p-1 bg-accentBlue text-white rounded">
                <Check className="w-3 h-3" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer group" onClick={() => setEditingTitle(true)}>
              <h2 className="font-extrabold text-sm text-white truncate">{workspaceTitle || 'Principal'}</h2>
              <Pencil className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition shrink-0" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onAddCell}
            disabled={cells.length >= 4}
            title={cells.length >= 4 ? "Limite máximo de 4 janelas atingido" : "Adicionar Nova Janela"}
            className={`p-1.5 rounded-lg border transition ${
              cells.length >= 4
                ? 'bg-slate-800/50 text-slate-600 border-slate-700/50 cursor-not-allowed'
                : 'bg-accentBlue/20 text-accentBlue border-accentBlue/40 hover:bg-accentBlue/30'
            }`}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            title="Recolher Barra Lateral"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selector de Modo de Tela (1 Central / 2 / 3 / 4 Telas) */}
      <div className="px-3 py-2 border-b border-borderDark/60 bg-panelBg/40">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
          <span>Opções de Exibição</span>
          <span className="text-accentEmerald font-semibold">Central / Grid</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setGridMode('1x1')}
            title="Exibir 1 Tela Centralizada (Foco)"
            className={`py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex flex-col items-center gap-0.5 border ${
              gridMode === '1x1'
                ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                : 'bg-darkBg text-slate-400 border-borderDark hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>1 Tela</span>
          </button>

          <button
            onClick={() => setGridMode('2x1')}
            title="Exibir 2 Telas Lado a Lado"
            className={`py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex flex-col items-center gap-0.5 border ${
              gridMode === '2x1'
                ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                : 'bg-darkBg text-slate-400 border-borderDark hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>2 Telas</span>
          </button>

          <button
            onClick={() => setGridMode('3x3')}
            title="Exibir 3 Telas"
            className={`py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex flex-col items-center gap-0.5 border ${
              gridMode === '3x3'
                ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                : 'bg-darkBg text-slate-400 border-borderDark hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            <span>3 Telas</span>
          </button>

          <button
            onClick={() => setGridMode('2x2')}
            title="Exibir 4 Telas em Grid (Quadrante)"
            className={`py-1.5 rounded-lg text-[10px] font-bold font-mono transition flex flex-col items-center gap-0.5 border ${
              gridMode === '2x2'
                ? 'bg-accentBlue text-white border-accentBlue shadow-md shadow-accentBlue/20'
                : 'bg-darkBg text-slate-400 border-borderDark hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Grid2X2 className="w-3 h-3" />
            <span>4 Telas</span>
          </button>
        </div>
      </div>

      {/* Lista de Janelas/Abas Aberta */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {cells.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-mono">
            Nenhuma aba aberta. Clique em + para criar uma.
          </div>
        ) : (
          cells.map((cell, index) => {
            const st = statsMap.get(cell.id) || {};
            const isFocused = focusedCellId === cell.id;
            const cpuVal = st.cpu || '0.0';
            const ramVal = st.ram || 0;
            const isOnline = true; // sessão ativa
            const displayName = cell.customName || st.title || cell.partitionId.replace('persist:', '') || `Conta ${index + 1}`;

            return (
              <div
                key={cell.id}
                onClick={() => {
                  setFocusedCellId(cell.id);
                  if (gridMode === '1x1') {
                    // em modo 1x1, ao clicar abre essa tela no centro
                  }
                }}
                className={`group relative rounded-xl p-2.5 transition-all border cursor-pointer ${
                  isFocused && gridMode === '1x1'
                    ? 'bg-panelBg/95 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : isFocused
                    ? 'bg-panelBg border-accentBlue/60 shadow-md'
                    : 'bg-panelBg/60 border-borderDark/70 hover:bg-panelBg hover:border-slate-600'
                }`}
              >
                {/* Indicador de Foco Central */}
                {isFocused && gridMode === '1x1' && (
                  <span className="absolute -top-1.5 right-3 bg-emerald-500 text-darkBg text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider font-mono">
                    TELA CENTRAL (PRINCIPAL)
                  </span>
                )}
                {!isFocused && gridMode === '1x1' && (
                  <span className="absolute -top-1.5 right-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider font-mono">
                    2º PLANO (ATIVO)
                  </span>
                )}

                {/* Linha Principal: Status + Nome + Uptime */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-slate-600'}`} />
                    
                    {editingCellId === cell.id ? (
                      <input
                        type="text"
                        value={cellCustomName}
                        onChange={(e) => setCellCustomName(e.target.value)}
                        onBlur={() => handleCellRenameSubmit(cell.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCellRenameSubmit(cell.id)}
                        className="bg-darkBg text-xs font-bold text-white px-1 py-0.5 rounded border border-accentBlue outline-none w-full"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => { e.stopPropagation(); handleStartCellRename(cell); }}
                        title="Duplo clique para renomear"
                        className="font-bold text-xs text-white truncate hover:underline"
                      >
                        {displayName}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {formatUptime(st.createdAt || cell.createdAt)}
                  </span>
                </div>

                {/* Linha de Subtítulo: Online / Fechada */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2 font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    Online
                  </span>
                  <span className="text-slate-500 truncate max-w-[120px]" title={cell.url}>
                    {cell.url.replace(/^https?:\/\//, '')}
                  </span>
                </div>

                {/* Barra de Consumo de RAM e CPU */}
                <div className="bg-darkBg/90 px-2 py-1.5 rounded-lg border border-borderDark/60 flex items-center justify-between gap-2 font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-slate-300">
                    <Cpu className="w-3 h-3 text-sky-400" />
                    <span>CPU <strong className="text-sky-300">{cpuVal}%</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300">
                    <HardDrive className="w-3 h-3 text-purple-400" />
                    <span>RAM <strong className="text-purple-300">{ramVal} MB</strong></span>
                  </div>
                </div>

                {/* Botões rápidos de controle da aba */}
                <div className="mt-2 pt-1.5 border-t border-borderDark/50 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      useWebViewsInstance.reloadView(cell.id);
                    }}
                    title="Recarregar esta aba"
                    className="p-1 hover:text-accentBlue hover:bg-slate-800 rounded transition text-slate-400"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextMuted = !cell.muted;
                      onUpdateCell(cell.id, { muted: nextMuted });
                      useWebViewsInstance.toggleMuteView(cell.id, nextMuted);
                    }}
                    title={cell.muted ? "Desmutar som" : "Mutar som"}
                    className={`p-1 rounded transition ${cell.muted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    {cell.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveCell(cell.id);
                    }}
                    title="Fechar esta janela"
                    className="p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded transition text-slate-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer com Estatísticas Totais do Sistema */}
      <div className="p-3 border-t border-borderDark/90 bg-panelBg/90 font-mono text-[11px] space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <Activity className="w-3.5 h-3.5 text-accentEmerald" />
            Consumo Total ({cells.length} Janelas):
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-darkBg px-2 py-1 rounded border border-borderDark flex items-center justify-between">
            <span className="text-slate-400">CPU Total</span>
            <span className="text-sky-300 font-bold">{totalCpu.toFixed(1)}%</span>
          </div>
          <div className="bg-darkBg px-2 py-1 rounded border border-borderDark flex items-center justify-between">
            <span className="text-slate-400">RAM Total</span>
            <span className="text-purple-300 font-bold">{totalRam} MB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
