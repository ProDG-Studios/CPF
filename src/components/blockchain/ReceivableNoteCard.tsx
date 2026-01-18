import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Coins, 
  Calendar, 
  Hash, 
  Wallet,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceivableNoteCardProps {
  noteId: string;
  noteNumber: string;
  faceValue: number;
  issueDate: string;
  maturityDate: string | null;
  status: string;
  tokenId: string | null;
  tokenContractAddress: string | null;
  mintTxHash: string | null;
  network: string;
  deedHash: string;
  canMint: boolean;
  onMint: (walletAddress: string) => Promise<void>;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground border-border', icon: FileText },
  minted: { label: 'Minted', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
  listed: { label: 'Listed for Sale', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: TrendingUp },
  sold: { label: 'Sold', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Coins },
  redeemed: { label: 'Redeemed', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: CheckCircle2 },
};

export function ReceivableNoteCard({
  noteId,
  noteNumber,
  faceValue,
  issueDate,
  maturityDate,
  status,
  tokenId,
  tokenContractAddress,
  mintTxHash,
  network,
  deedHash,
  canMint,
  onMint,
  isLoading,
}: ReceivableNoteCardProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [minting, setMinting] = useState(false);

  const statusInfo = statusConfig[status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;
  const isMinted = status !== 'draft';

  const handleMint = async () => {
    if (!walletAddress.trim()) return;
    setMinting(true);
    try {
      await onMint(walletAddress);
    } finally {
      setMinting(false);
    }
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              isMinted 
                ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20" 
                : "bg-muted"
            )}>
              <Coins className={cn("w-5 h-5", isMinted ? "text-emerald-400" : "text-muted-foreground")} />
            </div>
            <div>
              <CardTitle className="text-lg">Receivable Note</CardTitle>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {noteNumber}
              </p>
            </div>
          </div>
          <Badge className={cn("border", statusInfo.color)}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Note Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Coins className="w-3 h-3" />
              <span>Face Value</span>
            </div>
            <p className="font-bold text-xl">KES {faceValue.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Calendar className="w-3 h-3" />
              <span>Issue Date</span>
            </div>
            <p className="font-semibold">{new Date(issueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {maturityDate && (
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs text-amber-600 mb-1">
              <Clock className="w-3 h-3" />
              <span>Maturity Date</span>
            </div>
            <p className="font-semibold">{new Date(maturityDate).toLocaleDateString()}</p>
          </div>
        )}

        {/* Deed Reference */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Hash className="w-3 h-3" />
            <span>Backed by Deed Hash</span>
          </div>
          <p className="font-mono text-xs truncate">{deedHash}</p>
        </div>

        {/* Token Details (when minted) */}
        {isMinted && tokenId && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-600">
              <Sparkles className="w-4 h-4" />
              NFT Token Details
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Token ID:</span>
                <span className="font-mono font-bold">{tokenId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Network:</span>
                <Badge variant="outline" className="font-mono capitalize">{network}</Badge>
              </div>
              {tokenContractAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Contract:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${tokenContractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-mono"
                  >
                    {tokenContractAddress.slice(0, 8)}...{tokenContractAddress.slice(-6)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {mintTxHash && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mint TX:</span>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${mintTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline font-mono"
                  >
                    {mintTxHash.slice(0, 10)}...{mintTxHash.slice(-6)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mint Section */}
        {canMint && status === 'draft' && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Mint as NFT
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Mint this receivable note as an NFT token on the Sepolia testnet for trading.
            </p>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="mintWallet" className="text-xs">Your Wallet Address</Label>
                <Input
                  id="mintWallet"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <Button 
                onClick={handleMint}
                disabled={!walletAddress.trim() || minting || isLoading}
                className="self-end"
              >
                {minting ? 'Minting...' : 'Mint NFT'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
