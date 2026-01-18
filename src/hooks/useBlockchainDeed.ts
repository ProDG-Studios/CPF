import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeedContent {
  billId: string;
  assignorName: string;
  procuringEntityName: string;
  principalAmount: number;
  discountRate: number;
  purchasePrice: number;
  invoiceNumber: string;
  invoiceDate: string;
  description?: string;
}

interface BlockchainDeed {
  id: string;
  bill_id: string;
  deed_hash: string;
  network: string;
  status: string;
  assignor_id: string;
  assignor_signed_at: string | null;
  assignor_signature: string | null;
  procuring_entity_id: string;
  procuring_entity_signed_at: string | null;
  procuring_entity_signature: string | null;
  servicing_agent_id: string | null;
  servicing_agent_signed_at: string | null;
  servicing_agent_signature: string | null;
  principal_amount: number;
  discount_rate: number | null;
  purchase_price: number | null;
  blockchain_tx_hash: string | null;
  block_number: number | null;
  executed_at: string | null;
  document_content: Record<string, unknown>;
  created_at: string;
}

interface ReceivableNote {
  id: string;
  deed_id: string;
  bill_id: string;
  note_number: string;
  face_value: number;
  issue_date: string;
  maturity_date: string | null;
  issuer_id: string;
  token_id: string | null;
  token_contract_address: string | null;
  mint_tx_hash: string | null;
  status: string;
  metadata: Record<string, unknown>;
}

export function useBlockchainDeed() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callBlockchainFunction = useCallback(async (action: string, params: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error: fnError } = await supabase.functions.invoke('blockchain-deed', {
        body: { action, ...params },
      });

      if (fnError) {
        throw fnError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeed = useCallback(async (
    billId: string,
    assignorId: string,
    procuringEntityId: string,
    principalAmount: number,
    discountRate: number,
    purchasePrice: number,
    documentContent: DeedContent
  ): Promise<BlockchainDeed> => {
    const result = await callBlockchainFunction('create_deed', {
      billId,
      assignorId,
      procuringEntityId,
      principalAmount,
      discountRate,
      purchasePrice,
      documentContent,
    });
    
    toast.success('Deed of Assignment created on blockchain');
    return result.deed;
  }, [callBlockchainFunction]);

  const signDeed = useCallback(async (
    deedId: string,
    walletAddress: string,
    signerRole: 'assignor' | 'procuring_entity' | 'servicing_agent'
  ): Promise<{ deed: BlockchainDeed; signature: string }> => {
    const result = await callBlockchainFunction('sign_deed', {
      deedId,
      walletAddress,
      signerRole,
    });
    
    const roleLabels = {
      assignor: 'Assignor (Supplier)',
      procuring_entity: 'Procuring Entity (MDA)',
      servicing_agent: 'Servicing Agent (Treasury)',
    };
    
    toast.success(`Deed signed by ${roleLabels[signerRole]}`);
    return { deed: result.deed, signature: result.signature };
  }, [callBlockchainFunction]);

  const generateReceivableNote = useCallback(async (
    deedId: string,
    maturityDate: string,
    metadata?: Record<string, unknown>
  ): Promise<ReceivableNote> => {
    const result = await callBlockchainFunction('generate_receivable_note', {
      deedId,
      maturityDate,
      metadata,
    });
    
    toast.success('Receivable note generated');
    return result.note;
  }, [callBlockchainFunction]);

  const mintReceivableNote = useCallback(async (
    noteId: string,
    walletAddress: string
  ): Promise<ReceivableNote> => {
    const result = await callBlockchainFunction('mint_receivable_note', {
      noteId,
      walletAddress,
    });
    
    toast.success(`Receivable note minted as NFT (Token ID: ${result.tokenId})`);
    return result.note;
  }, [callBlockchainFunction]);

  const getDeed = useCallback(async (
    params: { deedId?: string; billId?: string }
  ): Promise<BlockchainDeed[]> => {
    const result = await callBlockchainFunction('get_deed', params);
    return result.deeds;
  }, [callBlockchainFunction]);

  const getReceivableNotes = useCallback(async (
    params: { deedId?: string; issuerId?: string }
  ): Promise<ReceivableNote[]> => {
    const result = await callBlockchainFunction('get_receivable_notes', params);
    return result.notes;
  }, [callBlockchainFunction]);

  return {
    loading,
    error,
    createDeed,
    signDeed,
    generateReceivableNote,
    mintReceivableNote,
    getDeed,
    getReceivableNotes,
  };
}
