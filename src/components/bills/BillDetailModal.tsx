import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Calendar, CheckCircle, 
  Clock, ExternalLink, Shield, FileCheck, ArrowRight,
  Hash, Briefcase, Wallet, User, Building2, MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PartyIdentityCard from '@/components/identity/PartyIdentityCard';

export interface BillDetails {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date?: string | null;
  amount: number;
  currency?: string;
  description?: string | null;
  work_description?: string | null;
  contract_reference?: string | null;
  work_start_date?: string | null;
  work_end_date?: string | null;
  delivery_date?: string | null;
  status: string;
  invoice_document_url?: string | null;
  created_at: string;
  
  // Supplier info
  supplier_id: string;
  supplier_name?: string;
  supplier_company?: string;
  supplier_address?: string;
  supplier_registration?: string;
  supplier_tax_id?: string;
  supplier_bank_name?: string;
  supplier_bank_account?: string;
  
  // MDA info
  mda_id: string;
  mda_name?: string;
  mda_code?: string;
  
  // SPV offer details
  spv_id?: string | null;
  spv_name?: string;
  offer_amount?: number | null;
  offer_discount_rate?: number | null;
  offer_date?: string | null;
  offer_accepted_date?: string | null;
  
  // MDA approval details
  mda_approved_by?: string | null;
  mda_approved_date?: string | null;
  mda_notes?: string | null;
  payment_quarters?: number | null;
  payment_start_quarter?: string | null;
  payment_terms?: any;
  agreement_date?: string | null;
  agreement_document_url?: string | null;
  
  // Treasury certification
  treasury_certified_by?: string | null;
  treasury_certified_date?: string | null;
  certificate_number?: string | null;
  certificate_document_url?: string | null;
}

interface BillDetailModalProps {
  bill: BillDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionButton?: React.ReactNode;
}

const statusConfig: Record<string, { label: string; color: string; step: number }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', step: 1 },
  under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', step: 1 },
  offer_made: { label: 'Offer Made', color: 'bg-purple-100 text-purple-700', step: 2 },
  offer_accepted: { label: 'Offer Accepted', color: 'bg-purple-100 text-purple-700', step: 3 },
  mda_reviewing: { label: 'MDA Reviewing', color: 'bg-orange-100 text-orange-700', step: 4 },
  mda_approved: { label: 'MDA Approved', color: 'bg-green-100 text-green-700', step: 5 },
  terms_set: { label: 'Terms Set', color: 'bg-green-100 text-green-700', step: 5 },
  agreement_sent: { label: 'Agreement Sent', color: 'bg-green-100 text-green-700', step: 6 },
  treasury_reviewing: { label: 'Treasury Reviewing', color: 'bg-amber-100 text-amber-700', step: 7 },
  certified: { label: 'Certified', color: 'bg-emerald-100 text-emerald-700', step: 8 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', step: 0 },
};

const workflowSteps = [
  { step: 1, title: 'Bill Submitted', description: 'Supplier submits invoice' },
  { step: 2, title: 'SPV Offer', description: 'SPV makes purchase offer' },
  { step: 3, title: 'Offer Accepted', description: 'Supplier accepts offer' },
  { step: 4, title: 'Deed of Assignment', description: 'Supplier assigns debt to SPV' },
  { step: 5, title: 'MDA Authorization', description: 'MDA approves & sets payment terms' },
  { step: 6, title: 'Letter of Authorization', description: 'MDA authorizes Treasury payment' },
  { step: 7, title: 'Treasury Review', description: 'Treasury reviews authorization' },
  { step: 8, title: 'Letter of Commitment', description: 'Treasury commits to payment schedule' },
];

