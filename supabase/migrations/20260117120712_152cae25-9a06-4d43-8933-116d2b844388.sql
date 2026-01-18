-- Create blockchain deeds table for tripartite Deed of Assignment
CREATE TABLE public.blockchain_deeds (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    deed_hash TEXT NOT NULL,
    contract_address TEXT,
    network TEXT NOT NULL DEFAULT 'sepolia',
    
    -- Tripartite parties
    assignor_id UUID NOT NULL, -- Supplier
    assignor_signed_at TIMESTAMP WITH TIME ZONE,
    assignor_signature TEXT,
    assignor_wallet_address TEXT,
    
    procuring_entity_id UUID NOT NULL, -- MDA
    procuring_entity_signed_at TIMESTAMP WITH TIME ZONE,
    procuring_entity_signature TEXT,
    procuring_entity_wallet_address TEXT,
    
    servicing_agent_id UUID, -- Treasury
    servicing_agent_signed_at TIMESTAMP WITH TIME ZONE,
    servicing_agent_signature TEXT,
    servicing_agent_wallet_address TEXT,
    
    -- Deed details
    principal_amount NUMERIC NOT NULL,
    discount_rate NUMERIC,
    purchase_price NUMERIC,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending_assignor',
    -- pending_assignor, pending_procuring_entity, pending_servicing_agent, fully_executed, rejected
    
    blockchain_tx_hash TEXT,
    block_number BIGINT,
    gas_used NUMERIC,
    
    -- Metadata
    document_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    executed_at TIMESTAMP WITH TIME ZONE
);

-- Create receivable notes table
CREATE TABLE public.receivable_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    deed_id UUID NOT NULL REFERENCES public.blockchain_deeds(id) ON DELETE CASCADE,
    bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
    
    -- Note details
    note_number TEXT NOT NULL UNIQUE,
    face_value NUMERIC NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    maturity_date DATE,
    
    -- Issuer (SPV)
    issuer_id UUID NOT NULL,
    issuer_wallet_address TEXT,
    
    -- Token details (NFT)
    token_id TEXT,
    token_contract_address TEXT,
    token_uri TEXT,
    
    -- Blockchain
    mint_tx_hash TEXT,
    network TEXT NOT NULL DEFAULT 'sepolia',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft',
    -- draft, minted, listed, sold, redeemed
    
    -- Metadata
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blockchain_deeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivable_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for blockchain_deeds
CREATE POLICY "Suppliers can view deeds they are assignors on"
ON public.blockchain_deeds FOR SELECT
USING (assignor_id = auth.uid());

CREATE POLICY "MDA users can view deeds for their entities"
ON public.blockchain_deeds FOR SELECT
USING (has_role(auth.uid(), 'mda'::app_role));

CREATE POLICY "Treasury can view all deeds"
ON public.blockchain_deeds FOR SELECT
USING (has_role(auth.uid(), 'treasury'::app_role));

CREATE POLICY "SPV can view and manage all deeds"
ON public.blockchain_deeds FOR ALL
USING (has_role(auth.uid(), 'spv'::app_role));

CREATE POLICY "Admin can do everything on deeds"
ON public.blockchain_deeds FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Signing policies (UPDATE)
CREATE POLICY "Assignors can sign their deeds"
ON public.blockchain_deeds FOR UPDATE
USING (assignor_id = auth.uid() AND status = 'pending_assignor');

CREATE POLICY "MDA can sign deeds as procuring entity"
ON public.blockchain_deeds FOR UPDATE
USING (has_role(auth.uid(), 'mda'::app_role) AND status = 'pending_procuring_entity');

CREATE POLICY "Treasury can sign deeds as servicing agent"
ON public.blockchain_deeds FOR UPDATE
USING (has_role(auth.uid(), 'treasury'::app_role) AND status = 'pending_servicing_agent');

-- RLS policies for receivable_notes
CREATE POLICY "Issuers can view and manage their notes"
ON public.receivable_notes FOR ALL
USING (issuer_id = auth.uid() OR has_role(auth.uid(), 'spv'::app_role));

CREATE POLICY "Treasury can view all notes"
ON public.receivable_notes FOR SELECT
USING (has_role(auth.uid(), 'treasury'::app_role));

CREATE POLICY "Admin can do everything on notes"
ON public.receivable_notes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_blockchain_deeds_bill_id ON public.blockchain_deeds(bill_id);
CREATE INDEX idx_blockchain_deeds_status ON public.blockchain_deeds(status);
CREATE INDEX idx_receivable_notes_deed_id ON public.receivable_notes(deed_id);
CREATE INDEX idx_receivable_notes_issuer_id ON public.receivable_notes(issuer_id);

-- Add triggers for updated_at
CREATE TRIGGER update_blockchain_deeds_updated_at
    BEFORE UPDATE ON public.blockchain_deeds
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receivable_notes_updated_at
    BEFORE UPDATE ON public.receivable_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();