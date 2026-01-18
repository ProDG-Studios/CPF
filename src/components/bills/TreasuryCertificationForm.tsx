import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, FileCheck, Calendar, Wallet, AlertCircle, Building2 } from 'lucide-react';

interface TreasuryCertificationFormProps {
  billAmount: number;
  invoiceNumber: string;
  mdaName?: string;
  mdaApprovedDate?: string;
  paymentQuarters?: number | null;
  startQuarter?: string | null;
  offerAmount?: number | null;
  spvName?: string;
  onSubmit: (certificateNumber: string) => void;
  submitting?: boolean;
}

const TreasuryCertificationForm = ({ 
  billAmount, 
  invoiceNumber,
  mdaName,
  mdaApprovedDate,
  paymentQuarters,
  startQuarter,
  offerAmount,
  spvName,
  onSubmit, 
  submitting 
}: TreasuryCertificationFormProps) => {
  const [certificateNumber, setCertificateNumber] = useState(() => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `CERT-${year}-${random}`;
  });
  const [confirmedAuthorization, setConfirmedAuthorization] = useState(false);
  const [confirmedBudget, setConfirmedBudget] = useState(false);
  const [confirmedCommitment, setConfirmedCommitment] = useState(false);

  const canSubmit = confirmedAuthorization && confirmedBudget && confirmedCommitment && certificateNumber;
  const quarterlyAmount = paymentQuarters ? billAmount / paymentQuarters : billAmount;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(certificateNumber);
  };

  return (
    <div className="space-y-6">
      {/* Bill Summary */}
      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Bill Information
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Reference</span>
            <span className="font-medium">{invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MDA</span>
            <span className="font-medium">{mdaName || 'Unknown MDA'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">MDA Authorization Date</span>
            <span className="font-medium">{mdaApprovedDate || 'N/A'}</span>
          </div>
          <Separator className="my-2" />
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
      
      {/* Payment Schedule */}
      {paymentQuarters && startQuarter && (
        <div className="p-4 bg-secondary/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Authorized Payment Schedule
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installments</span>
              <span className="font-medium">{paymentQuarters} quarterly payments</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Starting</span>
              <span className="font-medium">{startQuarter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quarterly Amount</span>
              <span className="font-medium">₦{quarterlyAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Certificate Number */}
      <div className="space-y-2">
        <Label htmlFor="certificate">Certificate Number</Label>
        <Input
          id="certificate"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="CERT-2025-00001"
        />
        <p className="text-xs text-muted-foreground">
          This unique certificate number will be used to track and reference this payment commitment.
        </p>
      </div>
      
      {/* Letter of Commitment Preview */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
          <FileCheck className="w-4 h-4" />
          Letter of Commitment to SPV
        </h4>
        
        <div className="text-sm text-muted-foreground space-y-3">
          <p className="font-medium text-foreground">
            SUBJECT: LETTER OF COMMITMENT TO PRIORITISE PAYMENT OF PENDING AUTHORISED SUPPLIER BILLS 
            FROM THE FY2026/27 BUDGET
          </p>
          
          <p>
            Reference is made to the Authorisation from <strong>{mdaName || 'the MDA'}</strong> dated{' '}
            <strong>{mdaApprovedDate || '[DATE]'}</strong>.
          </p>
          
          <p>
            We understand that there currently exists Pending Bills amounting to{' '}
            <strong>₦{billAmount.toLocaleString()}</strong> owed by <strong>{mdaName || 'the MDA'}</strong> 
            in respect of contractual agreements for the supply of goods and services by the Verified 
            Suppliers.
          </p>
          
          <div className="p-3 bg-background rounded border">
            <p className="font-medium text-foreground text-xs uppercase mb-2">Commitment Statement</p>
            <p className="text-xs">
              This letter serves as formal commitment from the <strong>National Treasury</strong> to 
              prioritise the payment of the outstanding verified bills from the <strong>FY2026/27 
              National Budget</strong> according to the attached payment plan:
            </p>
            <ul className="text-xs list-disc list-inside mt-2">
              <li>{paymentQuarters || 4} quarterly installments of ₦{quarterlyAmount.toLocaleString()} each</li>
              <li>Starting {startQuarter || 'Q1 2025'}</li>
              <li>Certificate Reference: <strong>{certificateNumber}</strong></li>
            </ul>
          </div>
          
          {spvName && (
            <p className="text-xs">
              This commitment is made in favor of <strong>{spvName}</strong> (the Assignee) who has 
              acquired the debt through a Deed of Assignment.
            </p>
          )}
        </div>
      </div>
      
      {/* Confirmations */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <Checkbox 
            id="confirm-auth" 
            checked={confirmedAuthorization} 
            onCheckedChange={(checked) => setConfirmedAuthorization(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="confirm-auth" className="text-sm text-muted-foreground cursor-pointer">
            I confirm that the MDA Authorization is valid and properly executed by the appropriate authority.
          </label>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <Checkbox 
            id="confirm-budget" 
            checked={confirmedBudget} 
            onCheckedChange={(checked) => setConfirmedBudget(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="confirm-budget" className="text-sm text-muted-foreground cursor-pointer">
            I confirm that funds will be allocated in the FY2026/27 National Budget for the settlement 
            of this pending bill according to the payment schedule.
          </label>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
          <Checkbox 
            id="confirm-commitment" 
            checked={confirmedCommitment} 
            onCheckedChange={(checked) => setConfirmedCommitment(checked as boolean)}
            className="mt-0.5"
          />
          <label htmlFor="confirm-commitment" className="text-sm text-muted-foreground cursor-pointer">
            I confirm that this Letter of Commitment represents a formal obligation of the National Treasury 
            and can be relied upon by the SPV/Assignee.
          </label>
        </div>
      </div>
      
      {!canSubmit && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          Please confirm all statements above to issue the certificate
        </div>
      )}
      
      <Button 
        onClick={handleSubmit} 
        disabled={submitting || !canSubmit}
        className="w-full"
        size="lg"
      >
        <Shield className="w-4 h-4 mr-2" />
        {submitting ? 'Issuing Certificate...' : `Issue Certificate ${certificateNumber}`}
      </Button>
    </div>
  );
};

export default TreasuryCertificationForm;