const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon?: any }) => (
  <div className="flex items-start gap-3 py-2">
    {Icon && <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
    </div>
  </div>
);

const BillDetailModal = ({ bill, open, onOpenChange, actionButton }: BillDetailModalProps) => {
  if (!bill) return null;

  const currentStep = statusConfig[bill.status]?.step || 0;
  const statusInfo = statusConfig[bill.status] || { label: bill.status, color: 'bg-gray-100 text-gray-700', step: 0 };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b bg-secondary/30">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {bill.invoice_number}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Bill details and workflow progress
              </DialogDescription>
            </div>
            <Badge className={cn("text-xs px-3 py-1", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
          
          {/* Amount Header */}
          <div className="mt-4 flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Invoice Amount</p>
              <p className="text-2xl font-bold text-foreground">
                KES {Number(bill.amount).toLocaleString()}
              </p>
            </div>
            {bill.offer_amount && (
              <>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">SPV Offer</p>
                  <p className="text-2xl font-bold text-accent">
                    KES {Number(bill.offer_amount).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1">
          <div className="px-6 border-b">
            <TabsList className="bg-transparent gap-2 h-12 p-0">
              <TabsTrigger value="details" className="data-[state=active]:bg-secondary rounded-t-lg">
                Bill Details
              </TabsTrigger>
              <TabsTrigger value="workflow" className="data-[state=active]:bg-secondary rounded-t-lg">
                Workflow Progress
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-secondary rounded-t-lg">
                Documents
              </TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="h-[400px]">
            <TabsContent value="details" className="p-6 pt-4 m-0 space-y-6">
              {/* Invoice Information */}
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  Invoice Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 bg-secondary/30 rounded-lg p-4">
                  <InfoRow label="Invoice Number" value={bill.invoice_number} icon={Hash} />
                  <InfoRow label="Invoice Date" value={bill.invoice_date ? format(new Date(bill.invoice_date), 'PPP') : '—'} icon={Calendar} />
                  <InfoRow label="Due Date" value={bill.due_date ? format(new Date(bill.due_date), 'PPP') : '—'} icon={Calendar} />
                  <InfoRow label="Contract Reference" value={bill.contract_reference || '—'} icon={Briefcase} />
                  <InfoRow label="Currency" value={bill.currency || 'KES'} icon={Wallet} />
                  <InfoRow label="Submitted" value={bill.created_at ? format(new Date(bill.created_at), 'PPP') : '—'} icon={Clock} />
                </div>
                {bill.description && (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Description</p>
                    <p className="text-sm">{bill.description}</p>
                  </div>
                )}
                {bill.work_description && (
                  <div className="mt-3 p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Work Description</p>
                    <p className="text-sm">{bill.work_description}</p>
                  </div>
                )}
              </div>

              <Separator />
              
              {/* Transaction Parties */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Transaction Parties</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supplier (Assignor) */}
                  <PartyIdentityCard
                    party={{
                      role: 'supplier',
                      name: bill.supplier_name,
                      company: bill.supplier_company,
                      registration: bill.supplier_registration,
                      taxId: bill.supplier_tax_id,
                      address: bill.supplier_address,
                      bankName: bill.supplier_bank_name,
                      bankAccount: bill.supplier_bank_account,
                      isVerified: !!bill.supplier_registration,
                    }}
                    variant="detailed"
                    label="Supplier (Assignor)"
                  />
                  
                  {/* MDA (Debtor) */}
                  <PartyIdentityCard
                    party={{
                      role: 'mda',
                      mdaName: bill.mda_name,
                      mdaCode: bill.mda_code,
                      isVerified: true,
                    }}
                    variant="detailed"
                    label="MDA (Debtor)"
                  />
                </div>
              </div>
              
              {/* SPV Offer Details - Show if offer made */}
              {bill.offer_amount && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4" />
                      SPV Offer (Assignee)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <InfoRow label="SPV Name" value={bill.spv_name || '—'} icon={Building2} />
                      <InfoRow label="Offer Amount" value={`KES ${Number(bill.offer_amount).toLocaleString()}`} icon={Wallet} />
                      <InfoRow label="Discount Rate" value={bill.offer_discount_rate ? `${bill.offer_discount_rate}%` : '—'} icon={Hash} />
                      <InfoRow label="Offer Date" value={bill.offer_date ? format(new Date(bill.offer_date), 'PPP') : '—'} icon={Calendar} />
                      {bill.offer_accepted_date && (
                        <InfoRow label="Accepted Date" value={format(new Date(bill.offer_accepted_date), 'PPP')} icon={CheckCircle} />
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase mb-1">
                        Deed of Assignment
                      </p>
                      <p className="text-sm text-muted-foreground">
                        By accepting this offer, the Supplier (Assignor) assigns the debt of KES {Number(bill.amount).toLocaleString()} 
                        owed by {bill.mda_name || 'the MDA'} to the SPV (Assignee) for a consideration of KES {Number(bill.offer_amount).toLocaleString()}.
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {/* MDA Approval Details */}
              {bill.mda_approved_date && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4" />
                      MDA Authorization
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <InfoRow label="Approved Date" value={format(new Date(bill.mda_approved_date), 'PPP')} icon={Calendar} />
                      <InfoRow label="Payment Quarters" value={bill.payment_quarters ? `${bill.payment_quarters} quarters` : '—'} icon={Clock} />
                      <InfoRow label="Start Quarter" value={bill.payment_start_quarter || '—'} icon={Calendar} />
                      {bill.payment_quarters && (
                        <InfoRow 
                          label="Quarterly Amount" 
                          value={`KES ${(Number(bill.amount) / bill.payment_quarters).toLocaleString()}`}
                          icon={Wallet} 
                        />
                      )}
                    </div>
                    {bill.mda_notes && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">MDA Notes</p>
                        <p className="text-sm">{bill.mda_notes}</p>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase mb-1">
                        Letter of Authorization
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {bill.mda_name || 'The MDA'} hereby authorizes the National Treasury to prioritize the payment of 
                        the outstanding bill owed to the verified supplier from the FY2026/27 National Budget, 
                        in accordance with the provisions of the current financial management framework.
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {/* Treasury Certification */}
              {bill.treasury_certified_date && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" />
                      Treasury Certification
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                      <InfoRow label="Certificate Number" value={bill.certificate_number || '—'} icon={Hash} />
                      <InfoRow label="Certified Date" value={format(new Date(bill.treasury_certified_date), 'PPP')} icon={Calendar} />
                    </div>
                    <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase mb-1">
                        Letter of Commitment
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This serves as formal commitment from the National Treasury to prioritize the payment of 
                        the outstanding verified bill of KES {Number(bill.amount).toLocaleString()} from the FY2026/27
                        National Budget according to the attached payment plan 
                        ({bill.payment_quarters} quarterly installments starting {bill.payment_start_quarter}).
                      </p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="workflow" className="p-6 pt-4 m-0">
              <div className="space-y-1">
                {workflowSteps.map((step, index) => {
                  const isCompleted = currentStep >= step.step;
                  const isCurrent = currentStep === step.step;
                  const isRejected = bill.status === 'rejected';
                  
                  return (
                    <div key={step.step} className="relative">
                      {index < workflowSteps.length - 1 && (
                        <div 
                          className={cn(
                            "absolute left-4 top-10 w-0.5 h-12",
                            isCompleted && !isRejected ? "bg-emerald-500" : "bg-muted"
                          )} 
                        />
                      )}
                      <div className="flex items-start gap-4 py-3">
                        <div 
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                            isRejected ? "bg-red-100 text-red-700" :
                            isCompleted ? "bg-emerald-100 text-emerald-700" :
                            isCurrent ? "bg-accent/20 text-accent ring-2 ring-accent" :
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {isCompleted && !isRejected ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            step.step
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={cn(
                            "font-medium text-sm",
                            isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        </div>
                        {isCurrent && !isRejected && (
                          <Badge className="bg-accent/10 text-accent text-xs">Current</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {bill.status === 'rejected' && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    This bill has been rejected and will not proceed further in the workflow.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="p-6 pt-4 m-0">
              <div className="space-y-3">
                {bill.invoice_document_url && (
                  <a 
                    href={bill.invoice_document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <FileText className="w-8 h-8 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Invoice Document</p>
                      <p className="text-xs text-muted-foreground">Original invoice uploaded by supplier</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
                
                {bill.offer_accepted_date && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <FileCheck className="w-8 h-8 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Deed of Assignment</p>
                      <p className="text-xs text-muted-foreground">Supplier to SPV debt assignment</p>
                    </div>
                    <Badge variant="outline" className="text-purple-600 border-purple-300">Generated</Badge>
                  </div>
                )}
                
                {bill.mda_approved_date && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <FileCheck className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Letter of Authorization</p>
                      <p className="text-xs text-muted-foreground">MDA to Treasury payment authorization</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">Generated</Badge>
                  </div>
                )}
                
                {bill.agreement_document_url && (
                  <a 
                    href={bill.agreement_document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <FileText className="w-8 h-8 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sale Agreement</p>
                      <p className="text-xs text-muted-foreground">Agreement between parties</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
                
                {bill.treasury_certified_date && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <Shield className="w-8 h-8 text-emerald-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Letter of Commitment</p>
                      <p className="text-xs text-muted-foreground">Treasury payment commitment - {bill.certificate_number}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-300">Issued</Badge>
                  </div>
                )}
                
                {!bill.invoice_document_url && !bill.offer_accepted_date && !bill.mda_approved_date && !bill.treasury_certified_date && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No documents available yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {/* Action Footer */}
        {actionButton && (
          <div className="p-4 border-t bg-secondary/30 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {actionButton}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillDetailModal;
