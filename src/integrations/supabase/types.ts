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
      addresses: {
        Row: {
          address: string
          address_type: string
          archived: boolean | null
          city: string
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          address_type: string
          archived?: boolean | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          address_type?: string
          archived?: boolean | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image: string
          is_active: boolean | null
          link: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image: string
          is_active?: boolean | null
          link: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image?: string
          is_active?: boolean | null
          link?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          expiry_date: string
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_purchase_amount: number
          start_date: string
          type: string
          updated_at: string
          usage_count: number
          usage_limit: number
          value: number
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number
          start_date: string
          type: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number
          value: number
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expiry_date?: string
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number
          start_date?: string
          type?: string
          updated_at?: string
          usage_count?: number
          usage_limit?: number
          value?: number
        }
        Relationships: []
      }
      order_details: {
        Row: {
          address_details: Json | null
          created_at: string
          customer_name: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          product_image: string | null
          product_name: string
          quantity: number
          total_amount: number
          user_id: string
        }
        Insert: {
          address_details?: Json | null
          created_at?: string
          customer_name?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          product_image?: string | null
          product_name: string
          quantity: number
          total_amount: number
          user_id: string
        }
        Update: {
          address_details?: Json | null
          created_at?: string
          customer_name?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_image?: string | null
          product_name?: string
          quantity?: number
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_details_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_details_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string
          applied_coupon_id: string | null
          created_at: string
          discount_amount: number | null
          id: string
          order_date: string
          payment_method: string
          payment_status: string | null
          platform_fees: number | null
          products_name: string[] | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id: string
          applied_coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_date?: string
          payment_method: string
          payment_status?: string | null
          platform_fees?: number | null
          products_name?: string[] | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string
          applied_coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          order_date?: string
          payment_method?: string
          payment_status?: string | null
          platform_fees?: number | null
          products_name?: string[] | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_applied_coupon_id_fkey"
            columns: ["applied_coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          order_id: string | null
          payment_id: string
          payment_method: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          order_id?: string | null
          payment_id: string
          payment_method: string
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          order_id?: string | null
          payment_id?: string
          payment_method?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_products: {
        Row: {
          id: string
          last_updated: string
          product_id: string
          total_orders: number
        }
        Insert: {
          id?: string
          last_updated?: string
          product_id: string
          total_orders?: number
        }
        Update: {
          id?: string
          last_updated?: string
          product_id?: string
          total_orders?: number
        }
        Relationships: [
          {
            foreignKeyName: "popular_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string
          category: string
          created_at: string | null
          description: string
          features: Json | null
          id: string
          images: string[]
          name: string
          price: number
          rating: number
          review_count: number
          sale_price: number | null
          stock: number
          updated_at: string | null
        }
        Insert: {
          brand: string
          category: string
          created_at?: string | null
          description: string
          features?: Json | null
          id?: string
          images: string[]
          name: string
          price: number
          rating: number
          review_count?: number
          sale_price?: number | null
          stock?: number
          updated_at?: string | null
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string | null
          description?: string
          features?: Json | null
          id?: string
          images?: string[]
          name?: string
          price?: number
          rating?: number
          review_count?: number
          sale_price?: number | null
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_settings: {
        Row: {
          created_at: string
          id: string
          language: string
          notifications_enabled: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          notifications_enabled?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string
          date: string | null
          id: string
          product_id: string
          rating: number
          user_id: string | null
          user_name: string
        }
        Insert: {
          comment: string
          date?: string | null
          id?: string
          product_id: string
          rating: number
          user_id?: string | null
          user_name: string
        }
        Update: {
          comment?: string
          date?: string | null
          id?: string
          product_id?: string
          rating?: number
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      stock_updates: {
        Row: {
          change_amount: number
          change_type: string
          created_at: string | null
          id: string
          new_stock: number
          previous_stock: number
          product_id: string
        }
        Insert: {
          change_amount: number
          change_type: string
          created_at?: string | null
          id?: string
          new_stock: number
          previous_stock: number
          product_id: string
        }
        Update: {
          change_amount?: number
          change_type?: string
          created_at?: string | null
          id?: string
          new_stock?: number
          previous_stock?: number
          product_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          account_activity_alerts: boolean
          created_at: string
          data_sharing: boolean
          id: string
          marketing_emails: boolean
          order_notifications: boolean
          personalized_recommendations: boolean
          product_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          account_activity_alerts?: boolean
          created_at?: string
          data_sharing?: boolean
          id?: string
          marketing_emails?: boolean
          order_notifications?: boolean
          personalized_recommendations?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          account_activity_alerts?: boolean
          created_at?: string
          data_sharing?: boolean
          id?: string
          marketing_emails?: boolean
          order_notifications?: boolean
          personalized_recommendations?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrease_product_stock: {
        Args: { product_id: string; quantity: number }
        Returns: undefined
      }
      increase_product_stock: {
        Args: { product_id: string; quantity: number }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { coupon_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
