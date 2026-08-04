import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayWindowProps {
  children: ReactNode;
}

export function OverlayWindow({ children }: OverlayWindowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleVisibility = (visible: boolean) => {
      setIsExpanded(visible);
    };
    const handleRequestHide = () => {
      setIsExpanded(false);
      // Wait for animation to complete before hiding the electron window
      setTimeout(() => {
        window.electronAPI?.hideWindow();
      }, 400); // 400ms matches the transition duration roughly
    };

    window.electronAPI?.onWindowVisibilityChange(handleVisibility);
    window.electronAPI?.onRequestHide?.(handleRequestHide);
  }, []);

  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      window.electronAPI?.hideWindow();
    }, 400);
  };

  return (
    <div className="h-screen w-screen flex justify-center bg-transparent">
      <AnimatePresence>
        <motion.div
          initial={{ width: 160, height: 32, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}
          animate={
            isExpanded 
              ? { width: '100%', height: '100%', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 } 
              : { width: 160, height: 32, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }
          }
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
          className="flex flex-col bg-zinc-950/90 backdrop-blur-2xl border-x border-b border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex-1 flex flex-col h-full w-full"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
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
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
