import React from 'react';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

export interface WorkflowStepItem {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  stepTitle: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  subtitle?: string;
  badge?: string;
  date?: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStepItem[];
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (step: WorkflowStepItem) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  steps,
  orientation = 'horizontal',
  onStepClick
}) => {
  if (orientation === 'vertical') {
    return (
      <div id="workflow-stepper-vertical" className="relative pl-6 space-y-6">
        <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-slate-800" />
        {steps.map((step) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isFailed = step.status === 'failed';

          return (
            <div
              key={step.id}
              onClick={() => onStepClick?.(step)}
              className={`relative flex items-start gap-4 text-left transition-all ${
                onStepClick ? 'cursor-pointer hover:opacity-90' : ''
              }`}
            >
              <div
                className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : isCurrent
                    ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/20 animate-pulse'
                    : isFailed
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : isFailed ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <span>{step.phaseNumber}</span>
                )}
              </div>

              <div className="flex-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
                    Phase {step.phaseNumber}: {step.phaseTitle}
                  </span>
                  {step.date && <span className="text-[11px] text-slate-500">{step.date}</span>}
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">{step.stepTitle}</div>
                {step.subtitle && <div className="text-xs text-slate-400 mt-1">{step.subtitle}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  return (
    <div id="workflow-stepper-horizontal" className="w-full overflow-x-auto pb-3">
      <div className="flex items-center min-w-[760px] gap-2">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isFailed = step.status === 'failed';

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick?.(step)}
                className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                    : isCompleted
                    ? 'bg-slate-900/70 border-emerald-500/30'
                    : isFailed
                    ? 'bg-rose-950/30 border-rose-500/40'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                    Phase {step.phaseNumber}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
                  {isFailed && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                </div>
                <div className="text-xs font-medium text-slate-200 truncate">{step.phaseTitle}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{step.stepTitle}</div>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-4 shrink-0 transition-colors ${
                    isCompleted ? 'bg-emerald-500/60' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
