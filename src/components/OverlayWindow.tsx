import { ReactNode } from 'react';

interface OverlayWindowProps {
  children: ReactNode;
}

export function OverlayWindow({ children }: OverlayWindowProps) {
  const handleClose = () => {
    window.electronAPI?.hideWindow();
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800/60 shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-zinc-300 tracking-wide">Socratic</span>
        </div>
        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors text-sm"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
}
