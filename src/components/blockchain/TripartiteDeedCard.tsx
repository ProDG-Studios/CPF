import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  FileSignature, 
  CheckCircle2, 
  Clock, 
  Link2, 
  Wallet,
  Building2,
  Landmark,
  User,
  Hash,
  ExternalLink,
  Shield,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Party {
  id: string;
  name: string;
  role: 'assignor' | 'procuring_entity' | 'servicing_agent';
  signedAt: string | null;
  signature: string | null;
  walletAddress: string | null;
}

interface TripartiteDeedCardProps {
  deedId: string;
  deedHash: string;
  status: string;
  billAmount: number;
  purchasePrice: number;
  discountRate: number;
  invoiceNumber: string;
  parties: {
    assignor: Party;
    procuringEntity: Party;
    servicingAgent: Party | null;
  };
  blockchainTxHash: string | null;
  blockNumber: number | null;
  network: string;
  canSign: boolean;
  currentUserRole: 'assignor' | 'procuring_entity' | 'servicing_agent' | null;
  onSign: (walletAddress: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending_assignor: { label: 'Awaiting Assignor Signature', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  pending_procuring_entity: { label: 'Awaiting MDA Signature', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
  pending_servicing_agent: { label: 'Awaiting Treasury Signature', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Clock },
  fully_executed: { label: 'Fully Executed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertCircle },
};

const PartySignatureCard = ({ 
  party, 
  icon: Icon, 
  label 
}: { 
  party: Party | null; 
  icon: React.ElementType; 
  label: string;
}) => {
  const isSigned = party?.signedAt;
  
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-300",
      isSigned 
        ? "bg-emerald-500/5 border-emerald-500/30" 
        : "bg-muted/30 border-border/50"
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-lg",
          isSigned ? "bg-emerald-500/20" : "bg-muted"
        )}>
          <Icon className={cn("w-4 h-4", isSigned ? "text-emerald-500" : "text-muted-foreground")} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium text-sm">{party?.name || 'Pending Assignment'}</p>
        </div>
        {isSigned && (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
        )}
      </div>
      
      {isSigned ? (
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Signed: {new Date(party.signedAt!).toLocaleString()}</span>
          </div>
          {party.walletAddress && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Wallet className="w-3 h-3" />
              <span className="truncate">{party.walletAddress.slice(0, 10)}...{party.walletAddress.slice(-8)}</span>
            </div>
          )}
          {party.signature && (
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Hash className="w-3 h-3" />
              <span className="truncate">{party.signature.slice(0, 16)}...</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Awaiting signature...</p>
      )}
    </div>
  );
};

export function TripartiteDeedCard({
  deedId,
  deedHash,
  status,
  billAmount,
  purchasePrice,
  discountRate,
  invoiceNumber,
  parties,
  blockchainTxHash,
  blockNumber,
  network,
  canSign,
  currentUserRole,
  onSign,
  isLoading,
}: TripartiteDeedCardProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [signing, setSigning] = useState(false);

  const statusInfo = statusConfig[status] || statusConfig.pending_assignor;
  const StatusIcon = statusInfo.icon;

  const handleSign = async () => {
    if (!walletAddress.trim()) return;
    setSigning(true);
    try {
      await onSign(walletAddress);
    } finally {
      setSigning(false);
    }
  };

  const isFullyExecuted = status === 'fully_executed';

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <FileSignature className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Tripartite Deed of Assignment</CardTitle>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Invoice: {invoiceNumber}
              </p>
            </div>
          </div>
          <Badge className={cn("border", statusInfo.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Deed Hash */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Shield className="w-3 h-3" />
            <span>Cryptographic Deed Hash</span>
          </div>
          <p className="font-mono text-xs break-all">{deedHash}</p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Principal Amount</p>
            <p className="font-bold text-lg">₦{billAmount.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Purchase Price</p>
            <p className="font-bold text-lg text-accent">₦{purchasePrice.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <p className="text-xs text-muted-foreground">Discount Rate</p>
            <p className="font-bold text-lg">{discountRate}%</p>
          </div>
        </div>

        <Separator />

        {/* Tripartite Signatures */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Tripartite Signatures
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <PartySignatureCard 
              party={parties.assignor}
              icon={User}
              label="Assignor (Supplier)"
            />
            <PartySignatureCard 
              party={parties.procuringEntity}
              icon={Building2}
              label="Procuring Entity (MDA)"
            />
            <PartySignatureCard 
              party={parties.servicingAgent}
              icon={Landmark}
              label="Servicing Agent (Treasury)"
            />
          </div>
        </div>

        {/* Signing Section */}
        {canSign && currentUserRole && !isFullyExecuted && (
          <>
            <Separator />
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Sign This Deed
              </h4>
              <p className="text-xs text-muted-foreground mb-4">
                Connect your Ethereum wallet to sign this Deed of Assignment. Your signature will be recorded on the Sepolia testnet.
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="wallet" className="text-xs">Wallet Address</Label>
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button 
                  onClick={handleSign}
                  disabled={!walletAddress.trim() || signing || isLoading}
                  className="self-end"
                >
                  {signing ? 'Signing...' : 'Sign Deed'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Blockchain Details (when executed) */}
        {isFullyExecuted && blockchainTxHash && (
          <>
            <Separator />
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Blockchain Verification
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <Badge variant="outline" className="font-mono capitalize">{network}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Block Number:</span>
                  <span className="font-mono">{blockNumber?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Transaction Hash:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${blockchainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-mono"
                  >
                    {blockchainTxHash.slice(0, 10)}...{blockchainTxHash.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
