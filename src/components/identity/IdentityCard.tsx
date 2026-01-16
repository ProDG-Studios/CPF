import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Building2, User, Phone, MapPin, CreditCard, Hash, Mail,
  CheckCircle, AlertCircle, Shield, Briefcase
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

  const getRoleBadge = () => {
    switch (role) {
      case 'supplier': return { label: 'Verified Supplier', color: 'bg-blue-100 text-blue-700' };
      case 'spv': return { label: 'Licensed SPV', color: 'bg-purple-100 text-purple-700' };
      case 'mda': return { label: 'MDA Official', color: 'bg-green-100 text-green-700' };
      case 'treasury': return { label: 'Treasury Officer', color: 'bg-emerald-100 text-emerald-700' };
      case 'admin': return { label: 'Administrator', color: 'bg-red-100 text-red-700' };
      default: return { label: 'User', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getDisplayName = () => {
    if (role === 'supplier') return profile?.company_name || profile?.full_name || 'Supplier';
    if (role === 'spv') return profile?.spv_name || profile?.full_name || 'SPV';
    if (role === 'mda') return profile?.mda_name || profile?.full_name || 'MDA Official';
    if (role === 'treasury') return profile?.treasury_office || profile?.full_name || 'Treasury Officer';
    return profile?.full_name || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const roleBadge = getRoleBadge();
  const isComplete = profile?.profile_completed;

  if (variant === 'compact') {
    return (
      <Card className={cn("border-0 shadow-none bg-secondary/30", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{getDisplayName()}</h3>
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn("text-xs", roleBadge.color)}>{roleBadge.label}</Badge>
                {role === 'supplier' && profile?.registration_number && (
                  <span className="text-xs text-muted-foreground">RC: {profile.registration_number}</span>
                )}
                {role === 'spv' && profile?.license_number && (
                  <span className="text-xs text-muted-foreground">Lic: {profile.license_number}</span>
                )}
              </div>
            </div>
            {showEditButton && (
              <Button variant="ghost" size="sm" onClick={() => navigate(getProfilePath())}>
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
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-background">
            <AvatarFallback className="bg-accent text-accent-foreground font-bold text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground truncate">{getDisplayName()}</h2>
              {isComplete ? (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700 gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Incomplete
                </Badge>
              )}
            </div>
            <Badge className={cn("text-xs mb-3", roleBadge.color)}>{roleBadge.label}</Badge>
            
            {/* Role-specific details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {profile?.full_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.full_name}</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              
              {/* Supplier specific */}
              {role === 'supplier' && (
                <>
                  {profile?.registration_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span>RC: {profile.registration_number}</span>
                    </div>
                  )}
                  {profile?.tax_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>TIN: {profile.tax_id}</span>
                    </div>
                  )}
                  {profile?.bank_name && profile?.bank_account && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.bank_name} - ****{profile.bank_account.slice(-4)}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-2 text-sm col-span-full">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* SPV specific */}
              {role === 'spv' && (
                <>
                  {profile?.spv_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.spv_name}</span>
                    </div>
                  )}
                  {profile?.license_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span>License: {profile.license_number}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* MDA specific */}
              {role === 'mda' && (
                <>
                  {profile?.mda_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.mda_name}</span>
                    </div>
                  )}
                  {profile?.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.department} Department</span>
                    </div>
                  )}
                </>
              )}
              
              {/* Treasury specific */}
              {role === 'treasury' && (
                <>
                  {profile?.treasury_office && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.treasury_office}</span>
                    </div>
                  )}
                  {profile?.employee_id && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span>ID: {profile.employee_id}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {showEditButton && (
          <div className="mt-4 pt-4 border-t flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate(getProfilePath())}>
              Edit Profile
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityCard;
