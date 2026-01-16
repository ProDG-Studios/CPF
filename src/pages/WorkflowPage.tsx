import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { TransactionStep, getStatusColor } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { Check, Clock, Users, Building, Landmark, Briefcase, TrendingUp, FileText, ArrowRight, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const entityIcons = { supplier: Users, mda: Building, treasury: Landmark, spv: Briefcase, investor: TrendingUp };

const WorkflowPage = () => {
  const { transactionSteps, completeStep } = useData();
  const [selectedStep, setSelectedStep] = useState<TransactionStep>(transactionSteps[5]); // Default to active step

  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / transactionSteps.length) * 100;
  const activeStep = transactionSteps.find(s => s.status === 'active');

  const handleCompleteStep = (step: TransactionStep) => {
    if (step.status !== 'active') {
      toast.error('Only the active step can be completed');
      return;
    }
    completeStep(step.step);
    toast.success(`"${step.title}" completed successfully`);
    
    // Move selection to next step
    const nextStep = transactionSteps.find(s => s.step === step.step + 1);
    if (nextStep) {
      setSelectedStep({ ...nextStep, status: 'active' });
    }
  };

  const handleActivateStep = (step: TransactionStep) => {
    if (step.status !== 'pending') {
      toast.error('This step is already active or completed');
      return;
    }
    // Check if previous step is completed
    const prevStep = transactionSteps.find(s => s.step === step.step - 1);
    if (prevStep && prevStep.status !== 'completed') {
      toast.error('Previous step must be completed first');
      return;
    }
  };

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
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-semibold text-foreground">{progress.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
              {activeStep && (
                <button
                  onClick={() => handleCompleteStep(activeStep)}
                  className="px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Current Step
                </button>
              )}
            </div>
          </div>

          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-5">
            <div 
              className="h-full bg-success rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }} 
            />
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
              const entitySteps = transactionSteps.filter(s => s.entityType === entity.type);
              const entityCompleted = entitySteps.filter(s => s.status === 'completed').length;
              const entityTotal = entitySteps.length;
              
              return (
                <div key={entity.type} className="flex items-center gap-1">
                  <button
                    className={cn(
                      "flex-1 px-2 py-3 rounded-md text-center transition-all border relative",
                      isActive 
                        ? "bg-secondary border-accent" 
                        : "bg-card border-border hover:bg-secondary/50"
                    )}
                    onClick={() => {
                      const step = transactionSteps.find(s => s.entityType === entity.type);
                      if (step) setSelectedStep(step);
                    }}
                  >
                    {entityCompleted === entityTotal && entityTotal > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-success-foreground" />
                      </div>
                    )}
                    <Icon className={cn("w-4 h-4 mx-auto mb-1", isActive ? "text-accent" : "text-muted-foreground")} />
                    <div className="text-xs font-medium text-foreground">{entity.label}</div>
                    <div className="text-xs text-muted-foreground">{entity.sub}</div>
                    <div className="text-xs text-muted-foreground mt-1">{entityCompleted}/{entityTotal}</div>
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
                    selectedStep.step === step.step && "bg-secondary"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 border",
                      step.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                      step.status === 'active' ? 'bg-accent/10 text-accent border-accent/20 animate-pulse' : 'bg-secondary text-muted-foreground border-border'
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
                        <span className="px-1.5 py-0.5 rounded text-xs bg-secondary text-muted-foreground">{step.entity}</span>
                        {step.completedDate && <span className="text-xs text-success">✓ {step.completedDate}</span>}
                        {step.estimatedDate && step.status !== 'completed' && (
                          <span className="text-xs text-muted-foreground">Est: {step.estimatedDate}</span>
                        )}
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
                  "w-9 h-9 rounded-md flex items-center justify-center font-semibold border",
                  selectedStep.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                  selectedStep.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-secondary text-muted-foreground border-border'
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

              {/* Action Button */}
              {selectedStep.status === 'active' && (
                <button
                  onClick={() => handleCompleteStep(selectedStep)}
                  className="w-full mt-4 px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark as Complete
                </button>
              )}

              {selectedStep.status === 'pending' && (
                <div className="mt-4 p-2.5 bg-secondary rounded-md">
                  <p className="text-xs text-muted-foreground text-center">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Waiting for previous steps to complete
                  </p>
                </div>
              )}

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

            {/* Quick Actions */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    const active = transactionSteps.find(s => s.status === 'active');
                    if (active) setSelectedStep(active);
                  }}
                  className="w-full px-3 py-2 bg-accent/10 text-accent rounded-md text-sm font-medium hover:bg-accent/20 transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Go to Active Step
                </button>
                <button 
                  onClick={() => {
                    const lastCompleted = [...transactionSteps].reverse().find(s => s.status === 'completed');
                    if (lastCompleted) setSelectedStep(lastCompleted);
                  }}
                  className="w-full px-3 py-2 bg-secondary text-muted-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Last Completed Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
