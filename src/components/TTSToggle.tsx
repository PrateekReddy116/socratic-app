import { Volume2, VolumeX } from 'lucide-react';

interface TTSToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function TTSToggle({ enabled, onToggle }: TTSToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
        enabled
          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          : 'bg-zinc-800/60 text-zinc-500 hover:bg-zinc-700/60 hover:text-zinc-400'
      }`}
      aria-label={enabled ? 'Disable voice output' : 'Enable voice output'}
      title={enabled ? 'Voice on' : 'Voice off'}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
