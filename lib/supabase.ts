import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

// Only create Supabase client if credentials are valid
const isValidUrl = supabaseUrl && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseUrl.length > 20

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey.length > 50 // JWT tokens are typically longer

export const supabase: SupabaseClient | null = 
  isValidUrl && isValidKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface Product {
  id: string
  sku?: string
  name: string
  slug: string
  category?: string
  subcategory?: string
  description?: string
  price: number
  currency?: string
  stock?: number
  weightGrams?: number
  dimensions?: {
    length_mm?: number
    width_mm?: number
    height_mm?: number
  }
  color?: string
  clarity?: string
  origin?: string
  cut?: string
  grade?: string
  materials?: string[]
  tags?: string[]
  images?: string[]
  featured?: boolean
  status?: string
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export interface ProductFilters {
  category?: string
  subcategory?: string
  excludeDigital?: boolean
  minPrice?: number
  maxPrice?: number
  status?: string
  featured?: boolean
  tags?: string[]
  materials?: string[]
}

export interface SortOption {
  value: string
  label: string
}

