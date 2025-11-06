import { getProducts } from '@/lib/queries'
import { ProductsPageClient } from './ProductsPageClient'

export default async function AdminProductsPage() {
    const products = await getProducts()

    return <ProductsPageClient products={products} />
}

