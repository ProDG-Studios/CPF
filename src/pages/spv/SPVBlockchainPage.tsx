import { useState, useEffect } from 'react';
import PortalLayout from '@/components/layout/PortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TripartiteDeedCard } from '@/components/blockchain/TripartiteDeedCard';
import { ReceivableNoteCard } from '@/components/blockchain/ReceivableNoteCard';
import { useBlockchainDeed } from '@/hooks/useBlockchainDeed';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileSignature, 
  Coins, 
  Plus, 
  RefreshCw, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface Deed {
  id: string;
  bill_id: string;
  deed_hash: string;
  network: string;
  status: string;
  assignor_id: string;
  assignor_signed_at: string | null;
  assignor_signature: string | null;
  assignor_wallet_address: string | null;
  procuring_entity_id: string;
  procuring_entity_signed_at: string | null;
  procuring_entity_signature: string | null;
  procuring_entity_wallet_address: string | null;
  servicing_agent_id: string | null;
  servicing_agent_signed_at: string | null;
  servicing_agent_signature: string | null;
  servicing_agent_wallet_address: string | null;
  principal_amount: number;
  discount_rate: number | null;
  purchase_price: number | null;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  executed_at: string | null;
  document_content: Json;
  created_at: string;
}

interface Note {
  id: string;
  deed_id: string;
  bill_id: string;
  note_number: string;
  face_value: number;
  issue_date: string;
  maturity_date: string | null;
  status: string;
  token_id: string | null;
  token_contract_address: string | null;
  mint_tx_hash: string | null;
  network: string;
  metadata: Json;
  blockchain_deeds?: Deed;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  mda_name: string | null;
}

