import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserConfig {
  email: string;
  password: string;
  role: 'supplier' | 'spv' | 'mda' | 'treasury' | 'admin';
  profile: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Fetch MDAs for reference
    const { data: mdas } = await supabase.from('mdas').select('id, name');
    const mdaList = mdas || [];

    // Define demo users with IDENTIFIABLE emails
    const users: UserConfig[] = [];
    const password = 'demo1234';

    // Supplier accounts - named by company
    const suppliers = [
      { email: 'apex@demo.com', company: 'Apex Construction Ltd', name: 'Chidi Okonkwo' },
      { email: 'buildright@demo.com', company: 'BuildRight Nigeria', name: 'Amaka Eze' },
      { email: 'techsupply@demo.com', company: 'TechSupply Co', name: 'Emeka Nwosu' },
      { email: 'medequip@demo.com', company: 'MedEquip Solutions', name: 'Ngozi Adeyemi' },
      { email: 'foodserve@demo.com', company: 'FoodServe Enterprises', name: 'Tunde Bakare' },
      { email: 'cleanenergy@demo.com', company: 'CleanEnergy Systems', name: 'Funke Adeleke' },
    ];

    for (let i = 0; i < suppliers.length; i++) {
      const s = suppliers[i];
      users.push({
        email: s.email,
        password,
        role: 'supplier',
        profile: {
          full_name: s.name,
          company_name: s.company,
          registration_number: `RC${100000 + i}`,
          tax_id: `TIN${200000 + i}`,
          phone: `+234801${String(i).padStart(7, '0')}`,
          address: `${i + 1} Industrial Avenue, Lagos`,
          bank_name: ['First Bank', 'GTBank', 'Zenith Bank', 'Access Bank'][i % 4],
          bank_account: `${1000000000 + i}`,
          profile_completed: true,
        }
      });
    }

    // SPV accounts - named by SPV name
    const spvs = [
      { email: 'alpha.capital@demo.com', spv: 'Alpha Capital SPV', name: 'Adekunle Johnson' },
      { email: 'beta.investments@demo.com', spv: 'Beta Investments', name: 'Chioma Onyekachi' },
      { email: 'gamma.finance@demo.com', spv: 'Gamma Finance', name: 'Ibrahim Yusuf' },
      { email: 'delta.funding@demo.com', spv: 'Delta Funding', name: 'Oluwaseun Alade' },
    ];

    for (let i = 0; i < spvs.length; i++) {
      const s = spvs[i];
      users.push({
        email: s.email,
        password,
        role: 'spv',
        profile: {
          full_name: s.name,
          spv_name: s.spv,
          license_number: `SPV-LIC-${3000 + i}`,
          phone: `+234802${String(i).padStart(7, '0')}`,
          profile_completed: true,
        }
      });
    }

    // MDA accounts - named by MDA code for easy identification
    // These match specific MDAs in the database
    const mdaAccounts = [
      { email: 'mow@demo.com', mdaCode: 'MOW', mdaName: 'Ministry of Works', name: 'James Mwangi', dept: 'Procurement' },
      { email: 'moh@demo.com', mdaCode: 'MOH', mdaName: 'Ministry of Health', name: 'Amina Wanjiku', dept: 'Finance' },
      { email: 'moe@demo.com', mdaCode: 'MOE', mdaName: 'Ministry of Education', name: 'Peter Ochieng', dept: 'Administration' },
      { email: 'moit@demo.com', mdaCode: 'MOIT', mdaName: 'Ministry of ICT', name: 'Grace Nyambura', dept: 'Procurement' },
      { email: 'moa@demo.com', mdaCode: 'MOA', mdaName: 'Ministry of Agriculture', name: 'Joseph Kiprop', dept: 'Finance' },
      { email: 'mod@demo.com', mdaCode: 'MOD', mdaName: 'Ministry of Defence', name: 'Sarah Akinyi', dept: 'Procurement' },
    ];

    for (let i = 0; i < mdaAccounts.length; i++) {
      const m = mdaAccounts[i];
      // Find matching MDA from database
      const mda = mdaList.find(x => x.name?.includes(m.mdaCode) || x.name === m.mdaName);
      users.push({
        email: m.email,
        password,
        role: 'mda',
        profile: {
          full_name: m.name,
          mda_name: mda?.name || m.mdaName,
          mda_code: mda?.id || null,
          department: m.dept,
          phone: `+234803${String(i).padStart(7, '0')}`,
          profile_completed: true,
        }
      });
    }

    // Treasury accounts - named by office
    const treasuryAccounts = [
      { email: 'national.treasury@demo.com', office: 'National Treasury', name: 'John Kamau', empId: 'NT-4001' },
      { email: 'county.treasury@demo.com', office: 'County Treasury', name: 'Mary Njeri', empId: 'NT-4002' },
      { email: 'cbk.liaison@demo.com', office: 'Central Bank Liaison', name: 'David Omondi', empId: 'NT-4003' },
    ];

    for (let i = 0; i < treasuryAccounts.length; i++) {
      const t = treasuryAccounts[i];
      users.push({
        email: t.email,
        password,
        role: 'treasury',
        profile: {
          full_name: t.name,
          treasury_office: t.office,
          employee_id: t.empId,
          phone: `+234804${String(i).padStart(7, '0')}`,
          profile_completed: true,
        }
      });
    }

    // Admin accounts
    users.push({
      email: 'admin@demo.com',
      password,
      role: 'admin',
      profile: {
        full_name: 'System Administrator',
        profile_completed: true,
      }
    });
    users.push({
      email: 'platform.admin@demo.com',
      password,
      role: 'admin',
      profile: {
        full_name: 'Platform Manager',
        profile_completed: true,
      }
    });

    const results = { created: 0, skipped: 0, errors: [] as string[] };
    const createdSupplierIds: string[] = [];

    // Create users
    for (const user of users) {
      try {
        // Check if user exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const exists = existingUsers?.users?.find(u => u.email === user.email);
        
        if (exists) {
          results.skipped++;
          if (user.role === 'supplier') {
            createdSupplierIds.push(exists.id);
          }
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { full_name: user.profile.full_name }
        });

        if (authError) {
          results.errors.push(`${user.email}: ${authError.message}`);
          continue;
        }

        const userId = authData.user.id;

        // Add role
        await supabase.from('user_roles').insert({
          user_id: userId,
          role: user.role
        });

        // Update profile
        await supabase.from('profiles').update({
          ...user.profile,
          email: user.email
        }).eq('user_id', userId);

        results.created++;

        if (user.role === 'supplier') {
          createdSupplierIds.push(userId);
        }

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        results.errors.push(`${user.email}: ${errorMessage}`);
      }
    }

    // Create sample bills for suppliers
    const billDescriptions = [
      'Supply of office equipment and furniture',
      'Road construction and maintenance services',
      'IT infrastructure upgrade and support',
      'Medical supplies and equipment',
      'Catering services for government events',
      'Security services and equipment',
      'Vehicle maintenance and repairs',
      'Building renovation and repairs',
      'Educational materials supply',
      'Agricultural equipment and supplies'
    ];

    let billsCreated = 0;

    for (let i = 0; i < Math.min(createdSupplierIds.length, 8); i++) {
      const supplierId = createdSupplierIds[i];
      const mda = mdaList[i % mdaList.length];
      
      if (!mda) continue;

      // Create 2-3 bills per supplier
      const numBills = 2 + (i % 2);
      
      for (let j = 0; j < numBills; j++) {
        const amount = (Math.floor(Math.random() * 50) + 5) * 1000000; // 5M to 55M
        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 30));

        await supabase.from('bills').insert({
          supplier_id: supplierId,
          mda_id: mda.id,
          invoice_number: `INV-${2025}-${String(i * 10 + j + 1).padStart(4, '0')}`,
          invoice_date: invoiceDate.toISOString().split('T')[0],
          due_date: new Date(invoiceDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount,
          currency: 'NGN',
          description: billDescriptions[(i + j) % billDescriptions.length],
          work_description: `Completed work as per contract agreement for ${mda.name}`,
          contract_reference: `CTR-${2024}-${String(i * 10 + j + 100).padStart(4, '0')}`,
          status: 'submitted',
          status_history: JSON.stringify([{
            status: 'submitted',
            timestamp: new Date().toISOString(),
            note: 'Bill submitted by supplier'
          }])
        });

        billsCreated++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${results.created} users, skipped ${results.skipped} existing users, created ${billsCreated} sample bills`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
