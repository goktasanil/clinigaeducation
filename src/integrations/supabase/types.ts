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
      alert_history: {
        Row: {
          alert_date: string
          change_pct: number | null
          created_at: string
          current_count: number
          id: string
          intent: string
          min_lead: number
          note: string | null
          period: string
          previous_count: number
          scope: string
          status: string
          threshold_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_date?: string
          change_pct?: number | null
          created_at?: string
          current_count: number
          id?: string
          intent: string
          min_lead: number
          note?: string | null
          period: string
          previous_count: number
          scope?: string
          status?: string
          threshold_pct: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_date?: string
          change_pct?: number | null
          created_at?: string
          current_count?: number
          id?: string
          intent?: string
          min_lead?: number
          note?: string | null
          period?: string
          previous_count?: number
          scope?: string
          status?: string
          threshold_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gsc_perf_snapshots: {
        Row: {
          average_position: number
          captured_at: string
          clicks: number
          ctr: number
          id: string
          impressions: number
          range_end: string | null
          range_start: string | null
        }
        Insert: {
          average_position?: number
          captured_at?: string
          clicks?: number
          ctr?: number
          id?: string
          impressions?: number
          range_end?: string | null
          range_start?: string | null
        }
        Update: {
          average_position?: number
          captured_at?: string
          clicks?: number
          ctr?: number
          id?: string
          impressions?: number
          range_end?: string | null
          range_start?: string | null
        }
        Relationships: []
      }
      gsc_url_snapshots: {
        Row: {
          checked_at: string
          coverage_state: string | null
          error_message: string | null
          google_canonical: string | null
          id: string
          indexing_state: string | null
          last_crawl_time: string | null
          page_fetch_state: string | null
          raw: Json | null
          robots_txt_state: string | null
          url: string
          user_canonical: string | null
          verdict: string | null
        }
        Insert: {
          checked_at?: string
          coverage_state?: string | null
          error_message?: string | null
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          raw?: Json | null
          robots_txt_state?: string | null
          url: string
          user_canonical?: string | null
          verdict?: string | null
        }
        Update: {
          checked_at?: string
          coverage_state?: string | null
          error_message?: string | null
          google_canonical?: string | null
          id?: string
          indexing_state?: string | null
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          raw?: Json | null
          robots_txt_state?: string | null
          url?: string
          user_canonical?: string | null
          verdict?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          appointment_at: string | null
          confirmation_code: string
          country: string | null
          created_at: string
          deadline: string | null
          email: string
          follow_up_at: string | null
          follow_up_note: string | null
          id: string
          intent: string | null
          language: string | null
          level: string | null
          message: string
          name: string
          phone: string
          quiz_answers: Json | null
          service: string | null
          source: string
          status: string
        }
        Insert: {
          appointment_at?: string | null
          confirmation_code?: string
          country?: string | null
          created_at?: string
          deadline?: string | null
          email: string
          follow_up_at?: string | null
          follow_up_note?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          level?: string | null
          message: string
          name: string
          phone: string
          quiz_answers?: Json | null
          service?: string | null
          source?: string
          status?: string
        }
        Update: {
          appointment_at?: string | null
          confirmation_code?: string
          country?: string | null
          created_at?: string
          deadline?: string | null
          email?: string
          follow_up_at?: string | null
          follow_up_note?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          level?: string | null
          message?: string
          name?: string
          phone?: string
          quiz_answers?: Json | null
          service?: string | null
          source?: string
          status?: string
        }
        Relationships: []
      }
      sanitize_alerts: {
        Row: {
          audit_ids: Json
          counts_by_audit_id: Json
          counts_by_source: Json
          created_at: string
          dangerous_count: number
          email_error: string | null
          email_status: string
          fired_at: string
          first_event_at: string | null
          id: string
          last_event_at: string | null
          samples: Json
          slack_error: string | null
          slack_status: string
          threshold: number
          updated_at: string
          window_minutes: number
        }
        Insert: {
          audit_ids?: Json
          counts_by_audit_id?: Json
          counts_by_source?: Json
          created_at?: string
          dangerous_count?: number
          email_error?: string | null
          email_status?: string
          fired_at?: string
          first_event_at?: string | null
          id?: string
          last_event_at?: string | null
          samples?: Json
          slack_error?: string | null
          slack_status?: string
          threshold?: number
          updated_at?: string
          window_minutes?: number
        }
        Update: {
          audit_ids?: Json
          counts_by_audit_id?: Json
          counts_by_source?: Json
          created_at?: string
          dangerous_count?: number
          email_error?: string | null
          email_status?: string
          fired_at?: string
          first_event_at?: string | null
          id?: string
          last_event_at?: string | null
          samples?: Json
          slack_error?: string | null
          slack_status?: string
          threshold?: number
          updated_at?: string
          window_minutes?: number
        }
        Relationships: []
      }
      sanitize_audit_events: {
        Row: {
          altered: boolean
          audit_id: string | null
          auto_closed_tags: number
          blocked_urls: number
          created_at: string
          dangerous: boolean
          id: string
          input_length: number
          lang: string | null
          output_length: number
          post_id: string | null
          removed_attributes: Json
          removed_comments: number
          removed_dangerous_elements: Json
          removed_tags: Json
          source: string
        }
        Insert: {
          altered?: boolean
          audit_id?: string | null
          auto_closed_tags?: number
          blocked_urls?: number
          created_at?: string
          dangerous?: boolean
          id?: string
          input_length?: number
          lang?: string | null
          output_length?: number
          post_id?: string | null
          removed_attributes?: Json
          removed_comments?: number
          removed_dangerous_elements?: Json
          removed_tags?: Json
          source: string
        }
        Update: {
          altered?: boolean
          audit_id?: string | null
          auto_closed_tags?: number
          blocked_urls?: number
          created_at?: string
          dangerous?: boolean
          id?: string
          input_length?: number
          lang?: string | null
          output_length?: number
          post_id?: string | null
          removed_attributes?: Json
          removed_comments?: number
          removed_dangerous_elements?: Json
          removed_tags?: Json
          source?: string
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          filters: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      booked_slots: {
        Row: {
          appointment_at: string | null
        }
        Insert: {
          appointment_at?: string | null
        }
        Update: {
          appointment_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_booked_slots: {
        Args: never
        Returns: {
          appointment_at: string
        }[]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
