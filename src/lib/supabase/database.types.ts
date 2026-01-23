export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      base_lists: {
        Row: {
          id: string
          group_id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_lists_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "base_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      base_list_items: {
        Row: {
          id: string
          base_list_id: string
          name: string
          quantity: number | null
          unit: string | null
          notes: string | null
          category: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          base_list_id: string
          name: string
          quantity?: number | null
          unit?: string | null
          notes?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          base_list_id?: string
          name?: string
          quantity?: number | null
          unit?: string | null
          notes?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "base_list_items_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_runs: {
        Row: {
          id: string
          base_list_id: string
          user_id: string
          name: string
          status: Database["public"]["Enums"]["shopping_run_status"]
          total_amount: number | null
          started_at: string
          completed_at: string | null
          sync_to_base: boolean | null
          general_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          base_list_id: string
          user_id: string
          name: string
          status?: Database["public"]["Enums"]["shopping_run_status"]
          total_amount?: number | null
          started_at?: string
          completed_at?: string | null
          sync_to_base?: boolean | null
          general_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          base_list_id?: string
          user_id?: string
          name?: string
          status?: Database["public"]["Enums"]["shopping_run_status"]
          total_amount?: number | null
          started_at?: string
          completed_at?: string | null
          sync_to_base?: boolean | null
          general_notes?: string | null
          created_at?: string
          updated_at?: string
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
            foreignKeyName: "shopping_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shopping_run_items: {
        Row: {
          id: string
          shopping_run_id: string
          name: string
          quantity: number | null
          unit: string | null
          checked: boolean | null
          notes: string | null
          category: string | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shopping_run_id: string
          name: string
          quantity?: number | null
          unit?: string | null
          checked?: boolean | null
          notes?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shopping_run_id?: string
          name?: string
          quantity?: number | null
          unit?: string | null
          checked?: boolean | null
          notes?: string | null
          category?: string | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_run_items_shopping_run_id_fkey"
            columns: ["shopping_run_id"]
            isOneToOne: false
            referencedRelation: "shopping_runs"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          group_id: string | null
          base_list_id: string | null
          image_path: string
          store_name: string | null
          total_items: number | null
          processed_at: string | null
          ocr_status: Database["public"]["Enums"]["ocr_status"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id?: string | null
          base_list_id?: string | null
          image_path: string
          store_name?: string | null
          total_items?: number | null
          processed_at?: string | null
          ocr_status?: Database["public"]["Enums"]["ocr_status"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string | null
          base_list_id?: string | null
          image_path?: string
          store_name?: string | null
          total_items?: number | null
          processed_at?: string | null
          ocr_status?: Database["public"]["Enums"]["ocr_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_base_list_id_fkey"
            columns: ["base_list_id"]
            isOneToOne: false
            referencedRelation: "base_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      ticket_items: {
        Row: {
          id: string
          ticket_id: string
          name: string
          quantity: number | null
          price: number | null
          unit: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          name: string
          quantity?: number | null
          price?: number | null
          unit?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          name?: string
          quantity?: number | null
          price?: number | null
          unit?: string | null
          category?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_items_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_storage_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_count: number
          total_size_bytes: number
        }[]
      }
      get_orphaned_storage_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          image_path: string
          size: number
          created_at: string
        }[]
      }
      get_orphaned_tickets_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      mark_stuck_tickets_as_failed: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      ocr_status: "pending" | "processing" | "completed" | "failed"
      shopping_run_status: "active" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never
