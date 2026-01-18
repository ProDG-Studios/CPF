-- Create role enum
CREATE TYPE public.app_role AS ENUM ('supplier', 'spv', 'mda', 'treasury', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    -- Supplier-specific fields
    company_name TEXT,
    registration_number TEXT,
    tax_id TEXT,
    address TEXT,
    bank_name TEXT,
    bank_account TEXT,
    -- MDA-specific fields
    mda_name TEXT,
    mda_code TEXT,
    department TEXT,
    -- SPV-specific fields
    spv_name TEXT,
    license_number TEXT,
    -- Treasury-specific fields
    treasury_office TEXT,
    employee_id TEXT,
    -- General
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "SPV can view supplier and MDA profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'spv') AND 
    (
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = profiles.user_id AND role = 'supplier') OR
        EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = profiles.user_id AND role = 'mda')
    )
);

CREATE POLICY "Treasury can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'treasury'));

-- Create MDAs reference table
CREATE TABLE public.mdas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    department TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mdas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view MDAs"
ON public.mdas
FOR SELECT
TO authenticated
USING (true);

-- Create bill status enum
CREATE TYPE public.bill_status AS ENUM (
    'submitted',
    'under_review',
    'offer_made',
    'offer_accepted',
    'mda_reviewing',
    'mda_approved',
    'terms_set',
    'agreement_sent',
    'treasury_reviewing',
    'certified',
    'rejected'
);

-- Create bills table
CREATE TABLE public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mda_id UUID REFERENCES public.mdas(id) NOT NULL,
    
    -- Invoice details
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(15,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    description TEXT,
    
    -- Work details
    contract_reference TEXT,
    work_description TEXT,
    work_start_date DATE,
    work_end_date DATE,
    delivery_date DATE,
    
    -- Document
    invoice_document_url TEXT,
    supporting_documents JSONB DEFAULT '[]',
    
    -- Status tracking
    status bill_status NOT NULL DEFAULT 'submitted',
    status_history JSONB DEFAULT '[]',
    
    -- SPV offer details
    spv_id UUID REFERENCES auth.users(id),
    offer_amount DECIMAL(15,2),
    offer_discount_rate DECIMAL(5,2),
    offer_date TIMESTAMP WITH TIME ZONE,
    offer_accepted_date TIMESTAMP WITH TIME ZONE,
    
    -- MDA approval
    mda_approved_by UUID REFERENCES auth.users(id),
    mda_approved_date TIMESTAMP WITH TIME ZONE,
    mda_notes TEXT,
    
    -- Payment terms
    payment_terms JSONB,
    payment_quarters INTEGER,
    payment_start_quarter TEXT,
    
    -- Agreement
    agreement_document_url TEXT,
    agreement_date TIMESTAMP WITH TIME ZONE,
    
    -- Treasury certification
    treasury_certified_by UUID REFERENCES auth.users(id),
    treasury_certified_date TIMESTAMP WITH TIME ZONE,
    certificate_number TEXT,
    certificate_document_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- RLS policies for bills
CREATE POLICY "Suppliers can view their own bills"
ON public.bills
FOR SELECT
TO authenticated
USING (supplier_id = auth.uid());

CREATE POLICY "Suppliers can insert their own bills"
ON public.bills
FOR INSERT
TO authenticated
WITH CHECK (supplier_id = auth.uid() AND public.has_role(auth.uid(), 'supplier'));

CREATE POLICY "SPV can view all submitted bills"
ON public.bills
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'spv'));

CREATE POLICY "SPV can update bills they've made offers on"
ON public.bills
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'spv'));

CREATE POLICY "MDA users can view bills for their MDA"
ON public.bills
FOR SELECT
TO authenticated
USING (
    public.has_role(auth.uid(), 'mda') AND
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.mda_name = (SELECT name FROM public.mdas WHERE id = bills.mda_id)
    )
);

CREATE POLICY "MDA users can update bills for their MDA"
ON public.bills
FOR UPDATE
TO authenticated
USING (
    public.has_role(auth.uid(), 'mda') AND
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.mda_name = (SELECT name FROM public.mdas WHERE id = bills.mda_id)
    )
);

CREATE POLICY "Treasury can view all bills"
ON public.bills
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'treasury'));

CREATE POLICY "Treasury can update bills"
ON public.bills
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'treasury'));

CREATE POLICY "Admins can do everything on bills"
ON public.bills
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create activity_logs table for audit trail
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES public.bills(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for bills they have access to"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.bills b 
        WHERE b.id = activity_logs.bill_id 
        AND (
            b.supplier_id = auth.uid() OR
            b.spv_id = auth.uid() OR
            public.has_role(auth.uid(), 'mda') OR
            public.has_role(auth.uid(), 'treasury') OR
            public.has_role(auth.uid(), 'admin')
        )
    )
);

CREATE POLICY "System can insert logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger function for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (
        NEW.id, 
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name'
    );
    RETURN NEW;
END;
$$;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at
    BEFORE UPDATE ON public.bills
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();