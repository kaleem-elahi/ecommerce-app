import { Product, ProductFilters, supabase } from './supabase'

export async function getProducts(
  searchTerm: string = '',
  filters: ProductFilters = {},
  sortBy: string = 'relevance'
): Promise<Product[]> {
  // Use mock data if Supabase is not configured
  if (!supabase) {
    console.log('⚠️ Supabase not configured. Using mock data.')
    return getMockProducts(searchTerm, filters, sortBy)
  }

  let query = supabase.from('products').select('*')

  // Search filter
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  }

  // Apply filters (matching database column names - snake_case)
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.subcategory) {
    query = query.eq('subcategory', filters.subcategory)
  }

  if (filters.excludeDigital) {
    query = query.neq('category', 'digital')
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    // Filter by status (only show active products by default if no status filter)
    query = query.eq('status', 'active')
  }
  
  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured)
  }
  
  // Exclude deleted products
  query = query.is('deleted_at', null)

  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice)
  }

  // Apply sorting
  switch (sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'stock':
      query = query.order('stock', { ascending: false })
      break
    case 'featured':
      query = query.order('featured', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    // Return mock data for development if Supabase is not configured
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      return getMockProducts(searchTerm, filters)
    }
    return []
  }

  // Transform snake_case to camelCase for frontend
  return (data || []).map((product: any) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    category: product.category,
    subcategory: product.subcategory,
    description: product.description,
    price: parseFloat(product.price),
    currency: product.currency || 'USD',
    stock: product.stock || 0,
    weightGrams: product.weight_grams ? parseFloat(product.weight_grams) : undefined,
    dimensions: product.dimensions,
    color: product.color,
    clarity: product.clarity,
    origin: product.origin,
    cut: product.cut,
    grade: product.grade,
    materials: product.materials || [],
    tags: product.tags || [],
    images: product.images || [],
    featured: product.featured || false,
    status: product.status || 'active',
    addedByAdmin: product.added_by_admin || undefined,
    metadata: product.metadata,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    deletedAt: product.deleted_at,
  }))
}

