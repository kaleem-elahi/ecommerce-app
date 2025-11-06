import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin()

    const body = await request.json()
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      imageUrl,
      rating = 0,
      reviewCount = 0,
      freeDelivery = false,
      starSeller = false,
      dispatchedFrom,
      category,
    } = body

    // Validate required fields
    if (!name || !price || !imageUrl) {
      return NextResponse.json(
        { error: 'Name, price, and image URL are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
      const hasUrl = !!supabaseUrl && supabaseUrl.length > 10
      const hasKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || '').length > 10
      
      return NextResponse.json(
        { 
          error: 'Database not configured',
          details: {
            hasUrl,
            hasKey,
            urlLength: supabaseUrl.length,
            message: 'Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file'
          }
        },
        { status: 500 }
      )
    }

    // Calculate discount if original price is provided
    let calculatedDiscount = discount
    if (originalPrice && !discount) {
      calculatedDiscount = Math.round(
        ((originalPrice - price) / originalPrice) * 100
      )
    }

    // Insert product into database (using snake_case for database columns)
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        discount: calculatedDiscount || null,
        image_url: imageUrl,
        rating: parseFloat(rating) || 0,
        review_count: parseInt(reviewCount) || 0,
        free_delivery: freeDelivery || false,
        star_seller: starSeller || false,
        dispatched_from: dispatchedFrom || null,
        category: category || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase for response
    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
      discount: data.discount,
      imageUrl: data.image_url,
      rating: parseFloat(data.rating || 0),
      reviewCount: data.review_count || 0,
      freeDelivery: data.free_delivery || false,
      starSeller: data.star_seller || false,
      dispatchedFrom: data.dispatched_from,
      category: data.category,
      createdAt: data.created_at,
    }

    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    console.error('Error in POST /api/admin/products:', error)
    
    // Handle redirect from requireAdmin
    if (error.message?.includes('redirect')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

