import { useState } from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

// Import comprehensive mock data
import { 
  mockUnpaidPayablesData, 
  mockVerifiedPayablesData, 
  mockTreasuryBillsData,
  getPayablesStats 
} from '@/data/comprehensiveMockData';

// Use comprehensive mock data
const mockUnpaidPayables = mockUnpaidPayablesData;
const mockVerifiedPayables = mockVerifiedPayablesData;
const mockTreasuryBills = mockTreasuryBillsData;

const MDAPayablesPage = () => {
  const [activeTab, setActiveTab] = useState('unpaid');

  const totalUnpaid = mockUnpaidPayables.reduce((sum, p) => sum + p.amount, 0);
  const totalVerified = mockVerifiedPayables.reduce((sum, p) => sum + p.amount, 0);
  const totalTreasury = mockTreasuryBills.reduce((sum, p) => sum + p.amount, 0);

  return (
    <PortalLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payables Registry</h1>
          <p className="text-muted-foreground">View and manage all payables for your MDA</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">Unpaid Payables</p>
              </div>
              <p className="text-2xl font-bold text-red-700">{mockUnpaidPayables.length}</p>
              <p className="text-xs text-red-600">₦{(totalUnpaid / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-600">Verified</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{mockVerifiedPayables.length}</p>
              <p className="text-xs text-green-600">₦{(totalVerified / 1000000).toFixed(1)}M</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-600">At Treasury</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{mockTreasuryBills.filter(b => b.status === 'pending_certification').length}</p>
              <p className="text-xs text-blue-600">Pending Certification</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-purple-600">Total Registered</p>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                ₦{((totalUnpaid + totalVerified + totalTreasury) / 1000000000).toFixed(2)}B
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unpaid" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Unpaid ({mockUnpaidPayables.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified ({mockVerifiedPayables.length})
            </TabsTrigger>
            <TabsTrigger value="treasury" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Treasury ({mockTreasuryBills.length})
            </TabsTrigger>
          </TabsList>

          {/* Unpaid Payables Tab */}
          <TabsContent value="unpaid" className="space-y-4 mt-4">
            {mockUnpaidPayables.map((payable) => (
              <Card key={payable.id} className={payable.status === 'overdue' ? 'border-red-200' : ''}>
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{payable.invoice_number}</h3>
                        <Badge className={payable.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {payable.status === 'overdue' ? 'Overdue' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{payable.supplier_name}</p>
                      <p className="text-sm text-muted-foreground">{payable.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Invoice: {format(new Date(payable.invoice_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {payable.days_outstanding} days outstanding
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₦{payable.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(payable.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Verified Payables Tab */}
          <TabsContent value="verified" className="space-y-4 mt-4">
            {mockVerifiedPayables.map((payable) => (
              <Card key={payable.id} className="border-green-200">
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{payable.invoice_number}</h3>
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{payable.supplier_name}</p>
                      <p className="text-sm text-muted-foreground">{payable.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Verified: {format(new Date(payable.verified_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          SPV: {payable.spv_name} | Offer: ₦{payable.spv_offer.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₦{payable.amount.toLocaleString()}</p>
                      <p className="text-sm text-green-600">
                        Discount: {(((payable.amount - payable.spv_offer) / payable.amount) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Treasury Bills Tab */}
          <TabsContent value="treasury" className="space-y-4 mt-4">
            {mockTreasuryBills.map((bill) => (
              <Card key={bill.id} className={bill.status === 'certified' ? 'border-emerald-200' : 'border-blue-200'}>
                <CardContent className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{bill.invoice_number}</h3>
                        <Badge className={bill.status === 'certified' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                          {bill.status === 'certified' ? 'Certified' : 'Pending Certification'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bill.supplier_name}</p>
                      <p className="text-sm text-muted-foreground">{bill.mda_name} • SPV: {bill.spv_name}</p>
                      <p className="text-sm text-muted-foreground">{bill.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Sent: {format(new Date(bill.sent_to_treasury), 'MMM d, yyyy')}
                        </span>
                        <span>
                          Payment: {bill.payment_quarters} quarters from {bill.start_quarter}
                        </span>
                      </div>
                      {bill.certificate_number && (
                        <p className="text-sm font-medium text-emerald-600">
                          Certificate: {bill.certificate_number}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">₦{bill.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        ₦{(bill.amount / bill.payment_quarters).toLocaleString()}/quarter
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default MDAPayablesPage;