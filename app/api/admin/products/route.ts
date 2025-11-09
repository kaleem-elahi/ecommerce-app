import { requireAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await requireAdmin()

    const body = await request.json()
    const {
      sku,
      name,
      slug,
      category,
      subcategory,
      description,
      price,
      currency = 'USD',
      stock = 0,
      weightGrams,
      dimensions,
      color,
      clarity,
      origin,
      cut,
      shape,
      grade,
      materials,
      tags,
      images,
      featured = false,
      status = 'active',
      metadata,
    } = body

    // Validate required fields
    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    if (!supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
      const hasUrl = !!supabaseUrl && supabaseUrl.length > 10
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''
      const hasKey = anonKey.length > 10
      
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

    // Generate slug if not provided
    const productSlug = slug || generateSlug(name)

    // Build insert object matching database schema
    const insertData: any = {
      name,
      slug: productSlug,
      price: parseFloat(price),
      currency: currency || 'USD',
      stock: stock !== undefined ? parseInt(stock) : 0,
      featured: featured || false,
      status: status || 'active',
      added_by_admin: admin.username,
    }

    // Add optional fields
    if (sku) insertData.sku = sku
    if (category) insertData.category = category
    if (subcategory) insertData.subcategory = subcategory
    if (description) insertData.description = description
    if (weightGrams !== undefined) insertData.weight_grams = parseFloat(weightGrams)
    if (dimensions) insertData.dimensions = dimensions
    if (color) insertData.color = color
    if (clarity) insertData.clarity = clarity
    if (origin) insertData.origin = origin
    if (cut) insertData.cut = cut
    if (grade) insertData.grade = grade
    if (materials && Array.isArray(materials)) insertData.materials = materials
    if (tags && Array.isArray(tags)) insertData.tags = tags
    if (images && Array.isArray(images)) {
      insertData.images = images.length > 0 ? images : []
    } else if (images && typeof images === 'string') {
      // Handle single image URL
      insertData.images = [images]
    }
    
    // Handle metadata - merge shape into metadata if provided
    const finalMetadata = metadata || {}
    if (shape) {
      finalMetadata.shape = shape
    }
    if (Object.keys(finalMetadata).length > 0) {
      insertData.metadata = finalMetadata
    }

    // Insert product into database
    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
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
      sku: data.sku,
      name: data.name,
      slug: data.slug,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      price: parseFloat(data.price),
      currency: data.currency,
      stock: data.stock,
      weightGrams: data.weight_grams ? parseFloat(data.weight_grams) : undefined,
      dimensions: data.dimensions,
      color: data.color,
      clarity: data.clarity,
      origin: data.origin,
      cut: data.cut,
      grade: data.grade,
      materials: data.materials,
      tags: data.tags,
      images: data.images,
      featured: data.featured || false,
      status: data.status,
      addedByAdmin: data.added_by_admin,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
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
