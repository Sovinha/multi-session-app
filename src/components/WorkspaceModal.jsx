import React, { useState, useEffect } from 'react';
import { X, Save, FolderOpen, Trash2, CheckCircle } from 'lucide-react';

export default function WorkspaceModal({
  isOpen,
  onClose,
  currentCells,
  gridMode,
  onLoadWorkspace
}) {
  const [workspaces, setWorkspaces] = useState([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sessiongrid_workspaces');
    if (stored) {
      try {
        setWorkspaces(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao carregar workspaces salvos", e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveWorkspace = (e) => {
    e.preventDefault();
    const name = workspaceName.trim() || `Setup ${new Date().toLocaleTimeString()}`;
    const newWs = {
      id: Date.now().toString(),
      name,
      gridMode,
      date: new Date().toLocaleDateString('pt-BR'),
      cells: currentCells.map(c => ({
        id: c.id,
        url: c.url,
        partitionId: c.partitionId,
        muted: c.muted
      }))
    };

    const updated = [newWs, ...workspaces];
    setWorkspaces(updated);
    localStorage.setItem('sessiongrid_workspaces', JSON.stringify(updated));
    setWorkspaceName('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteWorkspace = (id) => {
    const updated = workspaces.filter(w => w.id !== id);
    setWorkspaces(updated);
    localStorage.setItem('sessiongrid_workspaces', JSON.stringify(updated));
  };

  const handleSelectWorkspace = (ws) => {
    onLoadWorkspace(ws);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panelBg border border-borderDark rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        
        {/* Header do Modal */}
        <div className="px-5 py-4 border-b border-borderDark flex items-center justify-between bg-darkBg/60">
          <div className="flex items-center gap-2 text-slate-100 font-bold text-sm">
            <FolderOpen className="w-4 h-4 text-accentPurple" />
            <span>Gerenciador de Workspaces</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Salvar Setup Atual */}
          <form onSubmit={handleSaveWorkspace} className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Salvar Layout Atual ({currentCells.length} Sessões)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="Ex: Minhas Contas do Jogo X..."
                className="flex-1 bg-darkBg border border-borderDark rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-accentBlue"
              />
              <button
                type="submit"
                className="bg-accentPurple hover:bg-purple-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center gap-1.5 shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Setup</span>
              </button>
            </div>
            {savedSuccess && (
              <p className="text-[11px] text-accentEmerald flex items-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5" /> Setup salvo com sucesso!
              </p>
            )}
          </form>

          {/* Lista de Workspaces Salvos */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300">Setups Salvos</h3>
            {workspaces.length === 0 ? (
              <div className="p-4 rounded-lg bg-darkBg/50 border border-borderDark text-center text-xs text-slate-500">
                Nenhum workspace salvo ainda.
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-darkBg border border-borderDark hover:border-slate-700 transition"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ws.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {ws.cells?.length || 0} Sessões • Grid {ws.gridMode} • Salvo em {ws.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectWorkspace(ws)}
                        className="bg-accentBlue/20 hover:bg-accentBlue hover:text-white text-accentBlue font-medium text-xs px-3 py-1.5 rounded-lg border border-accentBlue/30 transition"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => handleDeleteWorkspace(ws.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 py-3 border-t border-borderDark bg-darkBg/60 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium px-4 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