// Mock data for development/testing
function getMockProducts(searchTerm: string, filters: ProductFilters, sortBy: string = 'relevance'): Product[] {
  const mockProducts: Product[] = [
    {
      id: '1',
      sku: 'AQ-RING-001',
      name: 'Dark Brown Yemeni Aqeeq Ring Akik Rings Aqee...',
      slug: 'dark-brown-yemeni-aqeeq-ring',
      description: 'Handcrafted silver ring with genuine Aqeeq stone',
      price: 9580,
      currency: 'INR',
      stock: 10,
      category: 'jewelry',
      subcategory: 'rings',
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
      featured: true,
      status: 'active',
      materials: ['agate', 'silver'],
      tags: ['premium', 'handmade'],
      color: 'Brown',
      origin: 'Yemen',
    },
    {
      id: '2',
      sku: 'AQ-STONE-001',
      name: 'Natural Yemeni Aqeeq Agate Cabochon: Soleim...',
      slug: 'natural-yemeni-aqeeq-agate-cabochon',
      description: 'Premium quality loose Aqeeq stones',
      price: 1454,
      currency: 'INR',
      stock: 25,
      category: 'stones',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
      featured: false,
      status: 'active',
      materials: ['agate'],
      tags: ['loose stones'],
      origin: 'Yemen',
    },
    {
      id: '3',
      sku: 'AQ-RING-002',
      name: 'Oval Red Aqeeq Men Ring, Silver Handmade Jew...',
      slug: 'oval-red-aqeeq-men-ring',
      description: 'Silver handmade jewelry for men',
      price: 11063,
      currency: 'INR',
      stock: 15,
      category: 'jewelry',
      subcategory: 'rings',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
      featured: true,
      status: 'active',
      materials: ['agate', 'silver'],
      tags: ['men', 'handmade'],
      color: 'Red',
      origin: 'Yemen',
    },
    {
      id: '4',
      sku: 'AQ-RING-003',
      name: 'Aqeeq Stone Ring For Men Real Aqeeq Ring Isla...',
      slug: 'aqeeq-stone-ring-islamic',
      description: 'Real Aqeeq ring with Islamic design',
      price: 7199,
      currency: 'INR',
      stock: 8,
      category: 'jewelry',
      subcategory: 'rings',
      images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400'],
      featured: true,
      status: 'active',
      materials: ['agate', 'silver'],
      tags: ['islamic', 'premium'],
      color: 'Brown',
      origin: 'Yemen',
    },
    {
      id: '5',
      sku: 'DT-AMETHYST-001',
      name: 'Dom Tree - Amethyst Crystal Tree with Glass Cloche',
      slug: 'dom-tree-amethyst-crystal',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Amethyst crystals for calm and tranquility.',
      price: 2499,
      currency: 'INR',
      stock: 12,
      category: 'home-decor',
      subcategory: 'crystal-trees',
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
      featured: true,
      status: 'active',
      materials: ['amethyst', 'crystal'],
      tags: ['harmony', 'gift', 'premium'],
      color: 'Purple',
      origin: 'India',
    },
    {
      id: '6',
      sku: 'DT-ROSE-001',
      name: 'Dom Tree - Rose Quartz Crystal Tree with Glass Cloche',
      slug: 'dom-tree-rose-quartz',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Rose Quartz crystals for gentle love and compassion.',
      price: 2699,
      currency: 'INR',
      stock: 10,
      category: 'home-decor',
      subcategory: 'crystal-trees',
      images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
      featured: true,
      status: 'active',
      materials: ['rose-quartz', 'crystal'],
      tags: ['love', 'gift'],
      color: 'Pink',
      origin: 'India',
    },
    {
      id: '7',
      sku: 'DT-CITRINE-001',
      name: 'Dom Tree - Citrine Crystal Tree with Glass Cloche',
      slug: 'dom-tree-citrine',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Citrine crystals for abundance energy and prosperity.',
      price: 2799,
      currency: 'INR',
      stock: 14,
      category: 'home-decor',
      subcategory: 'crystal-trees',
      images: ['https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400'],
      featured: true,
      status: 'active',
      materials: ['citrine', 'crystal'],
      tags: ['abundance', 'prosperity'],
      color: 'Yellow',
      origin: 'India',
    },
    {
      id: '8',
      sku: 'DT-PERIDOT-001',
      name: 'Dom Tree - Peridot Crystal Tree with Glass Cloche',
      slug: 'dom-tree-peridot',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Peridot crystals for freshness and renewal.',
      price: 2599,
      currency: 'INR',
      stock: 11,
      category: 'home-decor',
      subcategory: 'crystal-trees',
      images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400'],
      featured: true,
      status: 'active',
      materials: ['peridot', 'crystal'],
      tags: ['freshness', 'renewal'],
      color: 'Green',
      origin: 'India',
    },
    {
      id: '9',
      sku: 'DT-CHAKRA-001',
      name: 'Dom Tree - 7 Chakra Crystal Tree with Glass Cloche',
      slug: 'dom-tree-7-chakra',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine crystals representing all 7 Chakras for balance and harmony.',
      price: 3299,
      currency: 'INR',
      stock: 9,
      category: 'home-decor',
      subcategory: 'crystal-trees',
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
      featured: true,
      status: 'active',
      materials: ['multi-crystal', 'chakra'],
      tags: ['balance', 'harmony', 'chakra'],
      color: 'Multi',
      origin: 'India',
    },
  ]

  // Apply filters to mock data
  let filtered = mockProducts
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }
  if (filters.subcategory) {
    filtered = filtered.filter(p => p.subcategory === filters.subcategory)
  }
  if (filters.excludeDigital) {
    filtered = filtered.filter(p => p.category !== 'digital')
  }
  if (filters.status) {
    filtered = filtered.filter(p => (p.status || 'active') === filters.status)
  } else {
    filtered = filtered.filter(p => (p.status || 'active') === 'active')
  }
  if (filters.featured !== undefined) {
    filtered = filtered.filter(p => (p.featured || false) === filters.featured)
  }
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!)
  }

  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    filtered = filtered.filter(
      p => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term)
    )
  }

  // Apply sorting
  switch (sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'stock':
      filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0))
      break
    case 'featured':
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      break
    default:
      // Keep original order for relevance
      break
  }

  return filtered
}

