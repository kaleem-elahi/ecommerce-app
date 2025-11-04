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
  if (filters.freeDelivery) {
    query = query.eq('free_delivery', true)
  }

  if (filters.starSeller) {
    query = query.eq('star_seller', true)
  }

  if (filters.dispatchedFrom) {
    query = query.eq('dispatched_from', filters.dispatchedFrom)
  }

  if (filters.excludeDigital) {
    query = query.neq('category', 'digital')
  }

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
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'reviews':
      query = query.order('review_count', { ascending: false })
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
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
    discount: product.discount,
    imageUrl: product.image_url,
    rating: parseFloat(product.rating || 0),
    reviewCount: product.review_count || 0,
    freeDelivery: product.free_delivery || false,
    starSeller: product.star_seller || false,
    dispatchedFrom: product.dispatched_from,
    category: product.category,
    createdAt: product.created_at,
  }))
}

// Mock data for development/testing
function getMockProducts(searchTerm: string, filters: ProductFilters, sortBy: string = 'relevance'): Product[] {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Dark Brown Yemeni Aqeeq Ring Akik Rings Aqee...',
      description: 'Handcrafted silver ring with genuine Aqeeq stone',
      price: 9580,
      originalPrice: 21290,
      discount: 55,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      rating: 4.8,
      reviewCount: 470,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'jewelry',
    },
    {
      id: '2',
      name: 'Natural Yemeni Aqeeq Agate Cabochon: Soleim...',
      description: 'Premium quality loose Aqeeq stones',
      price: 1454,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
      rating: 5.0,
      reviewCount: 5,
      freeDelivery: false,
      starSeller: false,
      dispatchedFrom: 'India',
      category: 'stones',
    },
    {
      id: '3',
      name: 'Oval Red Aqeeq Men Ring, Silver Handmade Jew...',
      description: 'Silver handmade jewelry for men',
      price: 11063,
      imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400',
      rating: 4.9,
      reviewCount: 723,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'jewelry',
    },
    {
      id: '4',
      name: 'Aqeeq Stone Ring For Men Real Aqeeq Ring Isla...',
      description: 'Real Aqeeq ring with Islamic design',
      price: 7199,
      originalPrice: 15999,
      discount: 55,
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400',
      rating: 4.8,
      reviewCount: 470,
      freeDelivery: false,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'jewelry',
    },
    {
      id: '5',
      name: 'Dom Tree - Amethyst Crystal Tree with Glass Cloche',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Amethyst crystals for calm and tranquility. Perfect for your desk, living room, meditation corner, or as a thoughtful gift. Packed in a premium designer box. Each Dom Tree radiates positivity and beauty in every space. A gift that lasts forever.',
      price: 2499,
      originalPrice: 3499,
      discount: 29,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      rating: 4.9,
      reviewCount: 128,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'home-decor',
    },
    {
      id: '6',
      name: 'Dom Tree - Rose Quartz Crystal Tree with Glass Cloche',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Rose Quartz crystals for gentle love and compassion. Perfect for your desk, living room, meditation corner, or as a thoughtful gift. Packed in a premium designer box. Each Dom Tree radiates positivity and beauty in every space. A gift that lasts forever.',
      price: 2699,
      originalPrice: 3499,
      discount: 23,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
      rating: 5.0,
      reviewCount: 89,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'home-decor',
    },
    {
      id: '7',
      name: 'Dom Tree - Citrine Crystal Tree with Glass Cloche',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Citrine crystals for abundance energy and prosperity. Perfect for your desk, living room, meditation corner, or as a thoughtful gift. Packed in a premium designer box. Each Dom Tree radiates positivity and beauty in every space. A gift that lasts forever.',
      price: 2799,
      originalPrice: 3699,
      discount: 24,
      imageUrl: 'https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400',
      rating: 4.8,
      reviewCount: 156,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'home-decor',
    },
    {
      id: '8',
      name: 'Dom Tree - Peridot Crystal Tree with Glass Cloche',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine Peridot crystals for freshness and renewal. Perfect for your desk, living room, meditation corner, or as a thoughtful gift. Packed in a premium designer box. Each Dom Tree radiates positivity and beauty in every space. A gift that lasts forever.',
      price: 2599,
      originalPrice: 3499,
      discount: 26,
      imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400',
      rating: 4.7,
      reviewCount: 94,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'home-decor',
    },
    {
      id: '9',
      name: 'Dom Tree - 7 Chakra Crystal Tree with Glass Cloche',
      description: 'Handcrafted crystal tree that brings harmony home. Made with genuine crystals representing all 7 Chakras for balance and harmony. Perfect for your desk, living room, meditation corner, or as a thoughtful gift. Packed in a premium designer box. Each Dom Tree radiates positivity and beauty in every space. A gift that lasts forever.',
      price: 3299,
      originalPrice: 4299,
      discount: 23,
      imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
      rating: 4.9,
      reviewCount: 201,
      freeDelivery: true,
      starSeller: true,
      dispatchedFrom: 'India',
      category: 'home-decor',
    },
  ]

  // Apply filters to mock data
  let filtered = mockProducts
  if (filters.freeDelivery) {
    filtered = filtered.filter(p => p.freeDelivery)
  }
  if (filters.starSeller) {
    filtered = filtered.filter(p => p.starSeller)
  }
  if (filters.dispatchedFrom) {
    filtered = filtered.filter(p => p.dispatchedFrom === filters.dispatchedFrom)
  }
  if (filters.excludeDigital) {
    filtered = filtered.filter(p => p.category !== 'digital')
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
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'reviews':
      filtered.sort((a, b) => b.reviewCount - a.reviewCount)
      break
    default:
      // Keep original order for relevance
      break
  }

  return filtered
}

