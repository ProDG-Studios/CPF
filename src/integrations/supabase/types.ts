export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          bill_id: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          bill_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          bill_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          agreement_date: string | null
          agreement_document_url: string | null
          amount: number
          certificate_document_url: string | null
          certificate_number: string | null
          contract_reference: string | null
          created_at: string
          currency: string | null
          delivery_date: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_document_url: string | null
          invoice_number: string
          mda_approved_by: string | null
          mda_approved_date: string | null
          mda_id: string
          mda_notes: string | null
          offer_accepted_date: string | null
          offer_amount: number | null
          offer_date: string | null
          offer_discount_rate: number | null
          payment_quarters: number | null
          payment_start_quarter: string | null
          payment_terms: Json | null
          spv_id: string | null
          status: Database["public"]["Enums"]["bill_status"]
          status_history: Json | null
          supplier_id: string
          supporting_documents: Json | null
          treasury_certified_by: string | null
          treasury_certified_date: string | null
          updated_at: string
          work_description: string | null
          work_end_date: string | null
          work_start_date: string | null
        }
        Insert: {
          agreement_date?: string | null
          agreement_document_url?: string | null
          amount: number
          certificate_document_url?: string | null
          certificate_number?: string | null
          contract_reference?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_document_url?: string | null
          invoice_number: string
          mda_approved_by?: string | null
          mda_approved_date?: string | null
          mda_id: string
          mda_notes?: string | null
          offer_accepted_date?: string | null
          offer_amount?: number | null
          offer_date?: string | null
          offer_discount_rate?: number | null
          payment_quarters?: number | null
          payment_start_quarter?: string | null
          payment_terms?: Json | null
          spv_id?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          status_history?: Json | null
          supplier_id: string
          supporting_documents?: Json | null
          treasury_certified_by?: string | null
          treasury_certified_date?: string | null
          updated_at?: string
          work_description?: string | null
          work_end_date?: string | null
          work_start_date?: string | null
        }
        Update: {
          agreement_date?: string | null
          agreement_document_url?: string | null
          amount?: number
          certificate_document_url?: string | null
          certificate_number?: string | null
          contract_reference?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_document_url?: string | null
          invoice_number?: string
          mda_approved_by?: string | null
          mda_approved_date?: string | null
          mda_id?: string
          mda_notes?: string | null
          offer_accepted_date?: string | null
          offer_amount?: number | null
          offer_date?: string | null
          offer_discount_rate?: number | null
          payment_quarters?: number | null
          payment_start_quarter?: string | null
          payment_terms?: Json | null
          spv_id?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          status_history?: Json | null
          supplier_id?: string
          supporting_documents?: Json | null
          treasury_certified_by?: string | null
          treasury_certified_date?: string | null
          updated_at?: string
          work_description?: string | null
          work_end_date?: string | null
          work_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_mda_id_fkey"
            columns: ["mda_id"]
            isOneToOne: false
            referencedRelation: "mdas"
            referencedColumns: ["id"]
          },
        ]
      }
      blockchain_deeds: {
        Row: {
          assignor_id: string
          assignor_signature: string | null
          assignor_signed_at: string | null
          assignor_wallet_address: string | null
          bill_id: string
          block_number: number | null
          blockchain_tx_hash: string | null
          contract_address: string | null
          created_at: string
          deed_hash: string
          discount_rate: number | null
          document_content: Json | null
          executed_at: string | null
          gas_used: number | null
          id: string
          network: string
          principal_amount: number
          procuring_entity_id: string
          procuring_entity_signature: string | null
          procuring_entity_signed_at: string | null
          procuring_entity_wallet_address: string | null
          purchase_price: number | null
          servicing_agent_id: string | null
          servicing_agent_signature: string | null
          servicing_agent_signed_at: string | null
          servicing_agent_wallet_address: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignor_id: string
          assignor_signature?: string | null
          assignor_signed_at?: string | null
          assignor_wallet_address?: string | null
          bill_id: string
          block_number?: number | null
          blockchain_tx_hash?: string | null
          contract_address?: string | null
          created_at?: string
          deed_hash: string
          discount_rate?: number | null
          document_content?: Json | null
          executed_at?: string | null
          gas_used?: number | null
          id?: string
          network?: string
          principal_amount: number
          procuring_entity_id: string
          procuring_entity_signature?: string | null
          procuring_entity_signed_at?: string | null
          procuring_entity_wallet_address?: string | null
          purchase_price?: number | null
          servicing_agent_id?: string | null
          servicing_agent_signature?: string | null
          servicing_agent_signed_at?: string | null
          servicing_agent_wallet_address?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignor_id?: string
          assignor_signature?: string | null
          assignor_signed_at?: string | null
          assignor_wallet_address?: string | null
          bill_id?: string
          block_number?: number | null
          blockchain_tx_hash?: string | null
          contract_address?: string | null
          created_at?: string
          deed_hash?: string
          discount_rate?: number | null
          document_content?: Json | null
          executed_at?: string | null
          gas_used?: number | null
          id?: string
          network?: string
          principal_amount?: number
          procuring_entity_id?: string
          procuring_entity_signature?: string | null
          procuring_entity_signed_at?: string | null
          procuring_entity_wallet_address?: string | null
          purchase_price?: number | null
          servicing_agent_id?: string | null
          servicing_agent_signature?: string | null
          servicing_agent_signed_at?: string | null
          servicing_agent_wallet_address?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_deeds_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      mdas: {
        Row: {
          address: string | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          department: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          department?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          department?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          bill_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          bill_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          bill_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account: string | null
          bank_name: string | null
          company_name: string | null
          created_at: string
          department: string | null
          email: string
          employee_id: string | null
          full_name: string | null
          id: string
          license_number: string | null
          mda_code: string | null
          mda_name: string | null
          phone: string | null
          profile_completed: boolean | null
          registration_number: string | null
          spv_name: string | null
          tax_id: string | null
          treasury_office: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          company_name?: string | null
          created_at?: string
          department?: string | null
          email: string
          employee_id?: string | null
          full_name?: string | null
          id?: string
          license_number?: string | null
          mda_code?: string | null
          mda_name?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          registration_number?: string | null
          spv_name?: string | null
          tax_id?: string | null
          treasury_office?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bank_name?: string | null
          company_name?: string | null
          created_at?: string
          department?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string | null
          id?: string
          license_number?: string | null
          mda_code?: string | null
          mda_name?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          registration_number?: string | null
          spv_name?: string | null
          tax_id?: string | null
          treasury_office?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receivable_notes: {
        Row: {
          bill_id: string
          created_at: string
          deed_id: string
          face_value: number
          id: string
          issue_date: string
          issuer_id: string
          issuer_wallet_address: string | null
          maturity_date: string | null
          metadata: Json | null
          mint_tx_hash: string | null
          network: string
          note_number: string
          status: string
          token_contract_address: string | null
          token_id: string | null
          token_uri: string | null
          updated_at: string
        }
        Insert: {
          bill_id: string
          created_at?: string
          deed_id: string
          face_value: number
          id?: string
          issue_date?: string
          issuer_id: string
          issuer_wallet_address?: string | null
          maturity_date?: string | null
          metadata?: Json | null
          mint_tx_hash?: string | null
          network?: string
          note_number: string
          status?: string
          token_contract_address?: string | null
          token_id?: string | null
          token_uri?: string | null
          updated_at?: string
        }
        Update: {
          bill_id?: string
          created_at?: string
          deed_id?: string
          face_value?: number
          id?: string
          issue_date?: string
          issuer_id?: string
          issuer_wallet_address?: string | null
          maturity_date?: string | null
          metadata?: Json | null
          mint_tx_hash?: string | null
          network?: string
          note_number?: string
          status?: string
          token_contract_address?: string | null
          token_id?: string | null
          token_uri?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_notes_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivable_notes_deed_id_fkey"
            columns: ["deed_id"]
            isOneToOne: false
            referencedRelation: "blockchain_deeds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "supplier" | "spv" | "mda" | "treasury" | "admin"
      bill_status:
        | "submitted"
        | "under_review"
        | "offer_made"
        | "offer_accepted"
        | "mda_reviewing"
        | "mda_approved"
        | "terms_set"
        | "agreement_sent"
        | "treasury_reviewing"
        | "certified"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["supplier", "spv", "mda", "treasury", "admin"],
      bill_status: [
        "submitted",
        "under_review",
        "offer_made",
        "offer_accepted",
        "mda_reviewing",
        "mda_approved",
        "terms_set",
        "agreement_sent",
        "treasury_reviewing",
        "certified",
        "rejected",
      ],
    },
  },
} as const
