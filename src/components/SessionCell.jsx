import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Volume2, VolumeX, Trash2, Moon, Globe, KeyRound, ArrowRight, MousePointer, Zap, ShieldCheck, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { getHumanizedAfkDelaySeconds, BASE_AFK_INTERVAL_SECONDS } from '../utils/afkHelper';

const ZOOM_PRESETS = [0.5, 0.67, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5];

export default function SessionCell({
  cell,
  onUpdateCell,
  onRemoveCell,
  useWebViewsInstance
}) {
  const containerRef = useRef(null);
  const [urlInput, setUrlInput] = useState(cell.url);
  const [isMuted, setIsMuted] = useState(cell.muted || false);
  const [partitionInput, setPartitionInput] = useState(cell.partitionId);
  const [showPartitionEdit, setShowPartitionEdit] = useState(false);
  const [isDarkModeInjected, setIsDarkModeInjected] = useState(false);
  const [zoomFactor, setZoomFactorState] = useState(cell.zoomFactor || 0.8);
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  // Estados do Modo Anti-AFK
  const [isAfkActive, setIsAfkActive] = useState(false);
  const [afkCountdown, setAfkCountdown] = useState(BASE_AFK_INTERVAL_SECONDS);
  const [afkTouchCount, setAfkTouchCount] = useState(0);
  const [justTouched, setJustTouched] = useState(false);

  const { createView, setZoomFactor, updateBounds, destroyView, navigateView, reloadView, toggleMuteView, injectCSS, triggerAfkTouch, isElectron } = useWebViewsInstance;

  // Atualiza urlInput quando cell.url muda externamente
  useEffect(() => {
    setUrlInput(cell.url);
  }, [cell.url]);

  // Obtém estatísticas de CPU e RAM para esta célula específica
  let cellCpu = '0.0';
  let cellRam = 0;
  if (useWebViewsInstance && useWebViewsInstance.stats && useWebViewsInstance.stats.partitions) {
    const st = useWebViewsInstance.stats.partitions.find(p => p.cellId === cell.id);
    if (st) {
      cellCpu = st.cpu || '0.0';
      cellRam = st.ram || 0;
    }
  }

  const isCellVisible = cell.isVisible !== false;

  // 1. Cria a view nativa no Electron apenas ao montar a célula ou mudar partição
  useEffect(() => {
    createView(cell.id, cell.partitionId, cell.url, zoomFactor);
    return () => {
      destroyView(cell.id);
    };
  }, [cell.id, cell.partitionId]);

  // 2. Atualiza dimensões nativas e visibilidade sem destruir a view ao ir para 2º plano
  useEffect(() => {
    const updatePosition = () => {
      if (!isCellVisible) {
        updateBounds(cell.id, { x: -9999, y: -9999, width: 0, height: 0 });
        return;
      }
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateBounds(cell.id, {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.max(0, Math.round(rect.width)),
          height: Math.max(0, Math.round(rect.height))
        });
      }
    };

    updatePosition();
    const observer = new ResizeObserver(() => updatePosition());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updatePosition);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, [cell.id, isCellVisible]);

  const handleApplyZoom = (newFactor) => {
    const clamped = Math.min(Math.max(Math.round(newFactor * 100) / 100, 0.3), 3.0);
    setZoomFactorState(clamped);
    if (setZoomFactor) {
      setZoomFactor(cell.id, clamped);
    }
    onUpdateCell(cell.id, { zoomFactor: clamped });
    setShowZoomMenu(false);
  };

  const handleZoomIn = () => {
    handleApplyZoom(zoomFactor + 0.1);
  };

  const handleZoomOut = () => {
    handleApplyZoom(zoomFactor - 0.1);
  };

  // Cronômetro e automação do Modo Anti-AFK (3m 25s + jitter humanizado)
  useEffect(() => {
    let timer = null;
    if (isAfkActive) {
      timer = setInterval(() => {
        setAfkCountdown((prev) => {
          if (prev <= 1) {
            // Dispara o toque nativo IPC
            if (triggerAfkTouch) {
              triggerAfkTouch(cell.id);
            }
            setAfkTouchCount(count => count + 1);
            setJustTouched(true);
            setTimeout(() => setJustTouched(false), 3000);

            // Reinicia o timer com um atraso humanizado (+2s a +6s)
            return getHumanizedAfkDelaySeconds();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAfkCountdown(BASE_AFK_INTERVAL_SECONDS);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAfkActive, cell.id, triggerAfkTouch]);

  const formatAfkTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleNavigateSubmit = (e) => {
    e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    setUrlInput(target);
    onUpdateCell(cell.id, { url: target });
    navigateView(cell.id, target);
  };

  const handleReload = () => {
    reloadView(cell.id);
  };

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    onUpdateCell(cell.id, { muted: nextState });
    toggleMuteView(cell.id, nextState);
  };

  const handleToggleDarkMode = () => {
    const nextState = !isDarkModeInjected;
    setIsDarkModeInjected(nextState);
    if (nextState) {
      injectCSS(cell.id, `
        html, body {
          filter: invert(0.9) hue-rotate(180deg) !important;
          background-color: #121212 !important;
        }
        img, video, canvas {
          filter: invert(1.1) hue-rotate(180deg) !important;
        }
      `);
    } else {
      reloadView(cell.id);
    }
  };

  const handleSavePartition = () => {
    const cleanId = partitionInput.trim() || 'persist:default';
    const formatted = cleanId.startsWith('persist:') ? cleanId : `persist:${cleanId}`;
    onUpdateCell(cell.id, { partitionId: formatted });
    setShowPartitionEdit(false);
  };

  return (
    <div className={isCellVisible ? "relative flex flex-col h-full w-full rounded-xl overflow-hidden bg-panelBg border border-borderDark/80 shadow-2xl transition-all" : "hidden"}>
      {/* Banner de Feedback quando o Toque AFK é disparado */}
      {justTouched && (
        <div className="absolute top-11 left-1/2 -translate-x-1/2 z-30 bg-accentEmerald text-darkBg text-[11px] font-extrabold px-3 py-1 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce border border-white/20">
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Toque Anti-AFK Humanizado Executado! (#{afkTouchCount})</span>
        </div>
      )}

      {/* Barra de Controles da Sessão */}
      <div className="h-9 bg-darkBg/95 border-b border-borderDark px-2 flex items-center justify-between gap-1.5 z-10 select-none">
        
        {/* Badge de Métricas CPU / RAM da Aba */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-panelBg text-[10px] font-mono border border-borderDark/80 text-slate-300 shrink-0" title="Consumo em tempo real desta aba">
          <span className="text-sky-400 font-bold">CPU {cellCpu}%</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-bold">RAM {cellRam} MB</span>
        </div>
        
        {/* Form de Navegação de URL */}
        <form onSubmit={handleNavigateSubmit} className="flex-1 flex items-center gap-1.5 bg-panelBg/90 px-2 py-1 rounded border border-borderDark/70 focus-within:border-accentBlue/60">
          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Digite a URL (ex: google.com)..."
            className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder-slate-500 font-mono"
          />
          <button
            type="submit"
            title="Ir para a URL (Pressione Enter)"
            className="p-0.5 text-slate-400 hover:text-accentBlue hover:bg-slate-800 rounded transition shrink-0"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Controles de Zoom Proporcional */}
        <div className="relative flex items-center bg-panelBg/90 border border-borderDark rounded px-1 gap-0.5 shrink-0">
          <button
            onClick={handleZoomOut}
            title="Diminuir Zoom"
            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          <button
            onClick={() => setShowZoomMenu(!showZoomMenu)}
            title="Ajustar Fator de Zoom"
            className="text-[10px] font-mono px-1 font-bold text-accentBlue hover:underline"
          >
            {Math.round(zoomFactor * 100)}%
          </button>

          <button
            onClick={handleZoomIn}
            title="Aumentar Zoom"
            className="p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          {/* Menu Dropdown de Presets de Zoom */}
          {showZoomMenu && (
            <div className="absolute top-8 left-0 z-50 bg-darkBg border border-borderDark rounded-lg shadow-2xl p-1 grid grid-cols-3 gap-1 w-36 animate-in fade-in duration-150">
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleApplyZoom(preset)}
                  className={`text-[10px] font-mono py-1 rounded transition text-center ${
                    zoomFactor === preset
                      ? 'bg-accentBlue text-white font-bold'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag da Partição / Conta Isolada (Anti-Ban) */}
        <div className="relative">
          {showPartitionEdit ? (
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-accentBlue">
              <input
                type="text"
                value={partitionInput}
                onChange={(e) => setPartitionInput(e.target.value)}
                className="bg-darkBg text-xs text-white px-1 py-0.5 rounded w-20 outline-none font-mono"
                placeholder="id_conta"
                autoFocus
              />
              <button
                onClick={handleSavePartition}
                className="text-[10px] bg-accentBlue text-white font-bold px-1.5 py-0.5 rounded"
              >
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPartitionEdit(true)}
              title="Isolamento Total de Cookies e Sessão (Anti-Ban)"
              className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-accentPurple/15 text-accentPurple border border-accentPurple/30 hover:bg-accentPurple/25 transition shrink-0"
            >
              <KeyRound className="w-3 h-3" />
              <span>{cell.partitionId.replace('persist:', '')}</span>
            </button>
          )}
        </div>

        {/* Botão de Modo Anti-AFK (3m 25s) */}
        <button
          onClick={() => setIsAfkActive(!isAfkActive)}
          title={isAfkActive ? `Anti-AFK Ativo: Toque automático a cada ${formatAfkTime(afkCountdown)}` : "Ativar Modo Anti-AFK (Toque a cada 3m 25s)"}
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded transition border shrink-0 ${
            isAfkActive
              ? 'bg-emerald-500/20 text-accentEmerald border-accentEmerald/50 shadow-sm shadow-accentEmerald/20 animate-pulse'
              : 'bg-panelBg hover:bg-slate-800 text-slate-400 border-borderDark'
          }`}
        >
          <MousePointer className={`w-3 h-3 ${isAfkActive ? 'text-accentEmerald' : ''}`} />
          <span>{isAfkActive ? formatAfkTime(afkCountdown) : 'AFK 3m25s'}</span>
        </button>

        {/* Botões de Ação da Célula */}
        <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
          <button
            onClick={handleReload}
            title="Recarregar Sessão"
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleToggleMute}
            title={isMuted ? "Desmutar Áudio" : "Mutar Áudio"}
            className={`p-1 rounded transition ${isMuted ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white hover:bg-slate-800'}`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleToggleDarkMode}
            title="Forçar Dark Mode Customizado"
            className={`p-1 rounded transition ${isDarkModeInjected ? 'text-amber-400 bg-amber-500/10' : 'hover:text-white hover:bg-slate-800'}`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => useWebViewsInstance.openExternalUrl && useWebViewsInstance.openExternalUrl(cell.url)}
            title="Abrir esta URL no Navegador Padrão do Sistema (Chrome/Edge)"
            className="p-1 hover:text-accentBlue hover:bg-slate-800 rounded transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onRemoveCell(cell.id)}
            title="Fechar Sessão"
            className="p-1 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área de Visualização do Chromium Nativo */}
      <div className="relative flex-1 w-full h-full overflow-hidden bg-darkBg">
        <div ref={containerRef} className="w-full h-full">
          {!isElectron && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-slate-500 text-xs select-none">
              <Globe className="w-8 h-8 mb-2 opacity-50 text-accentBlue" />
              <p className="font-semibold text-slate-400">Modo de Visualização Web</p>
              <p>Execute no Electron (`npm run dev`) para ativar o motor Chromium nativo com WebContentsView.</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-accentPurple bg-accentPurple/10 px-2 py-1 rounded border border-accentPurple/20 font-mono">
                <ShieldCheck className="w-3 h-3 text-accentEmerald" />
                <span>Anti-Ban: {cell.partitionId}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
