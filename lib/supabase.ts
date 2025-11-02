import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

// Only create Supabase client if credentials are valid
const isValidUrl = supabaseUrl && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseUrl.startsWith('http') &&
  supabaseUrl.length > 10

const isValidKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey.length > 10

export const supabase: SupabaseClient | null = 
  isValidUrl && isValidKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  imageUrl: string
  rating: number
  reviewCount: number
  freeDelivery?: boolean
  starSeller?: boolean
  dispatchedFrom?: string
  category?: string
  createdAt?: string
}

export interface ProductFilters {
  excludeDigital?: boolean
  freeDelivery?: boolean
  starSeller?: boolean
  dispatchedFrom?: string
  minPrice?: number
  maxPrice?: number
}

export interface SortOption {
  value: string
  label: string
}

