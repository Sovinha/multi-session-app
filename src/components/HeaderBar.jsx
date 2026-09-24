import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Grid2X2,
  Grid3X3,
  Plus,
  ShieldCheck,
  Zap,
  Bookmark,
  HardDrive,
  Lock,
  EyeOff,
  Keyboard,
  Layers,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Gamepad2,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  PanelLeft,
  Cpu,
  Monitor
} from 'lucide-react';

export default function HeaderBar({
  cellsCount,
  onAddCell,
  gridMode,
  setGridMode,
  onOpenWorkspaceModal,
  onHideWindow,
  onOpenShortcutModal,
  currentShortcut = 'Alt+H',
  onReloadAll,
  onMuteAll,
  onUnmuteAll,
  onSetZoomAll,
  onLoadGamePreset,
  activeStats,
  isSidebarOpen,
  setIsSidebarOpen
}) {
  const isMaxReached = cellsCount >= 4;
  const [showMultiMenu, setShowMultiMenu] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMultiMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcula total de CPU e RAM dos ativos
  let totalCpu = 0;
  let totalRam = 0;
  if (activeStats && activeStats.partitions) {
    activeStats.partitions.forEach(p => {
      totalCpu += parseFloat(p.cpu || 0);
      totalRam += parseInt(p.ram || 0, 10);
    });
  }

  return (
    <header className="h-14 bg-panelBg/95 backdrop-blur-xl border-b border-borderDark/80 px-4 flex items-center justify-between z-50 select-none shadow-2xl relative">
      {/* Botão de Alternar Barra Lateral & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen && setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Ocultar Barra Lateral" : "Exibir Barra Lateral de Janelas"}
          className={`p-2 rounded-xl border transition flex items-center gap-1.5 font-sans text-xs font-bold ${
            isSidebarOpen
              ? 'bg-accentBlue/20 text-accentBlue border-accentBlue/40 shadow-sm'
              : 'bg-darkBg text-slate-300 border-borderDark hover:bg-slate-800 hover:border-slate-600'
          }`}
        >
          <PanelLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Painel</span>
        </button>

        <div className="relative flex items-center justify-center group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-white/20 group-hover:scale-105 transition-transform duration-200">
            <Zap className="w-5 h-5 fill-current animate-pulse text-yellow-300" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 font-sans">
              MULTI<span className="text-accentBlue"></span>
            </h1>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-accentBlue/30 via-indigo-500/30 to-accentPurple/30 text-indigo-200 border border-accentBlue/40 shadow-sm uppercase tracking-widest">
              v4.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accentEmerald"></span>
            Motor Nativo Multi-Sessão & Anti-Ban
          </p>
        </div>
      </div>

      {/* Estatísticas de Desempenho & Consumo em Tempo Real */}
      <div className="hidden lg:flex items-center gap-3 bg-darkBg/90 px-3.5 py-1.5 rounded-xl border border-borderDark/80 text-xs shadow-inner font-mono">
        <div className="flex items-center gap-1.5 text-accentEmerald font-semibold">
          <ShieldCheck className="w-4 h-4 shrink-0 text-accentEmerald" />
          <span className="font-sans">Anti-Ban Ativo</span>
        </div>
        <div className="h-3 w-px bg-borderDark/80" />
        <div className="flex items-center gap-1.5 text-slate-200">
          <HardDrive className="w-3.5 h-3.5 text-accentBlue" />
          <span><strong>{cellsCount}/4</strong> Janelas</span>
        </div>
        <div className="h-3 w-px bg-borderDark/80" />
        <div className="flex items-center gap-1 text-sky-400 font-bold text-[11px]" title="Consumo acumulado de CPU">
          <Cpu className="w-3.5 h-3.5" />
          <span>{totalCpu.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-px bg-borderDark/80" />
        <div className="flex items-center gap-1 text-purple-400 font-bold text-[11px]" title="Consumo acumulado de memória RAM">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{totalRam} MB</span>
        </div>
      </div>

      {/* Controles do Grid e Ações do Multi */}
      <div className="flex items-center gap-2">
        {/* Menu do Multi (Ações em Massa) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMultiMenu(!showMultiMenu)}
            title="Menu do Multi: Ações em Massa, Presets e Controles Globais"
            className="flex items-center gap-2 bg-gradient-to-r from-accentPurple/25 via-indigo-600/25 to-blue-600/25 hover:from-accentPurple/40 hover:via-indigo-600/40 hover:to-blue-600/40 text-white border border-accentPurple/40 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 active:scale-95"
          >
            <Layers className="w-4 h-4 text-accentPurple animate-bounce-short" />
            <span>Menu do Multi</span>
            <ChevronDown className={`w-3.5 h-3.5 text-indigo-300 transition-transform duration-200 ${showMultiMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown do Menu do Multi */}
          {showMultiMenu && (
            <div className="absolute top-11 right-0 z-50 bg-panelBg/95 backdrop-blur-2xl border border-borderDark/90 rounded-2xl shadow-2xl p-2.5 w-72 animate-in fade-in zoom-in-95 duration-150 space-y-1.5 font-sans text-xs">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between border-b border-borderDark/60 pb-1.5 mb-1">
                <span className="flex items-center gap-1 text-accentPurple">
                  <SlidersHorizontal className="w-3 h-3" />
                  Ações em Massa Globais
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-darkBg text-slate-400">MULT-CONTROL</span>
              </div>

              <button
                onClick={() => { onReloadAll && onReloadAll(); setShowMultiMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition text-left group"
              >
                <RefreshCw className="w-4 h-4 text-accentBlue group-hover:rotate-180 transition-transform duration-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Recarregar Todas as Telas</span>
                  <span className="text-[10px] text-slate-400">Atualiza a navegação de todas as 4 células</span>
                </div>
              </button>

              <button
                onClick={() => { onMuteAll && onMuteAll(); setShowMultiMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition text-left group"
              >
                <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-rose-200">Mutar Todos os Áudios</span>
                  <span className="text-[10px] text-slate-400">Silencia imediatamente o áudio de todas</span>
                </div>
              </button>

              <button
                onClick={() => { onUnmuteAll && onUnmuteAll(); setShowMultiMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition text-left group"
              >
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-emerald-200">Desmutar Todos os Áudios</span>
                  <span className="text-[10px] text-slate-400">Restaura o som das janelas de jogo</span>
                </div>
              </button>

              <button
                onClick={() => { onSaveQuickAccess && onSaveQuickAccess(); setShowMultiMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition text-left group border border-emerald-500/20 bg-emerald-500/10"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-semibold text-emerald-200">Salvar Logins e Acesso Rápido</span>
                  <span className="text-[10px] text-slate-300">Grava o estado atual para abertura automática</span>
                </div>
              </button>

              <div className="pt-1 border-t border-borderDark/60" />
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-amber-400" />
                <span>Ajuste de Escala em Massa</span>
              </div>

              <div className="grid grid-cols-3 gap-1 px-1">
                <button
                  onClick={() => { onSetZoomAll && onSetZoomAll(0.67); setShowMultiMenu(false); }}
                  className="px-2 py-1.5 rounded-lg bg-darkBg hover:bg-slate-800 border border-borderDark text-slate-300 font-mono text-[11px] text-center font-bold transition"
                >
                  67%
                </button>
                <button
                  onClick={() => { onSetZoomAll && onSetZoomAll(0.8); setShowMultiMenu(false); }}
                  className="px-2 py-1.5 rounded-lg bg-accentBlue/20 hover:bg-accentBlue/30 border border-accentBlue/40 text-accentBlue font-mono text-[11px] text-center font-bold transition"
                >
                  80% (Padrão)
                </button>
                <button
                  onClick={() => { onSetZoomAll && onSetZoomAll(1.0); setShowMultiMenu(false); }}
                  className="px-2 py-1.5 rounded-lg bg-darkBg hover:bg-slate-800 border border-borderDark text-slate-300 font-mono text-[11px] text-center font-bold transition"
                >
                  100%
                </button>
              </div>

              <div className="pt-1.5 border-t border-borderDark/60 my-1" />
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-accentPurple" />
                <span>Presets de Jogos Prontos</span>
              </div>

              <button
                onClick={() => { onLoadGamePreset && onLoadGamePreset('ragnaidle'); setShowMultiMenu(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-semibold text-white">RagNAIdle</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  4 CONTA RPG
                </span>
              </button>

              <button
                onClick={() => { onLoadGamePreset && onLoadGamePreset('idleworld'); setShowMultiMenu(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800/80 text-slate-200 transition group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-white">Idle World</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  4 CONTA MMO
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Presets do Grid */}
        <div className="flex items-center bg-darkBg/90 p-1 rounded-xl border border-borderDark gap-0.5 shadow-inner">
          <button
            onClick={() => setGridMode('1x1')}
            title="Layout 1x1 (Foco em 1 tela)"
            className={`p-1.5 rounded-lg transition ${gridMode === '1x1' ? 'bg-accentBlue text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridMode('2x2')}
            title="Layout 2x2 (Quadrante 4 Telas - Recomendado)"
            className={`p-1.5 rounded-lg transition ${gridMode === '2x2' ? 'bg-accentBlue text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Grid2X2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridMode('3x3')}
            title="Layout 3x3 (Matriz Expansível)"
            className={`p-1.5 rounded-lg transition ${gridMode === '3x3' ? 'bg-accentBlue text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {/* Adicionar Nova Célula com Trava em 4 Telas */}
        <button
          onClick={onAddCell}
          title={isMaxReached ? "Limite máximo de 4 sessões simultâneas atingido" : "Adicionar Nova Sessão Isolada (Máximo 4)"}
          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-lg ${
            isMaxReached
              ? 'bg-slate-800/80 text-slate-500 border border-slate-700/80 cursor-not-allowed'
              : 'bg-gradient-to-r from-accentBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-accentBlue/20 active:scale-95 border border-blue-400/30'
          }`}
        >
          {isMaxReached ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
          <span>{isMaxReached ? 'Limite (4/4)' : 'Nova Sessão'}</span>
        </button>

        {/* Gerenciador de Workspaces */}
        <button
          onClick={onOpenWorkspaceModal}
          className="flex items-center gap-1.5 bg-darkBg hover:bg-slate-800 text-slate-200 border border-borderDark text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-sm hover:border-slate-600"
        >
          <Bookmark className="w-3.5 h-3.5 text-accentPurple" />
          <span>Workspaces</span>
        </button>

        {/* Botão de Atalho para Configurações */}
        <button
          onClick={onOpenShortcutModal}
          title={`Configurar Atalho Global (${currentShortcut})`}
          className="flex items-center gap-1.5 bg-darkBg hover:bg-slate-800 text-slate-300 border border-borderDark text-xs font-semibold px-2.5 py-1.5 rounded-xl transition font-mono shadow-sm hover:border-slate-600"
        >
          <Keyboard className="w-3.5 h-3.5 text-accentBlue" />
          <span className="text-[11px] text-accentPurple font-bold">{currentShortcut}</span>
        </button>

        {/* Botão Esconder Janela (Sem ir para bandeja - Ocultação total) */}
        <button
          onClick={onHideWindow}
          title={`Ocultar Janela Instantaneamente (Atalho Global: ${currentShortcut}) - Sem ir para bandeja`}
          className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm hover:shadow-rose-500/10 active:scale-95"
        >
          <EyeOff className="w-4 h-4 text-rose-400" />
          <span>Esconder</span>
        </button>
      </div>
    </header>
  );
}

