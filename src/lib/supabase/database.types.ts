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
          name: string
          notes: string | null
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
          name: string
          notes?: string | null
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
          name?: string
          notes?: string | null
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
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
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
          name: string
          notes: string | null
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
          name: string
          notes?: string | null
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
          name?: string
          notes?: string | null
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
        ]
      }
      ticket_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
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
          ocr_status: Database["public"]["Enums"]["ocr_status"] | null
          processed_at: string | null
          store_name: string | null
          total_items: number | null
          user_id: string
        }
        Insert: {
          base_list_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_path: string
          ocr_status?: Database["public"]["Enums"]["ocr_status"] | null
          processed_at?: string | null
          store_name?: string | null
          total_items?: number | null
          user_id: string
        }
        Update: {
          base_list_id?: string | null
          created_at?: string | null
          group_id?: string | null
          id?: string
          image_path?: string
          ocr_status?: Database["public"]["Enums"]["ocr_status"] | null
          processed_at?: string | null
          store_name?: string | null
          total_items?: number | null
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
      mark_stuck_tickets_as_failed: { Args: never; Returns: undefined }
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
