import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ProfileCompletionCardProps {
  className?: string;
}

const ProfileCompletionCard = ({ className }: ProfileCompletionCardProps) => {
  const navigate = useNavigate();
  const { profile, role } = useAuth();

  const getProfilePath = () => {
    switch (role) {
      case 'supplier': return '/supplier/profile';
      case 'spv': return '/spv/profile';
      case 'mda': return '/mda/profile';
      case 'treasury': return '/treasury/profile';
      default: return '/profile';
    }
  };

  // Calculate completion percentage based on role
  const calculateCompletion = () => {
    if (!profile) return { percentage: 0, missing: ['Profile not loaded'] };
    
    const checks: { field: string; label: string; required: boolean }[] = [
      { field: 'full_name', label: 'Full Name', required: true },
      { field: 'phone', label: 'Phone Number', required: false },
    ];
    
    if (role === 'supplier') {
      checks.push(
        { field: 'company_name', label: 'Company Name', required: true },
        { field: 'registration_number', label: 'Registration Number', required: true },
        { field: 'tax_id', label: 'Tax ID (TIN)', required: false },
        { field: 'address', label: 'Business Address', required: false },
        { field: 'bank_name', label: 'Bank Name', required: false },
        { field: 'bank_account', label: 'Bank Account', required: false },
      );
    } else if (role === 'spv') {
      checks.push(
        { field: 'spv_name', label: 'SPV Name', required: true },
        { field: 'license_number', label: 'License Number', required: false },
      );
    } else if (role === 'mda') {
      checks.push(
        { field: 'mda_name', label: 'MDA Selection', required: true },
        { field: 'department', label: 'Department', required: false },
      );
    } else if (role === 'treasury') {
      checks.push(
        { field: 'treasury_office', label: 'Treasury Office', required: true },
        { field: 'employee_id', label: 'Employee ID', required: false },
      );
    }
    
    const completed = checks.filter(c => profile[c.field as keyof typeof profile]);
    const missing = checks.filter(c => c.required && !profile[c.field as keyof typeof profile]);
    
    return {
      percentage: Math.round((completed.length / checks.length) * 100),
      missing: missing.map(m => m.label),
      total: checks.length,
      filled: completed.length,
    };
  };

  const completion = calculateCompletion();
  const isComplete = profile?.profile_completed;

  if (isComplete) {
    return (
      <Card className={cn("border-green-200 bg-green-50 dark:bg-green-900/20", className)}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-700 dark:text-green-400">Profile Complete</p>
              <p className="text-sm text-green-600 dark:text-green-500">Your identity is verified and visible to other parties</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(getProfilePath())}>
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-amber-200 bg-amber-50 dark:bg-amber-900/20", className)}>
      <CardContent className="py-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">Complete Your Profile</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">
                Other parties need to identify you before transactions
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate(getProfilePath())}>
            Complete
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-amber-600 dark:text-amber-500">
            <span>{completion.filled} of {completion.total} fields</span>
            <span>{completion.percentage}%</span>
          </div>
          <Progress value={completion.percentage} className="h-2 bg-amber-200" />
        </div>
        
        {completion.missing.length > 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-500">
            Missing required: {completion.missing.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletionCard;
