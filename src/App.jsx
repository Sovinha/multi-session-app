import React, { useState, useEffect } from 'react';
import HeaderBar from './components/HeaderBar';
import Sidebar from './components/Sidebar';
import GridContainer from './components/GridContainer';
import WorkspaceModal from './components/WorkspaceModal';
import ShortcutModal from './components/ShortcutModal';
import { useWebViews } from './hooks/useWebViews';
import { ShieldCheck, Check } from 'lucide-react';

const AUTO_SAVE_KEY = 'sessiongrid_auto_saved_state_v1';

function getInitialSavedState() {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.cells) && parsed.cells.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Erro ao ler sessão salva:", e);
  }
  return null;
}

export default function App() {
  const useWebViewsInstance = useWebViews();
  const savedState = getInitialSavedState();

  const [gridMode, setGridMode] = useState(savedState?.gridMode || '2x2');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [workspaceTitle, setWorkspaceTitle] = useState(savedState?.workspaceTitle || 'Principal');
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [currentShortcut, setCurrentShortcut] = useState('Alt+H');
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);

  // Células / sessões ativas (Restauradas do auto-save para Acesso Rápido)
  const [cells, setCells] = useState(savedState?.cells || [
    {
      id: 'cell_1',
      url: 'https://google.com',
      partitionId: 'persist:sessao_1',
      customName: 'Sessão 1',
      muted: false
    },
    {
      id: 'cell_2',
      url: 'https://github.com',
      partitionId: 'persist:sessao_2',
      customName: 'Sessão 2',
      muted: false
    }
  ]);

  const [focusedCellId, setFocusedCellId] = useState(savedState?.focusedCellId || cells[0]?.id || 'cell_1');
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // Garantir que focusedCellId aponte para uma célula válida
  useEffect(() => {
    if (cells.length > 0 && (!focusedCellId || !cells.some(c => c.id === focusedCellId))) {
      setFocusedCellId(cells[0].id);
    }
  }, [cells, focusedCellId]);

  // Sincroniza URLs navegadas do Electron para salvar automaticamente a última página visitada
  useEffect(() => {
    if (useWebViewsInstance && useWebViewsInstance.stats && useWebViewsInstance.stats.partitions) {
      const partitions = useWebViewsInstance.stats.partitions;
      let hasChanges = false;
      
      const updatedCells = cells.map(cell => {
        const matchingPart = partitions.find(p => p.cellId === cell.id);
        if (matchingPart && matchingPart.url && matchingPart.url !== 'about:blank' && matchingPart.url !== cell.url) {
          hasChanges = true;
          return { ...cell, url: matchingPart.url };
        }
        return cell;
      });

      if (hasChanges) {
        setCells(updatedCells);
      }
    }
  }, [useWebViewsInstance.stats]);

  // Auto-salvamento contínuo para Acesso Rápido com sessão/login salvo
  useEffect(() => {
    try {
      const stateToSave = {
        gridMode,
        workspaceTitle,
        focusedCellId,
        cells: cells.map(c => ({
          id: c.id,
          url: c.url,
          partitionId: c.partitionId,
          customName: c.customName,
          muted: c.muted,
          zoomFactor: c.zoomFactor || 0.8
        }))
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Erro ao auto-salvar sessão:", e);
    }
  }, [cells, gridMode, workspaceTitle, focusedCellId]);

  // Obtém o atalho configurado no Electron na inicialização
  useEffect(() => {
    if (useWebViewsInstance.getBossKeyShortcut) {
      useWebViewsInstance.getBossKeyShortcut().then(sc => {
        if (sc) setCurrentShortcut(sc);
      });
    }
  }, [useWebViewsInstance]);

  const handleSaveQuickAccess = () => {
    try {
      const stateToSave = {
        gridMode,
        workspaceTitle,
        focusedCellId,
        cells: cells.map(c => ({
          id: c.id,
          url: c.url,
          partitionId: c.partitionId,
          customName: c.customName,
          muted: c.muted,
          zoomFactor: c.zoomFactor || 0.8
        }))
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(stateToSave));
      setShowAutoSaveToast(true);
      setTimeout(() => setShowAutoSaveToast(false), 3500);
    } catch (e) {
      console.error("Erro ao salvar acesso rápido:", e);
    }
  };

  const handleAddCell = () => {
    if (cells.length >= 4) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 4000);
      return;
    }
    const nextIndex = cells.length + 1;
    const newCellId = `cell_${Date.now()}`;
    const newCell = {
      id: newCellId,
      url: 'https://google.com',
      partitionId: `persist:conta_jogos_${nextIndex}`,
      customName: `Conta ${nextIndex}`,
      muted: false
    };
    setCells(prev => [...prev, newCell]);
    setFocusedCellId(newCellId);
  };

  const handleUpdateCell = (cellId, updatedProps) => {
    setCells(prev => prev.map(c => c.id === cellId ? { ...c, ...updatedProps } : c));
  };

  const handleRemoveCell = (cellId) => {
    setCells(prev => {
      const remaining = prev.filter(c => c.id !== cellId);
      if (focusedCellId === cellId && remaining.length > 0) {
        setFocusedCellId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleLoadWorkspace = (workspace) => {
    if (workspace.gridMode) setGridMode(workspace.gridMode);
    if (workspace.cells) {
      const slice = workspace.cells.slice(0, 4);
      setCells(slice);
      if (slice.length > 0) setFocusedCellId(slice[0].id);
    }
  };

  const handleSaveShortcut = async (newShortcut) => {
    const result = await useWebViewsInstance.setBossKeyShortcut(newShortcut);
    if (result && result.success) {
      setCurrentShortcut(result.shortcut);
    }
    return result;
  };

  const handleReloadAll = () => {
    cells.forEach(c => useWebViewsInstance.reloadView(c.id));
  };

  const handleMuteAll = () => {
    setCells(prev => prev.map(c => {
      useWebViewsInstance.toggleMuteView(c.id, true);
      return { ...c, muted: true };
    }));
  };

  const handleUnmuteAll = () => {
    setCells(prev => prev.map(c => {
      useWebViewsInstance.toggleMuteView(c.id, false);
      return { ...c, muted: false };
    }));
  };

  const handleSetZoomAll = (zoomVal) => {
    setCells(prev => prev.map(c => {
      useWebViewsInstance.setZoomFactor(c.id, zoomVal);
      return { ...c, zoomFactor: zoomVal };
    }));
  };

  const handleLoadGamePreset = (presetName) => {
    if (presetName === 'ragnaidle') {
      const presetUrl = 'https://www.google.com';
      setGridMode('2x2');
      const newPresetCells = [
        { id: 'cell_1', url: presetUrl, partitionId: 'persist:sessao_1', customName: 'Sessão 1', muted: false, zoomFactor: 0.8 },
        { id: 'cell_2', url: presetUrl, partitionId: 'persist:sessao_2', customName: 'Sessão 2', muted: false, zoomFactor: 0.8 },
        { id: 'cell_3', url: presetUrl, partitionId: 'persist:sessao_3', customName: 'Sessão 3', muted: false, zoomFactor: 0.8 },
        { id: 'cell_4', url: presetUrl, partitionId: 'persist:sessao_4', customName: 'Sessão 4', muted: false, zoomFactor: 0.8 }
      ];
      setCells(newPresetCells);
      setFocusedCellId('cell_1');
    } else if (presetName === 'idleworld') {
      const presetUrl = 'https://github.com';
      setGridMode('2x2');
      const newPresetCells = [
        { id: 'cell_1', url: presetUrl, partitionId: 'persist:sessao_1', customName: 'Sessão 1', muted: false, zoomFactor: 0.8 },
        { id: 'cell_2', url: presetUrl, partitionId: 'persist:sessao_2', customName: 'Sessão 2', muted: false, zoomFactor: 0.8 },
        { id: 'cell_3', url: presetUrl, partitionId: 'persist:sessao_3', customName: 'Sessão 3', muted: false, zoomFactor: 0.8 },
        { id: 'cell_4', url: presetUrl, partitionId: 'persist:sessao_4', customName: 'Sessão 4', muted: false, zoomFactor: 0.8 }
      ];
      setCells(newPresetCells);
      setFocusedCellId('cell_1');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-darkBg text-slate-100 overflow-hidden font-sans">
      <HeaderBar
        cellsCount={cells.length}
        onAddCell={handleAddCell}
        gridMode={gridMode}
        setGridMode={setGridMode}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onHideWindow={useWebViewsInstance.hideWindow}
        onOpenShortcutModal={() => setIsShortcutModalOpen(true)}
        currentShortcut={currentShortcut}
        onReloadAll={handleReloadAll}
        onMuteAll={handleMuteAll}
        onUnmuteAll={handleUnmuteAll}
        onSetZoomAll={handleSetZoomAll}
        onLoadGamePreset={handleLoadGamePreset}
        onSaveQuickAccess={handleSaveQuickAccess}
        activeStats={useWebViewsInstance.stats}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {showLimitWarning && (
        <div className="absolute top-16 right-6 z-50 bg-rose-500/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur border border-rose-400 animate-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <span>⚠️ Limite máximo ativado: No máximo 4 telas ativas permitidas (Regra Anti-Ban & Desempenho).</span>
        </div>
      )}

      {showAutoSaveToast && (
        <div className="absolute top-16 right-6 z-50 bg-emerald-600/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur border border-emerald-400 animate-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-200" />
          <span>🔐 Acesso Rápido & Logins Salvos! Ao abrir novamente, suas contas estarão prontas.</span>
        </div>
      )}

      {/* Área Principal: Sidebar Lateral + Grid Central */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] w-full overflow-hidden relative">
        <Sidebar
          cells={cells}
          gridMode={gridMode}
          setGridMode={setGridMode}
          focusedCellId={focusedCellId}
          setFocusedCellId={setFocusedCellId}
          onAddCell={handleAddCell}
          onUpdateCell={handleUpdateCell}
          onRemoveCell={handleRemoveCell}
          useWebViewsInstance={useWebViewsInstance}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          workspaceTitle={workspaceTitle}
          setWorkspaceTitle={setWorkspaceTitle}
        />

        <GridContainer
          cells={cells}
          gridMode={gridMode}
          focusedCellId={focusedCellId}
          setFocusedCellId={setFocusedCellId}
          onUpdateCell={handleUpdateCell}
          onRemoveCell={handleRemoveCell}
          useWebViewsInstance={useWebViewsInstance}
        />
      </div>

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        currentCells={cells}
        gridMode={gridMode}
        onLoadWorkspace={handleLoadWorkspace}
      />

      <ShortcutModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
        currentShortcut={currentShortcut}
        onSaveShortcut={handleSaveShortcut}
      />
    </div>
  );
}
