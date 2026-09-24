import React, { useState, useEffect } from 'react';
import { X, Keyboard, EyeOff, ShieldCheck, Check, AlertCircle } from 'lucide-react';

const PRESET_SHORTCUTS = [
  { label: 'Alt + H (Padrão recomendada)', value: 'Alt+H' },
  { label: 'Alt + S (Ocultar rápido)', value: 'Alt+S' },
  { label: 'Alt + X (Modo furtivo)', value: 'Alt+X' },
  { label: 'Alt + Shift + H', value: 'Alt+Shift+H' },
  { label: 'Ctrl + Alt + H', value: 'Ctrl+Alt+H' },
  { label: 'F11 (Tecla Única)', value: 'F11' }
];

export default function ShortcutModal({
  isOpen,
  onClose,
  currentShortcut,
  onSaveShortcut
}) {
  const [selectedShortcut, setSelectedShortcut] = useState(currentShortcut || 'Alt+H');
  const [customInput, setCustomInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (currentShortcut) {
      setSelectedShortcut(currentShortcut);
      const isPreset = PRESET_SHORTCUTS.some(p => p.value === currentShortcut);
      if (!isPreset) {
        setIsCustomMode(true);
        setCustomInput(currentShortcut);
      } else {
        setIsCustomMode(false);
      }
    }
  }, [currentShortcut, isOpen]);

  if (!isOpen) return null;

  const handleApply = async (shortcutToApply) => {
    const target = shortcutToApply || (isCustomMode ? customInput.trim() : selectedShortcut);
    if (!target) return;

    const res = await onSaveShortcut(target);
    if (res && res.success) {
      setStatusMessage({ type: 'success', text: `Atalho [ ${target} ] ativado com sucesso!` });
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: `Não foi possível registrar o atalho "${target}". Tente outra combinação.` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-panelBg border border-borderDark rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="h-14 bg-darkBg px-5 flex items-center justify-between border-b border-borderDark">
          <div className="flex items-center gap-2.5 text-slate-100">
            <div className="p-2 rounded-lg bg-accentPurple/20 text-accentPurple">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Atalho Ocultar Janela (Boss Key)</h3>
              <p className="text-[11px] text-slate-400">Oculta a aplicação instantaneamente sem bandeja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div className="bg-darkBg/80 p-3 rounded-xl border border-borderDark/80 flex items-start gap-2.5 text-slate-300 text-[11px]">
            <EyeOff className="w-4 h-4 text-accentBlue shrink-0 mt-0.5" />
            <p>
              Ao pressionar este atalho em qualquer lugar do Windows, a janela será <strong>ocultada instantaneamente</strong> da tela e da barra de tarefas. Pressione-o novamente para exibir.
            </p>
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block text-xs">
              Selecione o Atalho Global:
            </label>

            <div className="grid grid-cols-1 gap-2">
              {PRESET_SHORTCUTS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setIsCustomMode(false);
                    setSelectedShortcut(preset.value);
                    handleApply(preset.value);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition font-mono ${
                    !isCustomMode && selectedShortcut === preset.value
                      ? 'bg-accentPurple/20 border-accentPurple text-white font-bold'
                      : 'bg-darkBg hover:bg-slate-800 border-borderDark/80 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-sans">{preset.label}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-accentPurple font-bold">
                    {preset.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Opção Customizada */}
          <div className="pt-2 border-t border-borderDark/60">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-accentBlue hover:underline text-xs font-semibold flex items-center gap-1"
            >
              <span>{isCustomMode ? '← Voltar para opções padrão' : '✏️ Digitar atalho personalizado...'}</span>
            </button>

            {isCustomMode && (
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ex: Alt+F2, Alt+L, Ctrl+Alt+S..."
                  className="flex-1 bg-darkBg border border-borderDark px-3 py-2 rounded-xl text-xs font-mono text-white outline-none focus:border-accentPurple"
                />
                <button
                  onClick={() => handleApply(customInput.trim())}
                  className="bg-accentPurple hover:bg-purple-600 text-white px-3 py-2 rounded-xl font-bold text-xs transition shrink-0"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>

          {/* Mensagens de Feedback */}
          {statusMessage && (
            <div className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-medium border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}>
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-darkBg px-5 py-3 border-t border-borderDark flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-accentEmerald" />
            <span>Sem ícone na bandeja (Furtivo)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
