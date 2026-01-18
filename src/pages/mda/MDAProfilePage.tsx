import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Building2, User, Phone, Save } from 'lucide-react';

interface MDA {
  id: string;
  name: string;
  code: string;
}

const MDAProfilePage = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mdas, setMdas] = useState<MDA[]>([]);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    mda_name: profile?.mda_name || '',
    mda_code: profile?.mda_code || '',
    department: profile?.department || '',
  });

  useEffect(() => {
    const fetchMDAs = async () => {
      const { data } = await supabase.from('mdas').select('*').order('name');
      if (data) setMdas(data);
    };
    fetchMDAs();
  }, []);

  const handleMDAChange = (mdaId: string) => {
    const mda = mdas.find(m => m.id === mdaId);
    if (mda) {
      setFormData(prev => ({
        ...prev,
        mda_name: mda.name,
        mda_code: mda.id,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mda_name) {
      toast.error('Please select an MDA');
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateProfile({
        ...formData,
        profile_completed: true,
      });

      if (error) throw error;

      toast.success('Profile updated successfully');
      navigate('/mda');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <PortalLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">MDA Profile</h1>
          <p className="text-muted-foreground">Set your MDA affiliation to see relevant bills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => updateField('full_name', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+254 xxx xxx xxx"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                MDA Information
              </CardTitle>
              <CardDescription>Select the MDA you belong to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select MDA *</Label>
                <Select value={formData.mda_code} onValueChange={handleMDAChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your MDA" />
                  </SelectTrigger>
                  <SelectContent>
                    {mdas.map((mda) => (
                      <SelectItem key={mda.id} value={mda.id}>
                        {mda.name} ({mda.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(v) => updateField('department', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Procurement">Procurement</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/mda')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
};

export default MDAProfilePage;
