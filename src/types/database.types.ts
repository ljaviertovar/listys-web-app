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
      list_collaborators: {
        Row: {
          base_list_id: string
          created_at: string
          id: string
          invited_by: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          base_list_id: string
          created_at?: string
          id?: string
          invited_by: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          base_list_id?: string
          created_at?: string
          id?: string
          invited_by?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "list_collaborators_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      list_invite_links: {
        Row: {
          base_list_id: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          token: string
          use_count: number
        }
        Insert: {
          base_list_id: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          token: string
          use_count?: number
        }
        Update: {
          base_list_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          token?: string
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_invite_links_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_session_participants: {
        Row: {
          id: string
          joined_at: string
          last_active_at: string
          shopping_session_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          last_active_at?: string
          shopping_session_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          last_active_at?: string
          shopping_session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_session_participants_session_id_fkey"
            columns: ["shopping_session_id"]
            isOneToOne: false
            referencedRelation: "shopping_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      base_list_items: {
        Row: {
          base_list_id: string
          category: string | null
          created_at: string | null
          id: string
          average_price: number | null
          first_seen_at: string
          last_purchased_at: string
          usual_store_id: string | null
          usual_store_source: string
          name: string
          notes: string | null
          normalized_name: string
          purchase_count: number
          quantity: number | null
          sort_order: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          base_list_id: string
          category?: string | null
          created_at?: string | null
          id?: string
          average_price?: number | null
          first_seen_at?: string
          last_purchased_at?: string
          usual_store_id?: string | null
          usual_store_source?: string
          name: string
          notes?: string | null
          normalized_name?: string
          purchase_count?: number
          quantity?: number | null
          sort_order?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          base_list_id?: string
          category?: string | null
          created_at?: string | null
          id?: string
          average_price?: number | null
          first_seen_at?: string
          last_purchased_at?: string
          usual_store_id?: string | null
          usual_store_source?: string
          name?: string
          notes?: string | null
          normalized_name?: string
          purchase_count?: number
          quantity?: number | null
          sort_order?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "base_list_items_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_list_items_usual_store_id_fkey"
            columns: ["usual_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      base_lists: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_lists_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shopping_session_items: {
        Row: {
          category: string | null
          checked: boolean | null
          created_at: string | null
          id: string
          is_other_store: boolean
          name: string
          notes: string | null
          normalized_name: string | null
          price: number | null
          quantity: number | null
          shopping_session_id: string
          sort_order: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          checked?: boolean | null
          created_at?: string | null
          id?: string
          is_other_store?: boolean
          name: string
          notes?: string | null
          normalized_name?: string | null
          price?: number | null
          quantity?: number | null
          shopping_session_id: string
          sort_order?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          checked?: boolean | null
          created_at?: string | null
          id?: string
          is_other_store?: boolean
          name?: string
          notes?: string | null
          normalized_name?: string | null
          price?: number | null
          quantity?: number | null
          shopping_session_id?: string
          sort_order?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_run_items_shopping_run_id_fkey"
            columns: ["shopping_session_id"]
            isOneToOne: false
            referencedRelation: "shopping_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_sessions: {
        Row: {
          base_list_id: string
          completed_at: string | null
          created_at: string | null
          general_notes: string | null
          id: string
          name: string
          started_at: string | null
          status: Database["public"]["Enums"]["shopping_session_status"] | null
          store_id: string | null
          sync_to_base: boolean | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          base_list_id: string
          completed_at?: string | null
          created_at?: string | null
          general_notes?: string | null
          id?: string
          name: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["shopping_session_status"] | null
          store_id?: string | null
          sync_to_base?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          base_list_id?: string
          completed_at?: string | null
          created_at?: string | null
          general_notes?: string | null
          id?: string
          name?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["shopping_session_status"] | null
          store_id?: string | null
          sync_to_base?: boolean | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_runs_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_sessions_store_owner_fkey"
            columns: ["store_id", "user_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      ticket_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
          normalized_name: string | null
          price: number | null
          quantity: number | null
          ticket_id: string
          unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          normalized_name?: string | null
          price?: number | null
          quantity?: number | null
          ticket_id: string
          unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          normalized_name?: string | null
          price?: number | null
          quantity?: number | null
          ticket_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          base_list_id: string | null
          created_at: string | null
          group_id: string | null
          id: string
          image_path: string
          image_paths: string[] | null
          ocr_attempts: number
          ocr_error: string | null
          ocr_status: Database["public"]["Enums"]["ocr_status"] | null
          processed_at: string | null
          shopping_session_id: string | null
          store_id: string | null
          store_name: string | null
          total_items: number | null
          total_amount: number | null
          user_id: string
        }
        Insert: {
          base_list_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_path: string
          image_paths?: string[] | null
          ocr_attempts?: number
          ocr_error?: string | null
          ocr_status?: Database["public"]["Enums"]["ocr_status"] | null
          processed_at?: string | null
          shopping_session_id?: string | null
          store_id?: string | null
          store_name?: string | null
          total_items?: number | null
          total_amount?: number | null
          user_id: string
        }
        Update: {
          base_list_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_path?: string
          image_paths?: string[] | null
          ocr_attempts?: number
          ocr_error?: string | null
          ocr_status?: Database["public"]["Enums"]["ocr_status"] | null
          processed_at?: string | null
          shopping_session_id?: string | null
          store_id?: string | null
          store_name?: string | null
          total_items?: number | null
          total_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_store_fkey"
            columns: ["store_id", "user_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          name: string
          normalized_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          normalized_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          normalized_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      store_aliases: {
        Row: {
          alias_key: string
          created_at: string
          id: string
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alias_key: string
          created_at?: string
          id?: string
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alias_key?: string
          created_at?: string
          id?: string
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_aliases_store_fkey"
            columns: ["store_id", "user_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      base_list_item_store_stats: {
        Row: {
          base_list_item_id: string
          created_at: string
          id: string
          last_price: number | null
          last_price_at: string | null
          last_quantity: number | null
          last_unit: string | null
          last_purchased_at: string
          purchase_count: number
          store_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_list_item_id: string
          created_at?: string
          id?: string
          last_price?: number | null
          last_price_at?: string | null
          last_quantity?: number | null
          last_unit?: string | null
          last_purchased_at: string
          purchase_count?: number
          store_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_list_item_id?: string
          created_at?: string
          id?: string
          last_price?: number | null
          last_price_at?: string | null
          last_quantity?: number | null
          last_unit?: string | null
          last_purchased_at?: string
          purchase_count?: number
          store_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_list_item_store_stats_base_list_item_id_fkey"
            columns: ["base_list_item_id"]
            isOneToOne: false
            referencedRelation: "base_list_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_list_item_store_stats_store_owner_fkey"
            columns: ["store_id", "user_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      base_list_item_aliases: {
        Row: {
          alias_key: string
          base_list_id: string
          base_list_item_id: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          alias_key: string
          base_list_id: string
          base_list_item_id: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          alias_key?: string
          base_list_id?: string
          base_list_item_id?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_list_item_aliases_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_list_item_aliases_item_fkey"
            columns: ["base_list_item_id", "base_list_id"]
            isOneToOne: false
            referencedRelation: "base_list_items"
            referencedColumns: ["id", "base_list_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_storage_images: {
        Args: never
        Returns: {
          deleted_count: number
          total_size_bytes: number
        }[]
      }
      complete_shopping_session: {
        Args: {
          p_general_notes?: string
          p_max_items?: number
          p_session_id: string
          p_total_amount?: number
        }
        Returns: {
          new_count: number
          over_limit_count: number
          skipped_count: number
          updated_count: number
        }[]
      }
      apply_session_completion: {
        Args: { p_max_items: number; p_session_id: string }
        Returns: {
          new_count: number
          over_limit_count: number
          skipped_count: number
          touched_item_ids: string[]
          updated_count: number
        }[]
      }
      receipt_attach_window: { Args: never; Returns: string }
      receipt_suggestion_threshold: { Args: never; Returns: number }
      ticket_session_candidates: {
        Args: { p_ticket_id: string }
        Returns: {
          base_list_id: string
          base_list_name: string
          checked_count: number
          completed_at: string | null
          id: string
          item_count: number
          name: string
          started_at: string | null
          status: string
          store_id: string | null
          store_name: string | null
        }[]
      }
      ticket_session_matches: {
        Args: { p_session_id: string; p_ticket_id: string }
        Returns: {
          checked: boolean
          match_kind: string
          shopping_session_item_id: string | null
          shopping_session_item_name: string | null
          ticket_item_id: string
        }[]
      }
      attach_receipt_to_session: {
        Args: {
          p_links?: Json
          p_max_items?: number
          p_session_id: string
          p_ticket_id: string
          p_added_item_ids?: string[]
          p_total_amount?: number | null
        }
        Returns: {
          added_count: number
          checked_now_count: number
          completed_now: boolean
          matched_count: number
          over_limit_count: number
          priced_count: number
          replayed: boolean
        }[]
      }
      start_shopping_session: {
        Args: { p_base_list_id: string; p_name: string; p_store_id?: string | null }
        Returns: Database["public"]["Tables"]["shopping_sessions"]["Row"]
      }
      set_item_usual_store: {
        Args: { p_item_id: string; p_store_id?: string | null }
        Returns: { id: string; usual_store_id: string | null; usual_store_source: string }[]
      }
      spending_summary: {
        Args: { p_from: string; p_to: string }
        Returns: {
          receipts_count: number
          total: number
          trips_count: number
          trips_without_total: number
        }[]
      }
      store_last_visits: {
        Args: never
        Returns: {
          at: string
          id: string
          kind: string
          store_id: string
          total_amount: number
        }[]
      }
      ensure_default_group: {
        Args: { p_group_name: string }
        Returns: string
      }
      ensure_default_pantry: {
        Args: { p_group_name: string; p_list_name: string }
        Returns: boolean
      }
      get_orphaned_storage_images: {
        Args: never
        Returns: {
          created_at: string
          image_path: string
          size: number
        }[]
      }
      get_orphaned_tickets_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      likely_needed_items: {
        Args: { p_limit?: number }
        Returns: {
          base_list_id: string | null
          base_list_name: string | null
          days_since: number | null
          has_history: boolean
          id: string | null
          interval_days: number | null
          name: string | null
          usual_store_id: string | null
          usual_store_name: string | null
        }[]
      }
      mark_stuck_tickets_as_failed: { Args: never; Returns: undefined }
      merge_ticket_items_to_base_list: {
        Args: {
          p_base_list_id: string
          p_item_ids?: string[] | null
          p_links?: Json | null
          p_max_items?: number
          p_ticket_id: string
        }
        Returns: {
          new_count: number
          skipped_count: number
          updated_count: number
        }[]
      }
      assign_ticket_store: {
        Args: { p_store_id: string | null; p_ticket_id: string }
        Returns: Database["public"]["Tables"]["tickets"]["Row"]
      }
      create_store: {
        Args: { p_max_stores: number; p_name: string }
        Returns: Database["public"]["Tables"]["stores"]["Row"]
      }
      merge_stores: {
        Args: { p_source_id: string; p_target_id: string }
        Returns: Database["public"]["Tables"]["stores"]["Row"]
      }
      normalize_store_name: {
        Args: { input_text: string }
        Returns: string | null
      }
      rename_store: {
        Args: { p_name: string; p_store_id: string }
        Returns: Database["public"]["Tables"]["stores"]["Row"]
      }
      resolve_store: {
        Args: { p_raw_name: string }
        Returns: string | null
      }
      ticket_item_matches: {
        Args: { p_base_list_id: string; p_ticket_id: string }
        Returns: {
          base_list_item_id: string | null
          base_list_item_name: string | null
          match_kind: "name" | "alias" | "none"
          ticket_item_id: string
        }[]
      }
      ticket_item_suggestions: {
        Args: { p_base_list_id: string; p_ticket_id: string }
        Returns: {
          base_list_item_id: string
          base_list_item_name: string
          ticket_item_id: string
        }[]
      }
      sync_shopping_session_to_base_list: {
        Args: {
          p_max_items?: number
          p_session_id: string
        }
        Returns: {
          new_count: number
          skipped_count: number
          updated_count: number
        }[]
      }
    }
    Enums: {
      ocr_status: "pending" | "processing" | "completed" | "failed"
      shopping_session_status: "active" | "completed"
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
      ocr_status: ["pending", "processing", "completed", "failed"],
      shopping_session_status: ["active", "completed"],
    },
  },
} as const
