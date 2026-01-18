import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6.9.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sepolia testnet configuration
const SEPOLIA_RPC = 'https://rpc.sepolia.org';
const DEED_CONTRACT_ABI = [
  'function createDeed(bytes32 deedHash, address assignor, address procuringEntity, address servicingAgent, uint256 amount) external returns (uint256)',
  'function signDeed(uint256 deedId) external',
  'function getDeedStatus(uint256 deedId) external view returns (uint8)',
  'event DeedCreated(uint256 indexed deedId, bytes32 deedHash, address assignor)',
  'event DeedSigned(uint256 indexed deedId, address signer, uint8 signatureIndex)',
  'event DeedFullyExecuted(uint256 indexed deedId, uint256 timestamp)',
];

// Generate a cryptographic hash of the deed content
function hashDeedContent(content: Record<string, unknown>): string {
  const jsonStr = JSON.stringify(content, Object.keys(content).sort());
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonStr);
  return ethers.keccak256(data);
}

// Generate a simulated blockchain signature (for testnet demonstration)
function generateSignature(message: string, signerType: string): string {
  const timestamp = Date.now();
  const combined = `${message}-${signerType}-${timestamp}`;
  return ethers.keccak256(ethers.toUtf8Bytes(combined));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { action, ...params } = await req.json();
    console.log(`Blockchain deed action: ${action}`, params);

    switch (action) {
      case 'create_deed': {
        const { billId, assignorId, procuringEntityId, principalAmount, discountRate, purchasePrice, documentContent } = params;
        
        // Generate deed hash from content
        const deedHash = hashDeedContent({
          billId,
          assignorId,
          procuringEntityId,
          principalAmount,
          discountRate,
          purchasePrice,
          timestamp: new Date().toISOString(),
          documentContent,
        });

        // Create deed record
        const { data: deed, error: deedError } = await supabase
          .from('blockchain_deeds')
          .insert({
            bill_id: billId,
            deed_hash: deedHash,
            network: 'sepolia',
            assignor_id: assignorId,
            procuring_entity_id: procuringEntityId,
            principal_amount: principalAmount,
            discount_rate: discountRate,
            purchase_price: purchasePrice,
            status: 'pending_assignor',
            document_content: documentContent,
          })
          .select()
          .single();

        if (deedError) {
          console.error('Failed to create deed:', deedError);
          throw new Error(`Failed to create deed: ${deedError.message}`);
        }

        // Update bill status
        await supabase
          .from('bills')
          .update({ status: 'agreement_sent' })
          .eq('id', billId);

        // Notify the assignor (supplier)
        await supabase.from('notifications').insert({
          user_id: assignorId,
          title: 'Deed of Assignment Ready for Signing',
          message: `A tripartite Deed of Assignment requires your signature. Hash: ${deedHash.slice(0, 16)}...`,
          type: 'deed',
          bill_id: billId,
        });

        console.log('Deed created successfully:', deed.id);
        return new Response(JSON.stringify({ 
          success: true, 
          deed,
          message: 'Deed created and awaiting assignor signature' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sign_deed': {
        const { deedId, walletAddress, signerRole } = params;

        // Fetch the deed
        const { data: deed, error: fetchError } = await supabase
          .from('blockchain_deeds')
          .select('*')
          .eq('id', deedId)
          .single();

        if (fetchError || !deed) {
          throw new Error('Deed not found');
        }

        // Verify the signer has the right to sign
        const expectedStatus = `pending_${signerRole}`;
        if (deed.status !== expectedStatus) {
          throw new Error(`Deed is not ready for ${signerRole} signature. Current status: ${deed.status}`);
        }

        // Generate signature
        const signature = generateSignature(deed.deed_hash, signerRole);

        // Determine next status and update fields
        let updateData: Record<string, unknown> = {};
        let nextStatus: string;

        switch (signerRole) {
          case 'assignor':
            updateData = {
              assignor_signed_at: new Date().toISOString(),
              assignor_signature: signature,
              assignor_wallet_address: walletAddress,
              status: 'pending_procuring_entity',
            };
            nextStatus = 'pending_procuring_entity';
            break;
          case 'procuring_entity':
            updateData = {
              procuring_entity_signed_at: new Date().toISOString(),
              procuring_entity_signature: signature,
              procuring_entity_wallet_address: walletAddress,
              status: 'pending_servicing_agent',
            };
            nextStatus = 'pending_servicing_agent';
            break;
          case 'servicing_agent':
            updateData = {
              servicing_agent_id: user.id,
              servicing_agent_signed_at: new Date().toISOString(),
              servicing_agent_signature: signature,
              servicing_agent_wallet_address: walletAddress,
              status: 'fully_executed',
              executed_at: new Date().toISOString(),
              // Simulate blockchain transaction
              blockchain_tx_hash: `0x${ethers.hexlify(ethers.randomBytes(32)).slice(2)}`,
              block_number: Math.floor(Math.random() * 1000000) + 5000000,
              gas_used: Math.floor(Math.random() * 100000) + 50000,
            };
            nextStatus = 'fully_executed';
            break;
          default:
            throw new Error('Invalid signer role');
        }

        // Update the deed
        const { data: updatedDeed, error: updateError } = await supabase
          .from('blockchain_deeds')
          .update(updateData)
          .eq('id', deedId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update deed: ${updateError.message}`);
        }

        // Send notifications based on next step
        if (nextStatus === 'pending_procuring_entity') {
          // Get MDA user to notify (we need to find an MDA user for this bill's MDA)
          const { data: bill } = await supabase
            .from('bills')
            .select('mda_id')
            .eq('id', deed.bill_id)
            .single();

          if (bill) {
            const { data: mdaProfiles } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('mda_name', (await supabase.from('mdas').select('name').eq('id', bill.mda_id).single()).data?.name);

            if (mdaProfiles && mdaProfiles.length > 0) {
              await supabase.from('notifications').insert({
                user_id: mdaProfiles[0].user_id,
                title: 'Deed of Assignment Requires Your Signature',
                message: `The assignor has signed. Your signature as Procuring Entity is now required.`,
                type: 'deed',
                bill_id: deed.bill_id,
              });
            }
          }
        } else if (nextStatus === 'pending_servicing_agent') {
          // Notify Treasury users
          const { data: treasuryRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'treasury');

          if (treasuryRoles) {
            for (const role of treasuryRoles) {
              await supabase.from('notifications').insert({
                user_id: role.user_id,
                title: 'Deed of Assignment Requires Treasury Signature',
                message: `Assignor and Procuring Entity have signed. Your signature as Servicing Agent is required to complete the deed.`,
                type: 'deed',
                bill_id: deed.bill_id,
              });
            }
          }
        } else if (nextStatus === 'fully_executed') {
          // Update bill status to certified
          await supabase
            .from('bills')
            .update({ status: 'certified', treasury_certified_date: new Date().toISOString() })
            .eq('id', deed.bill_id);

          // Notify SPV to generate receivable notes
          const { data: spvRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'spv');

          if (spvRoles) {
            for (const role of spvRoles) {
              await supabase.from('notifications').insert({
                user_id: role.user_id,
                title: 'Deed Fully Executed - Generate Receivable Notes',
                message: `The tripartite Deed of Assignment is fully executed. You can now generate receivable notes for sale.`,
                type: 'deed',
                bill_id: deed.bill_id,
              });
            }
          }

          // Notify assignor
          await supabase.from('notifications').insert({
            user_id: deed.assignor_id,
            title: 'Deed of Assignment Fully Executed',
            message: `Your Deed of Assignment has been signed by all parties and recorded on the blockchain.`,
            type: 'deed',
            bill_id: deed.bill_id,
          });
        }

        console.log(`Deed ${deedId} signed by ${signerRole}`);
        return new Response(JSON.stringify({ 
          success: true, 
          deed: updatedDeed,
          signature,
          message: `Deed signed by ${signerRole}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_receivable_note': {
        const { deedId, maturityDate, metadata } = params;

        // Fetch the deed
        const { data: deed, error: deedError } = await supabase
          .from('blockchain_deeds')
          .select('*, bills(*)')
          .eq('id', deedId)
          .single();

        if (deedError || !deed) {
          throw new Error('Deed not found');
        }

        if (deed.status !== 'fully_executed') {
          throw new Error('Cannot generate receivable note for deed that is not fully executed');
        }

        // Generate unique note number
        const noteNumber = `RN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Generate token URI (simulated IPFS)
        const tokenUri = `ipfs://Qm${ethers.hexlify(ethers.randomBytes(32)).slice(2)}`;

        // Create receivable note
        const { data: note, error: noteError } = await supabase
          .from('receivable_notes')
          .insert({
            deed_id: deedId,
            bill_id: deed.bill_id,
            note_number: noteNumber,
            face_value: deed.principal_amount,
            maturity_date: maturityDate,
            issuer_id: user.id,
            token_uri: tokenUri,
            network: 'sepolia',
            status: 'draft',
            metadata: {
              ...metadata,
              deedHash: deed.deed_hash,
              assignor: deed.assignor_id,
              procuringEntity: deed.procuring_entity_id,
              servicingAgent: deed.servicing_agent_id,
              discountRate: deed.discount_rate,
              purchasePrice: deed.purchase_price,
            },
          })
          .select()
          .single();

        if (noteError) {
          throw new Error(`Failed to create receivable note: ${noteError.message}`);
        }

        console.log('Receivable note created:', note.id);
        return new Response(JSON.stringify({ 
          success: true, 
          note,
          message: 'Receivable note created successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'mint_receivable_note': {
        const { noteId, walletAddress } = params;

        // Fetch the note
        const { data: note, error: noteError } = await supabase
          .from('receivable_notes')
          .select('*')
          .eq('id', noteId)
          .single();

        if (noteError || !note) {
          throw new Error('Receivable note not found');
        }

        if (note.status !== 'draft') {
          throw new Error('Note has already been minted');
        }

        // Simulate minting (in production, this would interact with a real smart contract)
        const mintTxHash = `0x${ethers.hexlify(ethers.randomBytes(32)).slice(2)}`;
        const tokenId = Math.floor(Math.random() * 1000000).toString();
        const tokenContractAddress = '0x' + ethers.hexlify(ethers.randomBytes(20)).slice(2);

        // Update the note
        const { data: mintedNote, error: updateError } = await supabase
          .from('receivable_notes')
          .update({
            status: 'minted',
            token_id: tokenId,
            token_contract_address: tokenContractAddress,
            mint_tx_hash: mintTxHash,
            issuer_wallet_address: walletAddress,
          })
          .eq('id', noteId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to mint note: ${updateError.message}`);
        }

        console.log('Receivable note minted:', mintedNote);
        return new Response(JSON.stringify({ 
          success: true, 
          note: mintedNote,
          tokenId,
          txHash: mintTxHash,
          message: 'Receivable note minted as NFT' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_deed': {
        const { deedId, billId } = params;

        let query = supabase.from('blockchain_deeds').select('*');
        
        if (deedId) {
          query = query.eq('id', deedId);
        } else if (billId) {
          query = query.eq('bill_id', billId);
        }

        const { data: deeds, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch deed: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, deeds }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_receivable_notes': {
        const { deedId, issuerId } = params;

        let query = supabase.from('receivable_notes').select('*, blockchain_deeds(*)');
        
        if (deedId) {
          query = query.eq('deed_id', deedId);
        }
        if (issuerId) {
          query = query.eq('issuer_id', issuerId);
        }

        const { data: notes, error } = await query;

        if (error) {
          throw new Error(`Failed to fetch receivable notes: ${error.message}`);
        }

        return new Response(JSON.stringify({ success: true, notes }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Blockchain deed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
