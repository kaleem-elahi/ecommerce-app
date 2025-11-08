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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    await requireAdmin()

    const productId = params.id
    const body = await request.json()
    const {
      sku,
      name,
      slug,
      category,
      subcategory,
      description,
      price,
      currency,
      stock,
      weightGrams,
      dimensions,
      color,
      clarity,
      origin,
      cut,
      grade,
      materials,
      tags,
      images,
      featured,
      status,
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
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    // Generate slug if not provided
    const productSlug = slug || generateSlug(name)

    // Build update object matching database schema
    const updateData: any = {
      name,
      slug: productSlug,
      price: parseFloat(price),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if they have values
    if (sku !== undefined) updateData.sku = sku || null
    if (category !== undefined) updateData.category = category || null
    if (subcategory !== undefined) updateData.subcategory = subcategory || null
    if (description !== undefined) updateData.description = description || null
    if (currency !== undefined) updateData.currency = currency || 'USD'
    if (stock !== undefined) updateData.stock = stock !== null ? parseInt(stock) : 0
    if (weightGrams !== undefined) updateData.weight_grams = weightGrams ? parseFloat(weightGrams) : null
    if (dimensions !== undefined) updateData.dimensions = dimensions || null
    if (color !== undefined) updateData.color = color || null
    if (clarity !== undefined) updateData.clarity = clarity || null
    if (origin !== undefined) updateData.origin = origin || null
    if (cut !== undefined) updateData.cut = cut || null
    if (grade !== undefined) updateData.grade = grade || null
    if (materials !== undefined) updateData.materials = materials && Array.isArray(materials) ? materials : []
    if (tags !== undefined) updateData.tags = tags && Array.isArray(tags) ? tags : []
    if (images !== undefined) {
      if (Array.isArray(images)) {
        updateData.images = images.length > 0 ? images : []
      } else if (typeof images === 'string') {
        updateData.images = [images]
      } else {
        updateData.images = []
      }
    }
    if (featured !== undefined) updateData.featured = featured || false
    if (status !== undefined) updateData.status = status || 'active'
    if (metadata !== undefined) updateData.metadata = metadata || null

    // Update product in database
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
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

    return NextResponse.json({ success: true, product }, { status: 200 })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/products/[id]:', error)
    
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


