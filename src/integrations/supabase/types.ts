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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          birth_date: string
          birth_weight_kg: number | null
          breed: string
          color: string | null
          created_at: string
          current_weight_kg: number | null
          father_id: string | null
          for_sale: boolean
          id: string
          location: string | null
          mother_id: string | null
          name: string | null
          notes: string | null
          photos: string[]
          purpose: string | null
          sale_price: number | null
          sex: string
          status: string
          tag_number: string
          updated_at: string
        }
        Insert: {
          birth_date: string
          birth_weight_kg?: number | null
          breed: string
          color?: string | null
          created_at?: string
          current_weight_kg?: number | null
          father_id?: string | null
          for_sale?: boolean
          id?: string
          location?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          photos?: string[]
          purpose?: string | null
          sale_price?: number | null
          sex: string
          status?: string
          tag_number: string
          updated_at?: string
        }
        Update: {
          birth_date?: string
          birth_weight_kg?: number | null
          breed?: string
          color?: string | null
          created_at?: string
          current_weight_kg?: number | null
          father_id?: string | null
          for_sale?: boolean
          id?: string
          location?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          photos?: string[]
          purpose?: string | null
          sale_price?: number | null
          sex?: string
          status?: string
          tag_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      milk_production: {
        Row: {
          animal_id: string
          created_at: string
          fecha: string
          id: string
          litros: number
          notas: string | null
          registrado_por: string | null
          turno: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          fecha?: string
          id?: string
          litros: number
          notas?: string | null
          registrado_por?: string | null
          turno: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          fecha?: string
          id?: string
          litros?: number
          notas?: string | null
          registrado_por?: string | null
          turno?: string
        }
        Relationships: [
          {
            foreignKeyName: "milk_production_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_events: {
        Row: {
          animal_id: string
          costo: number | null
          created_at: string
          descripcion: string | null
          dosis: string | null
          fecha: string
          id: string
          medicamento: string | null
          proxima_fecha: string | null
          registrado_por: string | null
          resuelto: boolean
          tipo: string
          titulo: string
          updated_at: string
          veterinario: string | null
        }
        Insert: {
          animal_id: string
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          dosis?: string | null
          fecha?: string
          id?: string
          medicamento?: string | null
          proxima_fecha?: string | null
          registrado_por?: string | null
          resuelto?: boolean
          tipo: string
          titulo: string
          updated_at?: string
          veterinario?: string | null
        }
        Update: {
          animal_id?: string
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          dosis?: string | null
          fecha?: string
          id?: string
          medicamento?: string | null
          proxima_fecha?: string | null
          registrado_por?: string | null
          resuelto?: boolean
          tipo?: string
          titulo?: string
          updated_at?: string
          veterinario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          animal_id: string | null
          cantidad: number | null
          client_id: string | null
          created_at: string
          descripcion: string | null
          fecha: string
          id: string
          notas: string | null
          precio_unitario: number | null
          registrado_por: string | null
          tipo: string
          total: number
          unidad: string | null
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          cantidad?: number | null
          client_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          notas?: string | null
          precio_unitario?: number | null
          registrado_por?: string | null
          tipo: string
          total: number
          unidad?: string | null
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          cantidad?: number | null
          client_id?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          notas?: string | null
          precio_unitario?: number | null
          registrado_por?: string | null
          tipo?: string
          total?: number
          unidad?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          categoria: string
          created_at: string
          descripcion: string
          fecha: string
          id: string
          monto: number
          notas: string | null
          proveedor: string | null
          registrado_por: string | null
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          descripcion: string
          fecha?: string
          id?: string
          monto: number
          notas?: string | null
          proveedor?: string | null
          registrado_por?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descripcion?: string
          fecha?: string
          id?: string
          monto?: number
          notas?: string | null
          proveedor?: string | null
          registrado_por?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reproduction_events: {
        Row: {
          animal_id: string
          costo: number | null
          created_at: string
          fecha: string
          fecha_estimada_parto: string | null
          id: string
          notas: string | null
          registrado_por: string | null
          ternero_id: string | null
          tipo: string
          toro_id: string | null
          updated_at: string
          veterinario: string | null
        }
        Insert: {
          animal_id: string
          costo?: number | null
          created_at?: string
          fecha?: string
          fecha_estimada_parto?: string | null
          id?: string
          notas?: string | null
          registrado_por?: string | null
          ternero_id?: string | null
          tipo: string
          toro_id?: string | null
          updated_at?: string
          veterinario?: string | null
        }
        Update: {
          animal_id?: string
          costo?: number | null
          created_at?: string
          fecha?: string
          fecha_estimada_parto?: string | null
          id?: string
          notas?: string | null
          registrado_por?: string | null
          ternero_id?: string | null
          tipo?: string
          toro_id?: string | null
          updated_at?: string
          veterinario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproduction_events_toro_id_fkey"
            columns: ["toro_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reproduction_events_ternero_id_fkey"
            columns: ["ternero_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
