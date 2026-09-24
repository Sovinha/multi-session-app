import React from 'react';
import SessionCell from './SessionCell';
import { Monitor, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export default function GridContainer({
  cells,
  gridMode,
  focusedCellId,
  setFocusedCellId,
  onUpdateCell,
  onRemoveCell,
  useWebViewsInstance
}) {
  if (cells.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none">
        <div className="w-16 h-16 rounded-2xl bg-panelBg border border-borderDark flex items-center justify-center mb-4 text-accentBlue shadow-2xl">
          <span className="text-2xl font-bold">+</span>
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Nenhuma Sessão Ativa</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Clique no botão "Nova Sessão" no menu para adicionar o primeiro painel de navegação isolado.
        </p>
      </div>
    );
  }

  const handlePrevScreen = () => {
    if (cells.length <= 1) return;
    const currentIndex = cells.findIndex(c => c.id === focusedCellId);
    const prevIndex = (currentIndex - 1 + cells.length) % cells.length;
    if (setFocusedCellId) setFocusedCellId(cells[prevIndex].id);
  };

  const handleNextScreen = () => {
    if (cells.length <= 1) return;
    const currentIndex = cells.findIndex(c => c.id === focusedCellId);
    const nextIndex = (currentIndex + 1) % cells.length;
    if (setFocusedCellId) setFocusedCellId(cells[nextIndex].id);
  };

  let gridStyle = "grid-cols-1 grid-rows-1";

  if (gridMode === '1x1') {
    gridStyle = "grid-cols-1 grid-rows-1";
  } else if (gridMode === '2x1') {
    gridStyle = "grid-cols-1 md:grid-cols-2 grid-rows-1";
  } else if (gridMode === '3x3') {
    gridStyle = "grid-cols-1 md:grid-cols-3 grid-rows-1";
  } else if (gridMode === '2x2') {
    gridStyle = "grid-cols-1 md:grid-cols-2 grid-rows-2";
  } else {
    if (cells.length === 1) gridStyle = "grid-cols-1 grid-rows-1";
    else if (cells.length === 2) gridStyle = "grid-cols-1 md:grid-cols-2 grid-rows-1";
    else if (cells.length === 3) gridStyle = "grid-cols-1 md:grid-cols-3 grid-rows-1";
    else gridStyle = "grid-cols-1 md:grid-cols-2 grid-rows-2";
  }

  const isSingleMode = gridMode === '1x1';

  return (
    <main className="flex-1 p-3 w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-darkBg relative flex flex-col">
      {/* Barra de Abas de Alternância Rápida para Modo 1 Tela (Foco Central + 2º Plano) */}
      {isSingleMode && cells.length > 1 && (
        <div className="mb-2 bg-panelBg/95 border border-borderDark/80 rounded-xl p-2 flex flex-wrap items-center justify-between gap-2 shadow-xl shrink-0 select-none z-20">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1 shrink-0">
              <Monitor className="w-3.5 h-3.5 text-accentBlue" />
              <span>Foco Principal:</span>
            </span>

            {cells.map((cell, idx) => {
              const isFocused = (cell.id === focusedCellId) || (!focusedCellId && idx === 0);
              const displayName = cell.customName || cell.partitionId.replace('persist:', '') || `Tela ${idx + 1}`;

              return (
                <button
                  key={cell.id}
                  onClick={() => setFocusedCellId && setFocusedCellId(cell.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                    isFocused
                      ? 'bg-gradient-to-r from-accentBlue to-indigo-600 text-white border-blue-400/50 shadow-md shadow-accentBlue/20'
                      : 'bg-darkBg/90 text-slate-300 border-borderDark hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isFocused ? 'bg-emerald-300 shadow-sm shadow-emerald-300' : 'bg-emerald-400/80 animate-pulse'}`} />
                  <span className="truncate max-w-[120px]">{displayName}</span>
                  {isFocused ? (
                    <span className="text-[9px] font-mono font-black bg-white/20 text-white px-1.5 py-0.2 rounded uppercase">
                      TELA {idx + 1}
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
                      2º Plano
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{cells.length - 1} telas ativas em 2º plano</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevScreen}
                title="Ir para Tela Anterior"
                className="p-1.5 bg-darkBg hover:bg-slate-800 text-slate-300 border border-borderDark rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextScreen}
                title="Ir para Próxima Tela"
                className="p-1.5 bg-darkBg hover:bg-slate-800 text-slate-300 border border-borderDark rounded-lg transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-3 w-full flex-1 min-h-0 ${gridStyle}`}>
        {cells.map((cell, index) => {
          let isVisible = true;
          if (gridMode === '1x1') {
            isVisible = (cell.id === focusedCellId) || (!focusedCellId && index === 0);
          } else if (gridMode === '2x1') {
            isVisible = index < 2;
          } else if (gridMode === '3x3') {
            isVisible = index < 3;
          }

          const cellWithVisibility = { ...cell, isVisible };

          return (
            <SessionCell
              key={cell.id}
              cell={cellWithVisibility}
              onUpdateCell={onUpdateCell}
              onRemoveCell={onRemoveCell}
              useWebViewsInstance={useWebViewsInstance}
            />
          );
        })}
      </div>
    </main>
  );
}
