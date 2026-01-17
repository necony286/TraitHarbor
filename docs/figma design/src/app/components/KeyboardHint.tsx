import { useState } from 'react';

export function KeyboardHint() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-20 hidden lg:block animate-in slide-in-from-bottom-4 duration-500 delay-1000">
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-[#2563eb]/30 rounded-xl p-4 shadow-lg max-w-xs">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss keyboard shortcuts hint"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-foreground">Keyboard Shortcuts</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Previous page</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-mono">
                  Alt
                </kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-mono">
                  ←
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Next page</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-mono">
                  Alt
                </kbd>
                <span className="text-muted-foreground">+</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-mono">
                  →
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Navigate options</span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-900 border border-border rounded text-[10px] font-mono">
                Tab
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
