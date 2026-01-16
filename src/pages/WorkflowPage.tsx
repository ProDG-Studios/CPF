import { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import { TransactionStep, getStatusColor, formatCurrency } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import { 
  Check, Clock, Users, Building, Landmark, Briefcase, TrendingUp, FileText, 
  ArrowRight, ChevronRight, Play, CheckCircle, Download, Printer, Upload,
  AlertCircle, Calendar, User, X, Eye, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DocumentModal } from '@/components/common/DocumentUpload';
import { Progress } from '@/components/ui/progress';

const entityIcons = { supplier: Users, mda: Building, treasury: Landmark, spv: Briefcase, investor: TrendingUp };

const WorkflowPage = () => {
  const { transactionSteps, completeStep, bills, getStats } = useData();
  const [selectedStep, setSelectedStep] = useState<TransactionStep | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentStepId, setDocumentStepId] = useState<string | null>(null);
  const [expandedEntities, setExpandedEntities] = useState<string[]>(['supplier', 'mda', 'treasury', 'spv', 'investor']);
  const [viewMode, setViewMode] = useState<'timeline' | 'cards'>('timeline');

  // Set initial selected step to active step
  useMemo(() => {
    if (!selectedStep) {
      const active = transactionSteps.find(s => s.status === 'active');
      if (active) setSelectedStep(active);
      else setSelectedStep(transactionSteps[0]);
    }
  }, [transactionSteps, selectedStep]);

  const stats = getStats();
  const completedSteps = transactionSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / transactionSteps.length) * 100;
  const activeStep = transactionSteps.find(s => s.status === 'active');
  const pendingSteps = transactionSteps.filter(s => s.status === 'pending').length;

  // Group steps by entity
  const stepsByEntity = useMemo(() => {
    const grouped: Record<string, TransactionStep[]> = {};
    transactionSteps.forEach(step => {
      if (!grouped[step.entityType]) grouped[step.entityType] = [];
      grouped[step.entityType].push(step);
    });
    return grouped;
  }, [transactionSteps]);

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

  const openDocuments = (stepNumber: number) => {
    setDocumentStepId(`step-${stepNumber}`);
    setShowDocumentModal(true);
  };

  const toggleEntityExpanded = (entity: string) => {
    setExpandedEntities(prev => 
      prev.includes(entity) 
        ? prev.filter(e => e !== entity) 
        : [...prev, entity]
    );
  };

  const handleExportWorkflow = () => {
    const content = transactionSteps.map(s => ({
      'Step': s.step,
      'Title': s.title,
      'Status': s.status,
      'Entity': s.entity,
      'Responsible': s.responsible,
      'Completed Date': s.completedDate || '',
      'Estimated Date': s.estimatedDate || '',
      'Documents': s.documents.join('; ')
    }));
    
    const headers = Object.keys(content[0]);
    const csvContent = [
      headers.join(','),
      ...content.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-status-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported to CSV');
  };

  const handlePrintWorkflow = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Workflow Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          .subtitle { color: #666; margin-bottom: 24px; }
          .progress { background: #eee; height: 8px; border-radius: 4px; margin-bottom: 24px; }
          .progress-bar { background: #22c55e; height: 100%; border-radius: 4px; }
          .step { border: 1px solid #e5e5e5; padding: 16px; margin-bottom: 12px; border-radius: 8px; }
          .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
          .step-number { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .completed { background: #dcfce7; color: #16a34a; }
          .active { background: #fef3c7; color: #d97706; }
          .pending { background: #f3f4f6; color: #6b7280; }
          .step-title { font-weight: 600; font-size: 14px; }
          .step-desc { color: #666; font-size: 13px; margin-bottom: 8px; }
          .step-meta { font-size: 12px; color: #888; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .stat { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; }
          .stat-label { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <h1>Transaction Workflow Report</h1>
        <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value">${completedSteps}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat">
            <div class="stat-value">${activeStep ? 1 : 0}</div>
            <div class="stat-label">In Progress</div>
          </div>
          <div class="stat">
            <div class="stat-value">${pendingSteps}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
        
        <div class="progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
        </div>
        
        ${transactionSteps.map(step => `
          <div class="step">
            <div class="step-header">
              <div class="step-number ${step.status}">${step.status === 'completed' ? '✓' : step.step}</div>
              <div class="step-title">${step.title}</div>
              <span class="badge ${step.status}">${step.status}</span>
            </div>
            <div class="step-desc">${step.description}</div>
            <div class="step-meta">
              <strong>Entity:</strong> ${step.entity} | 
              <strong>Responsible:</strong> ${step.responsible}
              ${step.completedDate ? ` | <strong>Completed:</strong> ${step.completedDate}` : ''}
              ${step.estimatedDate && step.status !== 'completed' ? ` | <strong>Est:</strong> ${step.estimatedDate}` : ''}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    toast.success('Print dialog opened');
  };

  const handleCompleteAllPending = () => {
    if (!activeStep) {
      toast.error('No active step to complete');
      return;
    }
    handleCompleteStep(activeStep);
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        title="Transaction Workflow" 
        subtitle={`${completedSteps}/${transactionSteps.length} steps complete • ${progress.toFixed(0)}% progress`} 
      />
      
      <div className="p-6 space-y-6">
        {/* Progress Overview */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-foreground">Securitization Settlement Progress</h2>
              <p className="text-xs text-muted-foreground">Track the complete transaction lifecycle from bill verification to investor settlement</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-secondary rounded-md">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    "px-3 py-1 text-xs rounded transition-colors",
                    viewMode === 'timeline' ? "bg-card shadow-sm" : "hover:bg-card/50"
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={cn(
                    "px-3 py-1 text-xs rounded transition-colors",
                    viewMode === 'cards' ? "bg-card shadow-sm" : "hover:bg-card/50"
                  )}
                >
                  Cards
                </button>
              </div>
              
              <button
                onClick={handleExportWorkflow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handlePrintWorkflow}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              {activeStep && (
                <button
                  onClick={() => handleCompleteStep(activeStep)}
                  className="px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Step {activeStep.step}
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>{completedSteps} completed</span>
              <span>{pendingSteps} pending</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Completed', value: completedSteps, icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
              { label: 'In Progress', value: activeStep ? 1 : 0, icon: RefreshCw, color: 'text-accent', bgColor: 'bg-accent/10' },
              { label: 'Pending', value: pendingSteps, icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-secondary' },
              { label: 'Bills Ready', value: stats.verifiedBills, icon: FileText, color: 'text-primary', bgColor: 'bg-primary/10' },
            ].map(stat => (
              <div key={stat.label} className={cn("p-3 rounded-lg", stat.bgColor)}>
                <div className="flex items-center gap-2">
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                  <div>
                    <p className={cn("text-lg font-semibold", stat.color)}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Entity Flow */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { type: 'supplier', label: 'Suppliers', sub: 'Originator' },
              { type: 'mda', label: 'MDAs', sub: 'Obligor' },
              { type: 'treasury', label: 'Treasury', sub: 'Fiscal Agent' },
              { type: 'spv', label: 'SPV', sub: 'Issuer' },
              { type: 'investor', label: 'Investors', sub: 'Buyers' },
            ].map((entity, i) => {
              const Icon = entityIcons[entity.type as keyof typeof entityIcons];
              const isActive = selectedStep?.entityType === entity.type;
              const entitySteps = stepsByEntity[entity.type] || [];
              const entityCompleted = entitySteps.filter(s => s.status === 'completed').length;
              const entityTotal = entitySteps.length;
              const entityProgress = entityTotal > 0 ? (entityCompleted / entityTotal) * 100 : 0;
              
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
                      const step = entitySteps[0];
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
                    <div className="mt-2 h-1 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all" 
                        style={{ width: `${entityProgress}%` }} 
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{entityCompleted}/{entityTotal}</div>
                  </button>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps List */}
          <div className="lg:col-span-2 glass-card overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Transaction Steps</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedEntities(expandedEntities.length === 5 ? [] : ['supplier', 'mda', 'treasury', 'spv', 'investor'])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedEntities.length === 5 ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>
            
            {viewMode === 'timeline' ? (
              <div className="divide-y divide-border">
                {Object.entries(stepsByEntity).map(([entityType, steps]) => {
                  const Icon = entityIcons[entityType as keyof typeof entityIcons];
                  const isExpanded = expandedEntities.includes(entityType);
                  const entityCompleted = steps.filter(s => s.status === 'completed').length;
                  
                  return (
                    <div key={entityType}>
                      <button
                        onClick={() => toggleEntityExpanded(entityType)}
                        className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium capitalize">{entityType}</span>
                          <span className="text-xs text-muted-foreground">({entityCompleted}/{steps.length})</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t border-border/50">
                          {steps.map((step) => (
                            <button
                              key={step.step}
                              onClick={() => setSelectedStep(step)}
                              className={cn(
                                "w-full p-3 pl-10 text-left transition-colors hover:bg-secondary/50 border-l-2",
                                selectedStep?.step === step.step && "bg-secondary",
                                step.status === 'completed' ? 'border-l-success' :
                                step.status === 'active' ? 'border-l-accent' : 'border-l-transparent'
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
                                    {step.completedDate && <span className="text-xs text-success">✓ {step.completedDate}</span>}
                                    {step.estimatedDate && step.status !== 'completed' && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {step.estimatedDate}
                                      </span>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {step.documents.length} docs
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 grid grid-cols-2 gap-3">
                {transactionSteps.map((step) => (
                  <button
                    key={step.step}
                    onClick={() => setSelectedStep(step)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all hover:shadow-md",
                      selectedStep?.step === step.step ? "border-accent bg-accent/5" : "border-border",
                      step.status === 'completed' && "bg-success/5",
                      step.status === 'active' && "bg-accent/5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                        step.status === 'completed' ? 'bg-success/10 text-success' :
                        step.status === 'active' ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground'
                      )}>
                        {step.status === 'completed' ? <Check className="w-3 h-3" /> : step.step}
                      </div>
                      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", getStatusColor(step.status))}>{step.status}</span>
                    </div>
                    <h4 className="text-sm font-medium text-foreground mb-1">{step.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{step.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step Details */}
          <div className="space-y-4">
            {selectedStep && (
              <>
                <div className="glass-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center font-semibold border",
                      selectedStep.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                      selectedStep.status === 'active' ? 'bg-accent/10 text-accent border-accent/20' : 'bg-secondary text-muted-foreground border-border'
                    )}>
                      {selectedStep.status === 'completed' ? <Check className="w-4 h-4" /> : selectedStep.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{selectedStep.title}</h3>
                      <p className="text-xs text-muted-foreground">{selectedStep.entity}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{selectedStep.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Responsible</p>
                        <p className="text-sm font-medium text-foreground">{selectedStep.responsible}</p>
                      </div>
                    </div>
                    
                    {selectedStep.estimatedDate && selectedStep.status !== 'completed' && (
                      <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Estimated Completion</p>
                          <p className="text-sm font-medium text-foreground">{selectedStep.estimatedDate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Messages */}
                  {selectedStep.completedDate && (
                    <div className="mt-4 p-2.5 bg-success/10 rounded-md">
                      <p className="text-xs text-success font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed on {selectedStep.completedDate}
                      </p>
                    </div>
                  )}

                  {selectedStep.status === 'pending' && (
                    <div className="mt-4 p-2.5 bg-secondary rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Waiting for previous steps to complete
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    {selectedStep.status === 'active' && (
                      <button
                        onClick={() => handleCompleteStep(selectedStep)}
                        className="w-full px-4 py-2 bg-success text-success-foreground rounded-md text-sm font-medium hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => openDocuments(selectedStep.step)}
                      className="w-full px-4 py-2 bg-secondary text-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Manage Documents
                    </button>
                  </div>
                </div>

                {/* Documents */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Required Documents
                  </h4>
                  <div className="space-y-1.5">
                    {selectedStep.documents.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                        <span className="text-xs text-foreground">{doc}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          selectedStep.status === 'completed' ? 'bg-success/10 text-success' : 'bg-secondary text-muted-foreground'
                        )}>
                          {selectedStep.status === 'completed' ? 'Done' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => openDocuments(selectedStep.step)}
                    className="w-full mt-3 px-3 py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Documents
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Quick Navigation</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        const active = transactionSteps.find(s => s.status === 'active');
                        if (active) setSelectedStep(active);
                        else toast.info('No active step');
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
                        else toast.info('No completed steps yet');
                      }}
                      className="w-full px-3 py-2 bg-secondary text-muted-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Last Completed Step
                    </button>
                    <button 
                      onClick={() => {
                        const nextPending = transactionSteps.find(s => s.status === 'pending');
                        if (nextPending) setSelectedStep(nextPending);
                        else toast.success('All steps completed!');
                      }}
                      className="w-full px-3 py-2 bg-secondary text-muted-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Next Pending Step
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {documentStepId && (
        <DocumentModal
          isOpen={showDocumentModal}
          onClose={() => { setShowDocumentModal(false); setDocumentStepId(null); }}
          entityType="step"
          entityId={documentStepId}
          title={`Documents for Step ${documentStepId.replace('step-', '')}`}
        />
      )}
    </div>
  );
};

export default WorkflowPage;
