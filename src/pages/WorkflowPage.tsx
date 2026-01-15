import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { transactionSteps, TransactionStep, getStatusColor } from '@/data/mockData';
import { 
  Check, 
  Clock, 
  Users, 
  Building, 
  Landmark, 
  Briefcase, 
  TrendingUp,
  FileText,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const entityIcons = {
  supplier: Users,
  mda: Building,
  treasury: Landmark,
  spv: Briefcase,
  investor: TrendingUp,
};

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
    <div className="min-h-screen bg-background">
      <TopBar 
        title="Transaction Flow" 
        subtitle="Securitization settlement process"
      />
      
      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-foreground">Settlement Progress</h2>
              <p className="text-xs text-muted-foreground">
                {completedSteps} of {transactionSteps.length} steps completed
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{progress.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
            <div 
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Entity Flow */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { type: 'supplier', label: 'Suppliers', sublabel: 'Originator' },
              { type: 'mda', label: 'MDAs', sublabel: 'Obligor' },
              { type: 'treasury', label: 'Treasury', sublabel: 'Fiscal Agent' },
              { type: 'spv', label: 'SPV', sublabel: 'Issuer' },
              { type: 'investor', label: 'Investors', sublabel: 'Buyers' },
            ].map((entity, index) => {
              const Icon = entityIcons[entity.type as keyof typeof entityIcons];
              const isActive = selectedStep.entityType === entity.type;
              
              return (
                <div key={entity.type} className="flex items-center gap-2">
                  <button 
                    className={cn(
                      "flex-1 px-3 py-3 rounded text-center transition-all",
                      entityColors[entity.type as keyof typeof entityColors],
                      isActive && "ring-2 ring-offset-2 ring-offset-background ring-foreground/20"
                    )}
                    onClick={() => {
                      const step = transactionSteps.find(s => s.entityType === entity.type);
                      if (step) setSelectedStep(step);
                    }}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-semibold">{entity.label}</div>
                    <div className="text-xs opacity-75">{entity.sublabel}</div>
                  </button>
                  {index < 4 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps List */}
          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden">
              <div className="p-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Transaction Steps</h3>
              </div>
              
              <div className="divide-y divide-border">
                {transactionSteps.map((step) => (
                  <button
                    key={step.step}
                    onClick={() => setSelectedStep(step)}
                    className={cn(
                      "w-full p-4 text-left transition-all hover:bg-muted/30",
                      selectedStep.step === step.step && "bg-accent/5 border-l-2 border-l-accent"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0",
                        step.status === 'completed' ? 'bg-success text-success-foreground' :
                        step.status === 'active' ? 'bg-accent text-accent-foreground' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {step.status === 'completed' ? <Check className="w-4 h-4" /> : step.step}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h4 className="text-sm font-medium text-foreground">
                            {step.title}
                          </h4>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium",
                            getStatusColor(step.status)
                          )}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs",
                            entityColors[step.entityType]
                          )}>
                            {step.entity}
                          </span>
                          {step.completedDate && (
                            <span className="text-xs text-muted-foreground">✓ {step.completedDate}</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded flex items-center justify-center font-bold text-lg",
                  selectedStep.status === 'completed' ? 'bg-success text-success-foreground' :
                  selectedStep.status === 'active' ? 'bg-accent text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {selectedStep.status === 'completed' ? <Check className="w-5 h-5" /> : selectedStep.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedStep.title}</h3>
                  <p className="text-xs text-muted-foreground">{selectedStep.entity}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{selectedStep.description}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Responsible</p>
                  <p className="text-sm text-foreground">{selectedStep.responsible}</p>
                </div>

                {selectedStep.completedDate && (
                  <div className="p-2.5 bg-success/10 border border-success/20 rounded">
                    <p className="text-xs text-success font-medium">
                      ✓ Completed on {selectedStep.completedDate}
                    </p>
                  </div>
                )}

                {selectedStep.estimatedDate && selectedStep.status !== 'completed' && (
                  <div className="p-2.5 bg-muted border border-border rounded">
                    <p className="text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 inline mr-1" />
                      Estimated: {selectedStep.estimatedDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Required Documents
              </h4>
              <div className="space-y-1.5">
                {selectedStep.documents.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-muted/30 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs text-foreground">{doc}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      selectedStep.status === 'completed' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    )}>
                      {selectedStep.status === 'completed' ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1.5 bg-accent rounded" />
                  <span className="text-xs text-muted-foreground">Action Point</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1.5 bg-destructive rounded" />
                  <span className="text-xs text-muted-foreground">Cash Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
