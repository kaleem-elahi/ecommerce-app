import { getProducts } from '@/lib/queries'
import { ProductsPageClient } from './ProductsPageClient'

export default async function AdminProductsPage() {
    const [activeProducts, draftProducts, archivedProducts] = await Promise.all([
        getProducts(),
        getProducts('', { status: 'draft' }),
        getProducts('', { status: 'archived' }),
    ])

    return (
        <ProductsPageClient
            activeProducts={activeProducts}
            draftProducts={draftProducts}
            archivedProducts={archivedProducts}
        />
    )
}

