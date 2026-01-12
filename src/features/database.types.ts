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
      }
      base_list_items: {
        Row: {
          id: string
          base_list_id: string
          name: string
          quantity: number
          unit: string | null
          notes: string | null
          category: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          base_list_id: string
          name: string
          quantity?: number
          unit?: string | null
          notes?: string | null
          category?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          base_list_id?: string
          name?: string
          quantity?: number
          unit?: string | null
          notes?: string | null
          category?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      shopping_runs: {
        Row: {
          id: string
          base_list_id: string
          user_id: string
          name: string
          status: 'active' | 'completed'
          total_amount: number | null
          started_at: string
          completed_at: string | null
          sync_to_base: boolean
          general_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          base_list_id: string
          user_id: string
          name: string
          status?: 'active' | 'completed'
          total_amount?: number | null
          started_at?: string
          completed_at?: string | null
          sync_to_base?: boolean
          general_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          base_list_id?: string
          user_id?: string
          name?: string
          status?: 'active' | 'completed'
          total_amount?: number | null
          started_at?: string
          completed_at?: string | null
          sync_to_base?: boolean
          general_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_run_items: {
        Row: {
          id: string
          shopping_run_id: string
          name: string
          quantity: number
          unit: string | null
          checked: boolean
          notes: string | null
          category: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shopping_run_id: string
          name: string
          quantity?: number
          unit?: string | null
          checked?: boolean
          notes?: string | null
          category?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shopping_run_id?: string
          name?: string
          quantity?: number
          unit?: string | null
          checked?: boolean
          notes?: string | null
          category?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          user_id: string
          group_id: string | null
          base_list_id: string | null
          image_path: string
          store_name: string | null
          total_items: number
          processed_at: string | null
          ocr_status: 'pending' | 'processing' | 'completed' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id?: string | null
          base_list_id?: string | null
          image_path: string
          store_name?: string | null
          total_items?: number
          processed_at?: string | null
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string | null
          base_list_id?: string | null
          image_path?: string
          store_name?: string | null
          total_items?: number
          processed_at?: string | null
          ocr_status?: 'pending' | 'processing' | 'completed' | 'failed'
          created_at?: string
        }
      }
      ticket_items: {
        Row: {
          id: string
          ticket_id: string
          name: string
          quantity: number
          price: number | null
          unit: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          name: string
          quantity?: number
          price?: number | null
          unit?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          name?: string
          quantity?: number
          price?: number | null
          unit?: string | null
          category?: string | null
          created_at?: string
        }
      }
    }
  }
}
