import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-cyber-primary/30 border-t-cyber-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-cyber-primary animate-pulse" />
          </div>
        </div>
        <span className="text-sm font-mono text-cyber-primary animate-pulse">
          LOADING...
        </span>
      </div>
    </div>
  );
}
