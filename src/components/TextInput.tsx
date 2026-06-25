import { KeyboardEvent, useRef } from 'react';
import { Check, Monitor, Send, X } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  screenshotUrl?: string | null;
  attachScreenshot?: boolean;
  onAttachScreenshotChange?: (attach: boolean) => void;
  onDismissScreenshot?: () => void;
}

export function TextInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask anything...',
  screenshotUrl = null,
  attachScreenshot = false,
  onAttachScreenshotChange,
  onDismissScreenshot,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-0">
      {screenshotUrl && (
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => onAttachScreenshotChange?.(!attachScreenshot)}
            className={`group relative flex items-center gap-2 rounded-lg border transition-all ${
              attachScreenshot
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-zinc-700/50 bg-zinc-900/40 hover:border-zinc-600/60'
            }`}
            aria-pressed={attachScreenshot}
            aria-label="Toggle include screen context"
          >
            <div className="relative w-16 h-10 overflow-hidden rounded-l-lg">
              <img
                src={screenshotUrl}
                alt="Screen capture preview"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-zinc-950/20" />
            </div>
            <div className="flex items-center gap-1.5 pr-2.5 py-1">
              <Monitor size={12} className={attachScreenshot ? 'text-emerald-400' : 'text-zinc-500'} />
              <span className={`text-xs font-medium ${attachScreenshot ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {attachScreenshot ? 'Screen attached' : 'Include screen'}
              </span>
              {attachScreenshot && <Check size={12} className="text-emerald-400" />}
            </div>
          </button>
          <button
            type="button"
            onClick={onDismissScreenshot}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/60 transition-colors"
            aria-label="Dismiss screenshot"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-zinc-900/60 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50 max-h-32"
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600/80 text-white hover:bg-indigo-500/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
