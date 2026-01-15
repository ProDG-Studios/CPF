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
  supplier: 'bg-destructive hover:bg-destructive/90',
  mda: 'bg-accent hover:bg-accent/90 text-accent-foreground',
  treasury: 'bg-primary hover:bg-primary/90',
  spv: 'bg-secondary hover:bg-secondary/90',
  investor: 'bg-success hover:bg-success/90',
};

const WorkflowPage = () => {
  const [selectedStep, setSelectedStep] = useState<TransactionStep>(transactionSteps[3]);
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow');

  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / transactionSteps.length) * 100;

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Transaction Flow" 
        subtitle="Securitization settlement process"
      />
      
      <div className="p-6">
        {/* Progress Overview */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Settlement Progress
              </h2>
              <p className="text-muted-foreground">
                {completedSteps} of {transactionSteps.length} steps completed
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('flow')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'flow' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                Flow View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                List View
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative mb-8">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success via-accent to-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute top-0 left-0 w-full flex justify-between px-2 -translate-y-6">
              {transactionSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => setSelectedStep(step)}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step.status === 'completed' ? 'bg-success text-success-foreground' :
                    step.status === 'active' ? 'bg-accent text-accent-foreground animate-pulse' :
                    'bg-muted text-muted-foreground'
                  )}>
                    {step.status === 'completed' ? <Check className="w-4 h-4" /> : step.step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entity Flow */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { type: 'supplier', label: 'Suppliers', sublabel: '(Originator)' },
              { type: 'mda', label: 'MDAs', sublabel: '(Obligor)' },
              { type: 'treasury', label: 'National Treasury', sublabel: '(Fiscal Agent)' },
              { type: 'spv', label: 'SPV', sublabel: '(Issuer)' },
              { type: 'investor', label: 'Investors', sublabel: '' },
            ].map((entity, index) => {
              const Icon = entityIcons[entity.type as keyof typeof entityIcons];
              const isActive = selectedStep.entityType === entity.type;
              
              return (
                <div key={entity.type} className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "flex-1 px-4 py-4 rounded-xl text-center text-white transition-all cursor-pointer",
                      entityColors[entity.type as keyof typeof entityColors],
                      isActive && "ring-2 ring-offset-2 ring-offset-background ring-white scale-105"
                    )}
                    onClick={() => {
                      const step = transactionSteps.find(s => s.entityType === entity.type);
                      if (step) setSelectedStep(step);
                    }}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-semibold">{entity.label}</div>
                    {entity.sublabel && (
                      <div className="text-xs opacity-80">{entity.sublabel}</div>
                    )}
                  </div>
                  {index < 4 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 hidden md:block" />
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
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold">Transaction Steps</h3>
              </div>
              
              <div className="divide-y divide-border">
                {transactionSteps.map((step) => (
                  <div
                    key={step.step}
                    onClick={() => setSelectedStep(step)}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:bg-muted/30",
                      selectedStep.step === step.step && "bg-primary/10 border-l-4 border-primary"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
                        step.status === 'completed' ? 'bg-success text-success-foreground' :
                        step.status === 'active' ? 'bg-accent text-accent-foreground' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {step.status === 'completed' ? <Check className="w-5 h-5" /> : step.step}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-foreground">
                            {step.title}
                          </h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            getStatusColor(step.status)
                          )}>
                            {step.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {step.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-white",
                            entityColors[step.entityType]
                          )}>
                            {step.entity}
                          </span>
                          {step.completedDate && (
                            <span>✓ Completed: {step.completedDate}</span>
                          )}
                          {step.estimatedDate && step.status !== 'completed' && (
                            <span>Est: {step.estimatedDate}</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                  selectedStep.status === 'completed' ? 'bg-success text-success-foreground' :
                  selectedStep.status === 'active' ? 'bg-accent text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {selectedStep.status === 'completed' ? <Check /> : selectedStep.step}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">{selectedStep.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStep.entity}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6">{selectedStep.description}</p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Responsible</p>
                  <p className="text-sm text-muted-foreground">{selectedStep.responsible}</p>
                </div>

                {selectedStep.completedDate && (
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-sm text-success font-medium">
                      ✓ Completed on {selectedStep.completedDate}
                    </p>
                  </div>
                )}

                {selectedStep.estimatedDate && selectedStep.status !== 'completed' && (
                  <div className="p-3 bg-muted border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Estimated: {selectedStep.estimatedDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Required Documents
              </h4>
              <div className="space-y-2">
                {selectedStep.documents.map((doc, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <span className="text-sm">{doc}</span>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      selectedStep.status === 'completed' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                    )}>
                      {selectedStep.status === 'completed' ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="glass-card p-6">
              <h4 className="font-semibold mb-4">Legend</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-2 bg-accent rounded" />
                  <span className="text-sm text-muted-foreground">Action Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-2 bg-destructive rounded" />
                  <span className="text-sm text-muted-foreground">Cash Flow Movement</span>
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