const SPVBlockchainPage = () => {
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeed, setSelectedDeed] = useState<Deed | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [maturityDate, setMaturityDate] = useState('');
  
  const { 
    loading: blockchainLoading,
    signDeed, 
    generateReceivableNote, 
    mintReceivableNote,
    getDeed,
    getReceivableNotes,
  } = useBlockchainDeed();

  const fetchData = async () => {
    try {
      // Fetch deeds
      const { data: deedsData } = await supabase
        .from('blockchain_deeds')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch notes
      const { data: notesData } = await supabase
        .from('receivable_notes')
        .select('*, blockchain_deeds(*)')
        .order('created_at', { ascending: false });

      // Get unique user IDs
      const userIds = new Set<string>();
      deedsData?.forEach(deed => {
        userIds.add(deed.assignor_id);
        userIds.add(deed.procuring_entity_id);
        if (deed.servicing_agent_id) userIds.add(deed.servicing_agent_id);
      });

      // Fetch profiles
      if (userIds.size > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, company_name, mda_name')
          .in('user_id', Array.from(userIds));

        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p;
        });
        setProfiles(profilesMap);
      }

      setDeeds(deedsData || []);
      setNotes(notesData as Note[] || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch blockchain data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleGenerateNote = async () => {
    if (!selectedDeed || !maturityDate) return;
    
    try {
      await generateReceivableNote(selectedDeed.id, maturityDate);
      setGenerateDialogOpen(false);
      setSelectedDeed(null);
      setMaturityDate('');
      fetchData();
    } catch (error) {
      console.error('Error generating note:', error);
    }
  };

  const handleMintNote = async (noteId: string, walletAddress: string) => {
    try {
      await mintReceivableNote(noteId, walletAddress);
      fetchData();
    } catch (error) {
      console.error('Error minting note:', error);
    }
  };

  const getPartyName = (userId: string) => {
    const profile = profiles[userId];
    return profile?.company_name || profile?.mda_name || profile?.full_name || 'Unknown';
  };

  const executedDeeds = deeds.filter(d => d.status === 'fully_executed');
  const pendingDeeds = deeds.filter(d => d.status !== 'fully_executed' && d.status !== 'rejected');
  const draftNotes = notes.filter(n => n.status === 'draft');
  const mintedNotes = notes.filter(n => n.status !== 'draft');

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading blockchain data...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Blockchain Deeds & Receivables</h1>
            <p className="text-muted-foreground mt-1">
              Manage tripartite deeds of assignment and generate receivable notes
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingDeeds.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Signatures</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{executedDeeds.length}</p>
                  <p className="text-xs text-muted-foreground">Executed Deeds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Coins className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notes.length}</p>
                  <p className="text-xs text-muted-foreground">Receivable Notes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mintedNotes.length}</p>
                  <p className="text-xs text-muted-foreground">Minted NFTs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="deeds" className="space-y-4">
          <TabsList>
            <TabsTrigger value="deeds" className="gap-2">
              <FileSignature className="w-4 h-4" />
              Deeds of Assignment
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <Coins className="w-4 h-4" />
              Receivable Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deeds" className="space-y-4">
            {deeds.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <FileSignature className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Deeds Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Deeds of Assignment will appear here when offers are accepted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {deeds.map(deed => (
                  <div key={deed.id}>
                    <TripartiteDeedCard
                      deedId={deed.id}
                      deedHash={deed.deed_hash}
                      status={deed.status}
                      billAmount={deed.principal_amount}
                      purchasePrice={deed.purchase_price || 0}
                      discountRate={deed.discount_rate || 0}
                      invoiceNumber={(deed.document_content as { invoiceNumber?: string })?.invoiceNumber || 'N/A'}
                      parties={{
                        assignor: {
                          id: deed.assignor_id,
                          name: getPartyName(deed.assignor_id),
                          role: 'assignor',
                          signedAt: deed.assignor_signed_at,
                          signature: deed.assignor_signature,
                          walletAddress: deed.assignor_wallet_address,
                        },
                        procuringEntity: {
                          id: deed.procuring_entity_id,
                          name: getPartyName(deed.procuring_entity_id),
                          role: 'procuring_entity',
                          signedAt: deed.procuring_entity_signed_at,
                          signature: deed.procuring_entity_signature,
                          walletAddress: deed.procuring_entity_wallet_address,
                        },
                        servicingAgent: deed.servicing_agent_id ? {
                          id: deed.servicing_agent_id,
                          name: getPartyName(deed.servicing_agent_id),
                          role: 'servicing_agent',
                          signedAt: deed.servicing_agent_signed_at,
                          signature: deed.servicing_agent_signature,
                          walletAddress: deed.servicing_agent_wallet_address,
                        } : null,
                      }}
                      blockchainTxHash={deed.blockchain_tx_hash}
                      blockNumber={deed.block_number}
                      network={deed.network}
                      canSign={false}
                      currentUserRole={null}
                      onSign={async () => {}}
                      isLoading={blockchainLoading}
                    />
                    
                    {/* Generate Note Button */}
                    {deed.status === 'fully_executed' && (
                      <div className="mt-3 flex justify-end">
                        <Dialog open={generateDialogOpen && selectedDeed?.id === deed.id} onOpenChange={(open) => {
                          setGenerateDialogOpen(open);
                          if (open) setSelectedDeed(deed);
                          else setSelectedDeed(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button className="gap-2">
                              <Plus className="w-4 h-4" />
                              Generate Receivable Note
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Generate Receivable Note</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <p className="text-sm text-muted-foreground">
                                Create a receivable note backed by the fully executed Deed of Assignment.
                              </p>
                              <div className="p-3 rounded-lg bg-muted/30">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Face Value:</span>
                                  <span className="font-bold">₦{deed.principal_amount.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Maturity Date</Label>
                                <Input
                                  type="date"
                                  value={maturityDate}
                                  onChange={(e) => setMaturityDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <Button 
                                onClick={handleGenerateNote}
                                disabled={!maturityDate || blockchainLoading}
                                className="w-full"
                              >
                                {blockchainLoading ? 'Generating...' : 'Generate Note'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {notes.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Coins className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Receivable Notes</h3>
                    <p className="text-muted-foreground text-sm">
                      Generate receivable notes from fully executed deeds.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {notes.map(note => (
                  <ReceivableNoteCard
                    key={note.id}
                    noteId={note.id}
                    noteNumber={note.note_number}
                    faceValue={note.face_value}
                    issueDate={note.issue_date}
                    maturityDate={note.maturity_date}
                    status={note.status}
                    tokenId={note.token_id}
                    tokenContractAddress={note.token_contract_address}
                    mintTxHash={note.mint_tx_hash}
                    network={note.network}
                    deedHash={(note.metadata as { deedHash?: string })?.deedHash || ''}
                    canMint={true}
                    onMint={(wallet) => handleMintNote(note.id, wallet)}
                    isLoading={blockchainLoading}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PortalLayout>
  );
};

export default SPVBlockchainPage;
