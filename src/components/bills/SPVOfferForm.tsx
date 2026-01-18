import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Wallet, FileCheck, ArrowRight, AlertCircle } from 'lucide-react';

interface SPVOfferFormProps {
  billAmount: number;
  supplierCompany?: string;
  mdaName?: string;
  invoiceNumber: string;
  onSubmit: (offerAmount: number, discountRate: number) => void;
  submitting?: boolean;
}

const SPVOfferForm = ({ 
  billAmount, 
  supplierCompany, 
  mdaName, 
  invoiceNumber,
  onSubmit, 
  submitting 
}: SPVOfferFormProps) => {
  const [discountRate, setDiscountRate] = useState('5');
  const [offerAmount, setOfferAmount] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  useEffect(() => {
    const rate = parseFloat(discountRate) / 100;
    const suggested = billAmount * (1 - rate);
    setOfferAmount(suggested.toFixed(2));
  }, [discountRate, billAmount]);

  const handleSubmit = () => {
    if (!agreedToTerms) return;
    onSubmit(parseFloat(offerAmount), parseFloat(discountRate));
  };

  const profit = billAmount - parseFloat(offerAmount || '0');
  const profitPercent = (profit / parseFloat(offerAmount || '1')) * 100;

  return (
    <div className="space-y-6">
      {/* Offer Calculation */}
      <div className="p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Calculate Your Offer
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount Rate (%)</Label>
            <Select value={discountRate} onValueChange={setDiscountRate}>
              <SelectTrigger id="discount">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3% (Low Risk)</SelectItem>
                <SelectItem value="5">5% (Standard)</SelectItem>
                <SelectItem value="7">7% (Moderate)</SelectItem>
                <SelectItem value="10">10% (Higher)</SelectItem>
                <SelectItem value="12">12% (Premium)</SelectItem>
                <SelectItem value="15">15% (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="offerAmount">Your Offer Amount (₦)</Label>
            <Input
              id="offerAmount"
              type="number"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              placeholder="Enter offer amount"
            />
          </div>
        </div>
        
        {/* Financial Summary */}
        <div className="mt-4 p-3 bg-background rounded-lg border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice Face Value</span>
            <span className="font-medium">₦{billAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Your Offer</span>
            <span className="font-medium text-accent">₦{parseFloat(offerAmount || '0').toLocaleString()}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Potential Profit</span>
            <span className="font-bold text-green-600">
              ₦{profit.toLocaleString()} ({profitPercent.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
      
      {/* Deed of Assignment Preview */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-2 mb-3">
          <FileCheck className="w-4 h-4" />
          Deed of Assignment Summary
        </h4>
        
        <div className="text-sm text-muted-foreground space-y-3">
          <p>
            Upon acceptance of your offer, a <strong>Deed of Assignment</strong> will be executed wherein:
          </p>
          
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 p-2 bg-background rounded border text-center">
              <p className="text-xs text-muted-foreground">Assignor (Supplier)</p>
              <p className="font-medium text-foreground text-sm">{supplierCompany || 'Supplier'}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
            <div className="flex-1 p-2 bg-background rounded border text-center">
              <p className="text-xs text-muted-foreground">Assignee (SPV)</p>
              <p className="font-medium text-foreground text-sm">Your Company</p>
            </div>
          </div>
          
          <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
            <li>
              The debt of <strong>₦{billAmount.toLocaleString()}</strong> owed by {mdaName || 'the MDA'} 
              will be assigned to you
            </li>
            <li>
              You will pay the Assignor <strong>₦{parseFloat(offerAmount || '0').toLocaleString()}</strong> as consideration
            </li>
            <li>You will have full rights to collect the debt from the debtor</li>
            <li>The assignment is irrevocable and absolute</li>
          </ul>
        </div>
      </div>
      
      {/* Terms Agreement */}
      <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
        <Checkbox 
          id="terms" 
          checked={agreedToTerms} 
          onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
          I confirm that I have reviewed the bill details and agree to the terms of the offer. 
          I understand that upon acceptance by the supplier, a Deed of Assignment will be executed 
          and I will be required to pay the consideration amount.
        </label>
      </div>
      
      {!agreedToTerms && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="w-4 h-4" />
          Please agree to the terms to submit your offer
        </div>
      )}
      
      <Button 
        onClick={handleSubmit} 
        disabled={submitting || !agreedToTerms || !offerAmount}
        className="w-full"
        size="lg"
      >
        {submitting ? 'Submitting Offer...' : `Submit Offer of ₦${parseFloat(offerAmount || '0').toLocaleString()}`}
      </Button>
    </div>
  );
};

export default SPVOfferForm;
