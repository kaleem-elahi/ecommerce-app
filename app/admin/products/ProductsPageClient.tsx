'use client'

import { Product } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ProductsTable } from './ProductsTable'

interface ProductsPageClientProps {
    products: Product[]
}

export function ProductsPageClient({ products }: ProductsPageClientProps) {
    const router = useRouter()

    const handleRefresh = () => {
        router.refresh()
    }

    return <ProductsTable products={products} onRefresh={handleRefresh} />
}

