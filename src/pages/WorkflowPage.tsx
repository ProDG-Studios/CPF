import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { transactionSteps, TransactionStep, getStatusColor } from '@/data/mockData';
import { Check, Clock, Users, Building, Landmark, Briefcase, TrendingUp, FileText, ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const entityIcons = { supplier: Users, mda: Building, treasury: Landmark, spv: Briefcase, investor: TrendingUp };
const entityColors = {
  supplier: 'bg-destructive text-destructive-foreground',
  mda: 'bg-accent text-accent-foreground',
  treasury: 'bg-primary text-primary-foreground',
  spv: 'bg-warning text-warning-foreground',
  investor: 'bg-success text-success-foreground',
};

const WorkflowPage = () => {
  const [selectedStep, setSelectedStep] = useState<TransactionStep>(transactionSteps[3]);
  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / transactionSteps.length) * 100;

  return (
    <div className="min-h-screen">
      <TopBar title="Transaction Flow" subtitle="Securitization settlement process" />
      
      <div className="p-6 space-y-6">
        {/* Progress */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Settlement Progress</h2>
              <p className="text-xs text-muted-foreground">{completedSteps} of {transactionSteps.length} steps completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold text-foreground">{progress.toFixed(0)}%</p>
            </div>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-5">
            <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
          </div>

          {/* Entities */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { type: 'supplier', label: 'Suppliers', sub: 'Originator' },
              { type: 'mda', label: 'MDAs', sub: 'Obligor' },
              { type: 'treasury', label: 'Treasury', sub: 'Fiscal Agent' },
              { type: 'spv', label: 'SPV', sub: 'Issuer' },
              { type: 'investor', label: 'Investors', sub: 'Buyers' },
            ].map((entity, i) => {
              const Icon = entityIcons[entity.type as keyof typeof entityIcons];
              const isActive = selectedStep.entityType === entity.type;
              return (
                <div key={entity.type} className="flex items-center gap-1">
                  <button
                    className={cn(
                      "flex-1 px-2 py-3 rounded-md text-center transition-all",
                      entityColors[entity.type as keyof typeof entityColors],
                      isActive && "ring-2 ring-offset-2 ring-offset-background ring-foreground/20"
                    )}
                    onClick={() => {
                      const step = transactionSteps.find(s => s.entityType === entity.type);
                      if (step) setSelectedStep(step);
                    }}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{entity.label}</div>
                    <div className="text-xs opacity-75">{entity.sub}</div>
                  </button>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Transaction Steps</h3>
            </div>
            <div className="divide-y divide-border">
              {transactionSteps.map((step) => (
                <button
                  key={step.step}
                  onClick={() => setSelectedStep(step)}
                  className={cn(
                    "w-full p-3 text-left transition-colors hover:bg-secondary/50",
                    selectedStep.step === step.step && "bg-accent/5 border-l-2 border-l-accent"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                      step.status === 'completed' ? 'bg-success text-success-foreground' :
                      step.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                    )}>
                      {step.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-foreground">{step.title}</h4>
                        <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", getStatusColor(step.status))}>{step.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{step.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-xs", entityColors[step.entityType])}>{step.entity}</span>
                        {step.completedDate && <span className="text-xs text-muted-foreground">✓ {step.completedDate}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-9 h-9 rounded-md flex items-center justify-center font-semibold",
                  selectedStep.status === 'completed' ? 'bg-success text-success-foreground' :
                  selectedStep.status === 'active' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
                )}>
                  {selectedStep.status === 'completed' ? <Check className="w-4 h-4" /> : selectedStep.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedStep.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedStep.entity}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedStep.description}</p>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Responsible</p>
                <p className="text-sm text-foreground">{selectedStep.responsible}</p>
              </div>
              {selectedStep.completedDate && (
                <div className="mt-3 p-2.5 bg-success/10 rounded-md">
                  <p className="text-xs text-success font-medium">✓ Completed {selectedStep.completedDate}</p>
                </div>
              )}
              {selectedStep.estimatedDate && selectedStep.status !== 'completed' && (
                <div className="mt-3 p-2.5 bg-secondary rounded-md">
                  <p className="text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5 inline mr-1" />Est: {selectedStep.estimatedDate}</p>
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />Documents
              </h4>
              <div className="space-y-1.5">
                {selectedStep.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                    <span className="text-xs text-foreground">{doc}</span>
                    <span className={cn("text-xs px-1.5 py-0.5 rounded", selectedStep.status === 'completed' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground')}>
                      {selectedStep.status === 'completed' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
