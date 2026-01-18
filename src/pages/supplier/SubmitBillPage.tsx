import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, FileText, Calendar, Building2, AlertCircle, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MDA {
  id: string;
  name: string;
  code: string;
}

interface UploadedFile {
  id: string;
  name: string;
  customName: string;
  url: string | null;
  file: File;
  uploading: boolean;
}

const SubmitBillPage = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mdas, setMdas] = useState<MDA[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    mda_id: '',
    invoice_number: '',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: '',
    amount: '',
    currency: 'NGN',
    description: '',
    contract_reference: '',
    ifmis_id: '',
    work_description: '',
    work_start_date: '',
    work_end_date: '',
    delivery_date: '',
  });

  useEffect(() => {
    const fetchMDAs = async () => {
      const { data } = await supabase.from('mdas').select('*').order('name');
      if (data) setMdas(data);
    };
    fetchMDAs();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    const newFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB`);
        continue;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newFiles.push({
        id: fileId,
        name: file.name,
        customName: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for custom name
        url: null,
        file: file,
        uploading: true,
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files in background
    for (const newFile of newFiles) {
      try {
        const fileExt = newFile.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${newFile.id}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('invoices')
          .upload(fileName, newFile.file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('invoices')
          .getPublicUrl(data.path);

        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id 
            ? { ...f, url: urlData.publicUrl, uploading: false }
            : f
        ));
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${newFile.name}`);
        setUploadedFiles(prev => prev.filter(f => f.id !== newFile.id));
      }
    }
  };

  const updateFileName = (id: string, customName: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === id ? { ...f, customName } : f
    ));
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    if (!profile?.profile_completed) {
      toast.error('Please complete your profile first');
      navigate('/supplier/profile');
      return;
    }

    if (!formData.mda_id || !formData.invoice_number || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if any files are still uploading
    if (uploadedFiles.some(f => f.uploading)) {
      toast.error('Please wait for files to finish uploading');
      return;
    }

    setLoading(true);

    try {
      // Prepare supporting documents array
      const supportingDocuments = uploadedFiles.map(f => ({
        name: f.customName,
        originalName: f.name,
        url: f.url,
      }));

      // Get the invoice document URL (first uploaded file or null)
      const invoiceUrl = uploadedFiles.length > 0 ? uploadedFiles[0].url : null;

      const { data: billData, error } = await supabase.from('bills').insert({
        supplier_id: user.id,
        mda_id: formData.mda_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        contract_reference: formData.contract_reference || formData.ifmis_id || null,
        work_description: formData.work_description,
        work_start_date: formData.work_start_date || null,
        work_end_date: formData.work_end_date || null,
        delivery_date: formData.delivery_date || null,
        invoice_document_url: invoiceUrl,
        supporting_documents: supportingDocuments,
        status: 'submitted',
        status_history: JSON.stringify([{
          status: 'submitted',
          timestamp: new Date().toISOString(),
          note: 'Bill submitted by supplier'
        }])
      }).select().single();

      if (error) throw error;

      // Notify all SPV users about new bill
      const { data: spvUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'spv');

      if (spvUsers && spvUsers.length > 0) {
        const notifications = spvUsers.map(spv => ({
          user_id: spv.user_id,
          title: 'New Payable Available',
          message: `A new invoice ${formData.invoice_number} worth KES ${parseFloat(formData.amount).toLocaleString()} is available for offers.`,
          type: 'info',
          bill_id: billData.id,
        }));
        
        await supabase.from('notifications').insert(notifications);
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        action: 'Bill Submitted',
        user_id: user.id,
        bill_id: billData.id,
        details: { 
          invoice_number: formData.invoice_number, 
          amount: parseFloat(formData.amount),
          mda_id: formData.mda_id,
          documents_count: uploadedFiles.length
        }
      });

      toast.success('Payable submitted successfully!');
      navigate('/supplier/my-bills');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit payable');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Submit New Payable</h1>
          <p className="text-muted-foreground">Fill in the invoice details to submit for payment</p>
        </div>

        {!profile?.profile_completed && (
          <Card className="border-warning bg-warning/5 mb-6">
            <CardContent className="py-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-foreground">Profile Incomplete</p>
                <p className="text-sm text-muted-foreground">
                  You need to complete your profile before submitting bills.{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/supplier/profile')}>
                    Complete Now
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* MDA Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Select MDA
              </CardTitle>
              <CardDescription>Choose the government department this invoice is for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={formData.mda_id} onValueChange={(v) => updateField('mda_id', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MDA" />
                </SelectTrigger>
                <SelectContent>
                  {mdas.map((mda) => (
                    <SelectItem key={mda.id} value={mda.id}>
                      {mda.name} ({mda.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input
                    id="invoice_number"
                    value={formData.invoice_number}
                    onChange={(e) => updateField('invoice_number', e.target.value)}
                    placeholder="e.g., INV-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => updateField('amount', e.target.value)}
                    placeholder="e.g., 5000000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Invoice Date *</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => updateField('invoice_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => updateField('due_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Invoice Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of goods/services..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contract/IFMIS Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Contract / IFMIS Reference
              </CardTitle>
              <CardDescription>Enter the contract reference or IFMIS ID for tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contract_reference">Contract Reference Number</Label>
                  <Input
                    id="contract_reference"
                    value={formData.contract_reference}
                    onChange={(e) => updateField('contract_reference', e.target.value)}
                    placeholder="e.g., CTR-2024-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifmis_id">IFMIS ID</Label>
                  <Input
                    id="ifmis_id"
                    value={formData.ifmis_id}
                    onChange={(e) => updateField('ifmis_id', e.target.value)}
                    placeholder="e.g., IFMIS-2024-00123"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_description">Work Description</Label>
                <Textarea
                  id="work_description"
                  value={formData.work_description}
                  onChange={(e) => updateField('work_description', e.target.value)}
                  placeholder="Describe the work performed or goods delivered..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="work_start_date">Work Start Date</Label>
                  <Input
                    id="work_start_date"
                    type="date"
                    value={formData.work_start_date}
                    onChange={(e) => updateField('work_start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_end_date">Work End Date</Label>
                  <Input
                    id="work_end_date"
                    type="date"
                    value={formData.work_end_date}
                    onChange={(e) => updateField('work_end_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Delivery Date</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => updateField('delivery_date', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload your invoice, signed delivery notes, and other supporting documents. 
                Give each document a descriptive name.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border">
                      <FileText className="w-8 h-8 text-accent shrink-0" />
                      <div className="flex-1 min-w-0">
                        <Input
                          value={file.customName}
                          onChange={(e) => updateFileName(file.id, e.target.value)}
                          placeholder="Document name..."
                          className="h-8 text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          Original: {file.name} ({(file.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                      {file.uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-accent shrink-0" />
                      ) : (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileSelect}
                    multiple
                  />
                  <div className="flex flex-col items-center">
                    <Plus className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to add documents
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Invoice, Signed Delivery Notes, Contracts, etc. (PDF, PNG, JPG, DOC up to 10MB each)
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/supplier')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadedFiles.some(f => f.uploading) || !profile?.profile_completed}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Payable
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
};

export default SubmitBillPage;