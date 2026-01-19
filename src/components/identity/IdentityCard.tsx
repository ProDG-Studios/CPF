import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, User, Phone, MapPin, CreditCard, Hash, Mail,
  CheckCircle, AlertCircle, Shield, Briefcase, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface IdentityCardProps {
  variant?: 'compact' | 'full';
  className?: string;
  showEditButton?: boolean;
}

const IdentityCard = ({ variant = 'compact', className, showEditButton = true }: IdentityCardProps) => {
  const navigate = useNavigate();
  const { profile, role, user } = useAuth();

  const getProfilePath = () => {
    switch (role) {
      case 'supplier': return '/supplier/profile';
      case 'spv': return '/spv/profile';
      case 'mda': return '/mda/profile';
      case 'treasury': return '/treasury/profile';
      default: return '/profile';
    }
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'supplier': return { 
        label: 'Verified Supplier', 
        gradient: 'from-blue-500 to-blue-600',
        bgLight: 'bg-blue-500/10',
        text: 'text-blue-600'
      };
      case 'spv': return { 
        label: 'Licensed SPV', 
        gradient: 'from-purple-500 to-purple-600',
        bgLight: 'bg-purple-500/10',
        text: 'text-purple-600'
      };
      case 'mda': return { 
        label: 'MDA Official', 
        gradient: 'from-orange-500 to-orange-600',
        bgLight: 'bg-orange-500/10',
        text: 'text-orange-600'
      };
      case 'treasury': return { 
        label: 'Treasury Officer', 
        gradient: 'from-emerald-500 to-emerald-600',
        bgLight: 'bg-emerald-500/10',
        text: 'text-emerald-600'
      };
      case 'admin': return { 
        label: 'Administrator', 
        gradient: 'from-slate-600 to-slate-700',
        bgLight: 'bg-slate-500/10',
        text: 'text-slate-600'
      };
      default: return { 
        label: 'User', 
        gradient: 'from-gray-500 to-gray-600',
        bgLight: 'bg-gray-500/10',
        text: 'text-gray-600'
      };
    }
  };

  const getDisplayName = () => {
    if (role === 'supplier') return profile?.company_name || profile?.full_name || 'Supplier';
    if (role === 'spv') return profile?.spv_name || profile?.full_name || 'SPV';
    if (role === 'mda') return profile?.mda_name || profile?.full_name || 'MDA Official';
    if (role === 'treasury') return profile?.treasury_office || profile?.full_name || 'National Treasury';
    return profile?.full_name || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const roleConfig = getRoleConfig();
  const isComplete = profile?.profile_completed;

  if (variant === 'compact') {
    return (
      <Card className={cn("border-0 shadow-none bg-secondary/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-2 ring-background shadow-lg">
                <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold text-lg", roleConfig.gradient)}>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              {isComplete && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center ring-2 ring-background">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground truncate text-lg">{getDisplayName()}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs font-semibold", roleConfig.bgLight, roleConfig.text)}>
                  {roleConfig.label}
                </Badge>
                {role === 'supplier' && profile?.registration_number && (
                  <span className="text-xs text-muted-foreground font-mono">RC: {profile.registration_number}</span>
                )}
              </div>
            </div>
            {showEditButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(getProfilePath())}
                className="shrink-0"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full variant - detailed card
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with gradient */}
      <div className={cn("h-24 bg-gradient-to-r relative", roleConfig.gradient)}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z' fill='%23ffffff' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }} />
      </div>
      
      <CardContent className="relative pt-0 pb-6">
        {/* Avatar and info section - positioned below the gradient */}
        <div className="flex items-start gap-4 -mt-12">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold text-2xl", roleConfig.gradient)}>
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {isComplete && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success rounded-full flex items-center justify-center ring-2 ring-background">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground truncate">{getDisplayName()}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={cn("text-xs font-semibold", roleConfig.bgLight, roleConfig.text)}>
                    {roleConfig.label}
                  </Badge>
                  {isComplete ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Incomplete
                    </Badge>
                  )}
                </div>
              </div>
              {showEditButton && (
                <Button variant="outline" size="sm" onClick={() => navigate(getProfilePath())} className="shrink-0">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          {profile?.full_name && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium truncate">{profile.full_name}</p>
              </div>
            </div>
          )}
          {profile?.email && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium truncate">{profile.email}</p>
              </div>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium truncate">{profile.phone}</p>
              </div>
            </div>
          )}
          
          {/* Role-specific fields */}
          {role === 'supplier' && profile?.registration_number && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Registration No.</p>
                <p className="font-medium font-mono truncate">{profile.registration_number}</p>
              </div>
            </div>
          )}
          {role === 'supplier' && profile?.tax_id && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tax ID</p>
                <p className="font-medium font-mono truncate">{profile.tax_id}</p>
              </div>
            </div>
          )}
          {role === 'supplier' && profile?.bank_name && profile?.bank_account && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Bank Details</p>
                <p className="font-medium truncate">{profile.bank_name} - ****{profile.bank_account.slice(-4)}</p>
              </div>
            </div>
          )}
          
          {role === 'spv' && profile?.license_number && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">License No.</p>
                <p className="font-medium font-mono truncate">{profile.license_number}</p>
              </div>
            </div>
          )}
          
          {role === 'mda' && profile?.department && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="font-medium truncate">{profile.department}</p>
              </div>
            </div>
          )}
          
          {role === 'treasury' && profile?.employee_id && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Employee ID</p>
                <p className="font-medium font-mono truncate">{profile.employee_id}</p>
              </div>
            </div>
          )}
          
          {profile?.address && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 col-span-full">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="font-medium truncate">{profile.address}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IdentityCard;
