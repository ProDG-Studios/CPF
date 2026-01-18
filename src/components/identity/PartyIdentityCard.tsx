import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, User, Phone, Hash, MapPin, CreditCard, CheckCircle, Mail, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartyInfo {
  role: 'supplier' | 'spv' | 'mda' | 'treasury';
  name?: string | null;
  company?: string | null;
  registration?: string | null;
  taxId?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  phone?: string | null;
  email?: string | null;
  licenseNumber?: string | null;
  spvName?: string | null;
  mdaName?: string | null;
  mdaCode?: string | null;
  department?: string | null;
  treasuryOffice?: string | null;
  employeeId?: string | null;
  isVerified?: boolean;
}

interface PartyIdentityCardProps {
  party: PartyInfo;
  variant?: 'compact' | 'detailed';
  className?: string;
  label?: string;
}

const roleConfig = {
  supplier: { label: 'Supplier (Assignor)', color: 'bg-blue-100 text-blue-700', icon: User },
  spv: { label: 'SPV (Assignee)', color: 'bg-purple-100 text-purple-700', icon: Building2 },
  mda: { label: 'MDA (Debtor)', color: 'bg-green-100 text-green-700', icon: Building2 },
  treasury: { label: 'National Treasury', color: 'bg-emerald-100 text-emerald-700', icon: Shield },
};

const PartyIdentityCard = ({ party, variant = 'compact', className, label }: PartyIdentityCardProps) => {
  const config = roleConfig[party.role];
  const Icon = config.icon;

  const getDisplayName = () => {
    switch (party.role) {
      case 'supplier':
        return party.company || party.name || 'Unknown Supplier';
      case 'spv':
        return party.spvName || party.name || 'Unknown SPV';
      case 'mda':
        return party.mdaName || 'Unknown MDA';
      case 'treasury':
        return party.treasuryOffice || 'National Treasury';
      default:
        return party.name || 'Unknown';
    }
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-secondary/30 rounded-lg", className)}>
        <Avatar className="h-10 w-10 border border-background">
          <AvatarFallback className="bg-background text-foreground text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          {label && <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>}
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{getDisplayName()}</p>
            {party.isVerified && <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge className={cn("text-[10px] px-1.5 py-0", config.color)}>{config.label}</Badge>
            {party.role === 'supplier' && party.registration && (
              <span className="text-[10px] text-muted-foreground">RC: {party.registration}</span>
            )}
            {party.role === 'spv' && party.licenseNumber && (
              <span className="text-[10px] text-muted-foreground">Lic: {party.licenseNumber}</span>
            )}
            {party.role === 'mda' && party.mdaCode && (
              <span className="text-[10px] text-muted-foreground">{party.mdaCode}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {label && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">{label}</p>
        )}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-background">
            <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{getDisplayName()}</h3>
              {party.isVerified && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
            </div>
            <Badge className={cn("text-xs", config.color)}>{config.label}</Badge>
            
            <div className="grid grid-cols-1 gap-2 mt-3 text-sm">
              {/* Contact person for supplier */}
              {party.role === 'supplier' && party.name && party.name !== party.company && (
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{party.name}</span>
                </div>
              )}
              
              {party.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{party.email}</span>
                </div>
              )}
              
              {party.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{party.phone}</span>
                </div>
              )}
              
              {/* Supplier specific */}
              {party.role === 'supplier' && (
                <>
                  {party.registration && (
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">RC: {party.registration}</span>
                    </div>
                  )}
                  {party.taxId && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">TIN: {party.taxId}</span>
                    </div>
                  )}
                  {party.bankName && party.bankAccount && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{party.bankName} - {party.bankAccount}</span>
                    </div>
                  )}
                  {party.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">{party.address}</span>
                    </div>
                  )}
                </>
              )}
              
              {/* SPV specific */}
              {party.role === 'spv' && party.licenseNumber && (
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">License: {party.licenseNumber}</span>
                </div>
              )}
              
              {/* MDA specific */}
              {party.role === 'mda' && party.department && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{party.department} Department</span>
                </div>
              )}
              
              {/* Treasury specific */}
              {party.role === 'treasury' && party.employeeId && (
                <div className="flex items-center gap-2">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">ID: {party.employeeId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartyIdentityCard;
