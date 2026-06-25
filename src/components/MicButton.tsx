import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ isRecording, isProcessing, onStart, onStop }: MicButtonProps) {
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  };

  return (
    <div className="relative w-10 h-10 shrink-0">
      <AnimatePresence>
        {isRecording && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-red-400/60"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.8, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-red-400/40"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleClick}
        disabled={isProcessing}
        animate={
          isRecording
            ? { scale: [1, 1.06, 1], boxShadow: '0 0 24px rgba(239, 68, 68, 0.45)' }
            : { scale: 1, boxShadow: '0 0 0px rgba(239, 68, 68, 0)' }
        }
        transition={isRecording ? { duration: 1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        whileTap={{ scale: 0.92 }}
        className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 ${
          isRecording
            ? 'bg-red-500/25 text-red-400'
            : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
      </motion.button>
    </div>
  );
}
