import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Info,
  ArrowRight,
  Database,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { ToastNotification, ToastType } from '../types/toast';
import { ActiveTab } from './Header';
import { RoomCategoryCode } from '../types/hotel';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (toastId: string) => void;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode, alertId?: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onNavigate,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastNotification;
  onDismiss: (toastId: string) => void;
  onNavigate: (tab: ActiveTab, date?: string, category?: RoomCategoryCode, alertId?: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss, onNavigate }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const duration = toast.duration ?? 6500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.id, toast.duration, isPaused, onDismiss]);

  const getBorderAndBg = (type: ToastType) => {
    switch (type) {
      case 'strategy_recommendation':
        return 'border-emerald-500/80 bg-slate-900 shadow-emerald-950/40';
      case 'data_sync':
        return 'border-blue-500/80 bg-slate-900 shadow-blue-950/40';
      case 'alert_detected':
        return 'border-red-500/80 bg-slate-900 shadow-red-950/40';
      case 'system_info':
      default:
        return 'border-slate-700 bg-slate-900 shadow-slate-950/40';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'strategy_recommendation':
        return <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'data_sync':
        return <RefreshCw className="w-4 h-4 text-blue-400 shrink-0 animate-spin" style={{ animationDuration: '3s' }} />;
      case 'alert_detected':
        return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />;
      case 'system_info':
      default:
        return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const getTypeBadge = (type: ToastType) => {
    switch (type) {
      case 'strategy_recommendation':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            STRATÉGIE RMS
          </span>
        );
      case 'data_sync':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
            SYNC CONNECTEUR
          </span>
        );
      case 'alert_detected':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
            ALERTE DÉTECTÉE
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
            SYSTÈME
          </span>
        );
    }
  };

  const getProgressBarColor = (type: ToastType) => {
    switch (type) {
      case 'strategy_recommendation':
        return 'bg-emerald-500';
      case 'data_sync':
        return 'bg-blue-500';
      case 'alert_detected':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto border rounded-xl shadow-xl overflow-hidden text-xs transition-all animate-in slide-in-from-right-4 duration-200 ${getBorderAndBg(
        toast.type
      )}`}
    >
      {/* Toast Content */}
      <div className="p-3.5 space-y-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getIcon(toast.type)}
            {getTypeBadge(toast.type)}
            <span className="text-[10px] font-mono text-slate-400">{toast.timestamp}</span>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
            title="Fermer la notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title & Message */}
        <div>
          <h4 className="font-bold text-white text-xs leading-snug">{toast.title}</h4>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
        </div>

        {/* Source info */}
        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
          <span className="truncate max-w-[200px]">{toast.source}</span>

          {toast.action && (
            <button
              onClick={() => {
                onNavigate(
                  toast.action!.tab,
                  toast.action!.date,
                  toast.action!.category,
                  toast.action!.alertId
                );
                onDismiss(toast.id);
              }}
              className="flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-[11px]"
            >
              <span>{toast.action.label}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Progress countdown bar */}
      <div className="h-1 bg-slate-950 w-full overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${getProgressBarColor(toast.type)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
