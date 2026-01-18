import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, FileCheck, Calendar, Wallet, AlertCircle, Building2 } from 'lucide-react';

interface MDAAuthorizationFormProps {
  billAmount: number;
  invoiceNumber: string;
  offerAmount?: number | null;
  supplierCompany?: string;
  mdaName?: string;
  onSubmit: (paymentQuarters: number, startQuarter: string, notes: string) => void;
  submitting?: boolean;
}

const quarters = [
  { value: 'Q1 2025', label: 'Q1 2025 (Jan-Mar)' },
  { value: 'Q2 2025', label: 'Q2 2025 (Apr-Jun)' },
  { value: 'Q3 2025', label: 'Q3 2025 (Jul-Sep)' },
  { value: 'Q4 2025', label: 'Q4 2025 (Oct-Dec)' },
  { value: 'Q1 2026', label: 'Q1 2026 (Jan-Mar)' },
  { value: 'Q2 2026', label: 'Q2 2026 (Apr-Jun)' },
];

const MDAAuthorizationForm = ({ 
  billAmount, 
  invoiceNumber,
  offerAmount,
  supplierCompany,
  mdaName,
  onSubmit, 
  submitting 
}: MDAAuthorizationFormProps) => {
  const [paymentQuarters, setPaymentQuarters] = useState('4');
  const [startQuarter, setStartQuarter] = useState('Q1 2025');
  const [notes, setNotes] = useState('');
  const [confirmedDebt, setConfirmedDebt] = useState(false);
  const [authorizedPayment, setAuthorizedPayment] = useState(false);

  const quarterlyAmount = billAmount / parseInt(paymentQuarters);
  const canSubmit = confirmedDebt && authorizedPayment;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(parseInt(paymentQuarters), startQuarter, notes);
  };

  // Generate payment schedule
  const getPaymentSchedule = () => {
    const schedule = [];
    const [q, year] = startQuarter.split(' ');
    let currentQuarter = parseInt(q.replace('Q', ''));
    let currentYear = parseInt(year);
    
    for (let i = 0; i < parseInt(paymentQuarters); i++) {
      schedule.push({
        quarter: `Q${currentQuarter} ${currentYear}`,
        amount: quarterlyAmount,
      });
      currentQuarter++;
      if (currentQuarter > 4) {
        currentQuarter = 1;
        currentYear++;
      }
    }
    return schedule;
  };

  return (
    <div className="space-y-6">
      {/* Confirmation of Debt */}
      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Confirmation of Pending Bill
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verified Supplier</span>
            <span className="font-medium">{supplierCompany || 'Unknown Supplier'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Reference</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pending Bill Amount</span>
            <span className="font-bold">₦{billAmount.toLocaleString()}</span>
          </div>
          {offerAmount && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">SPV Purchase Price</span>
              <span className="font-medium text-accent">₦{offerAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment Schedule Setup */}
      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Set Payment Schedule
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Installments</Label>
            <Select value={paymentQuarters} onValueChange={setPaymentQuarters}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Quarters (6 months)</SelectItem>
                <SelectItem value="4">4 Quarters (1 year)</SelectItem>
                <SelectItem value="6">6 Quarters (18 months)</SelectItem>
                <SelectItem value="8">8 Quarters (2 years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Starting Quarter</Label>
            <Select value={startQuarter} onValueChange={setStartQuarter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((q) => (
                  <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Payment Schedule Preview */}
        <div className="mt-4 p-3 bg-background rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Payment Schedule</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {getPaymentSchedule().map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span className="text-muted-foreground">{item.quarter}</span>
                <span className="font-medium">₦{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span>₦{billAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Letter of Authorization Preview */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
          <FileCheck className="w-4 h-4" />
          Letter of Authorization to Treasury
        </h4>
        
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            By approving this bill, <strong>{mdaName || 'the MDA'}</strong> confirms and authorizes:
          </p>
          
          <ol className="list-decimal list-inside text-xs space-y-2 text-muted-foreground">
            <li>
              We have accumulated <strong>₦{billAmount.toLocaleString()}</strong> of Pending Bills owed to 
              the supplier verified by the Pending Bills Verification Committee.
            </li>
            <li>
              The settlement of the Pending bills is a priority for the Treasury given their potential 
              impact on the Kenyan economy.
            </li>
            <li>
              {mdaName || 'The MDA'} hereby authorizes the National Treasury to prioritize the payment 
              of the outstanding bills according to the above payment schedule.
            </li>
          </ol>
          
          <div className="p-2 bg-background rounded border mt-3">
            <p className="text-xs text-muted-foreground">Attached to this authorization:</p>
            <ul className="text-xs list-disc list-inside mt-1">
              <li>Inventory of verified Pending Bill Holders</li>
              <li>Variation Agreement</li>
              <li>Payment Structure ({paymentQuarters} quarterly payments starting {startQuarter})</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Approval Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this approval, verification details, or special conditions..."
          rows={3}
        />
      </div>
      
      {/* Confirmations */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <Checkbox 
            id="confirm-debt" 
            checked={confirmedDebt} 
            onCheckedChange={(checked) => setConfirmedDebt(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="confirm-debt" className="text-sm text-muted-foreground cursor-pointer">
            I confirm that this bill represents a valid pending obligation owed by {mdaName || 'the MDA'} 
            to the verified supplier for goods/services delivered.
          </label>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <Checkbox 
            id="authorize-payment" 
            checked={authorizedPayment} 
            onCheckedChange={(checked) => setAuthorizedPayment(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="authorize-payment" className="text-sm text-muted-foreground cursor-pointer">
            I authorize the National Treasury to prioritize the disbursement of funds allocated 
            to the settlement of this pending bill according to the payment schedule above.
          </label>
        </div>
      </div>
      
      {!canSubmit && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          Please confirm both statements above to approve this bill
        </div>
      )}
      
      <div className="flex gap-3">
        <Button 
          onClick={handleSubmit} 
          disabled={submitting || !canSubmit}
          className="flex-1"
          size="lg"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {submitting ? 'Approving...' : 'Approve & Authorize Payment'}
        </Button>
      </div>
    </div>
  );
};

export default MDAAuthorizationForm;
