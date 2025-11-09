// Category and subcategory structure for admin panel

export interface CategoryItem {
  name: string
  children?: CategoryItem[]
}

export const CATEGORY_STRUCTURE: CategoryItem[] = [
  {
    name: 'Gemstones & Crystals',
    children: [
      {
        name: 'Loose Gemstones',
        children: [
          { name: 'Cabochons' },
          { name: 'Faceted Gems' },
          { name: 'Raw / Rough Stones' },
          { name: 'Tumbled Stones' },
          { name: 'Slices / Slabs' },
          { name: 'Carved Stones' },
          { name: 'Gemstone Beads (Drilled)' },
        ],
      },
      {
        name: 'Spiritual & Healing',
        children: [
          { name: 'Chakra Stones' },
          { name: 'Reiki Energy Crystals' },
          { name: 'Meditation Stones' },
          { name: 'Palm / Worry Stones' },
          { name: 'Crystal Sets / Kits' },
        ],
      },
      {
        name: 'Home & Decor',
        children: [
          { name: 'Crystal Towers / Points' },
          { name: 'Spheres / Balls' },
          { name: 'Geodes & Clusters' },
          { name: 'Sculptures & Figurines' },
        ],
      },
    ],
  },
  {
    name: 'Jewelry',
    children: [
      { name: 'Rings' },
      { name: 'Pendants' },
      { name: 'Bracelets' },
      { name: 'Necklaces' },
      { name: 'Earrings' },
    ],
  },
  {
    name: 'Islamic & Traditional Stones',
    children: [
      { name: 'Aqeeq Stones' },
      { name: 'Yemeni Aqeeq' },
      { name: 'Sulemani Hakik' },
      { name: 'Feroza (Turquoise)' },
      { name: 'Durr-e-Najaf' },
    ],
  },
]

// Helper function to get all top-level categories
export const getCategories = (): string[] => {
  return CATEGORY_STRUCTURE.map((cat) => cat.name)
}

// Helper function to get subcategories for a given category
export const getSubcategories = (categoryName: string): string[] => {
  const category = CATEGORY_STRUCTURE.find((cat) => cat.name === categoryName)
  if (!category || !category.children) {
    return []
  }
  return category.children.map((subcat) => subcat.name)
}

// Helper function to check if a subcategory has further children
export const hasSubcategoryChildren = (categoryName: string, subcategoryName: string): boolean => {
  const category = CATEGORY_STRUCTURE.find((cat) => cat.name === categoryName)
  if (!category || !category.children) {
    return false
  }
  const subcategory = category.children.find((subcat) => subcat.name === subcategoryName)
  return subcategory ? !!subcategory.children && subcategory.children.length > 0 : false
}

// Helper function to get children of a subcategory (third level)
export const getSubcategoryChildren = (categoryName: string, subcategoryName: string): string[] => {
  const category = CATEGORY_STRUCTURE.find((cat) => cat.name === categoryName)
  if (!category || !category.children) {
    return []
  }
  const subcategory = category.children.find((subcat) => subcat.name === subcategoryName)
  if (!subcategory || !subcategory.children) {
    return []
  }
  return subcategory.children.map((item) => item.name)
}

