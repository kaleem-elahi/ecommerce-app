'use client'

import { Product } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Tabs } from 'antd'
import { ProductsTable } from './ProductsTable'

interface ProductsPageClientProps {
    activeProducts: Product[]
    draftProducts: Product[]
    archivedProducts: Product[]
}

export function ProductsPageClient({
    activeProducts,
    draftProducts,
    archivedProducts,
}: ProductsPageClientProps) {
    const router = useRouter()

    const handleRefresh = () => {
        router.refresh()
    }

    return (
        <Tabs
            defaultActiveKey="active"
            items={[
                {
                    key: 'active',
                    label: `Active (${activeProducts.length})`,
                    children: (
                        <ProductsTable
                            products={activeProducts}
                            onRefresh={handleRefresh}
                            title="Active Products"
                        />
                    ),
                },
                {
                    key: 'draft',
                    label: `Draft (${draftProducts.length})`,
                    children: (
                        <ProductsTable
                            products={draftProducts}
                            onRefresh={handleRefresh}
                            title="Draft Products"
                            showAddButton={false}
                        />
                    ),
                },
                {
                    key: 'archived',
                    label: `Archived (${archivedProducts.length})`,
                    children: (
                        <ProductsTable
                            products={archivedProducts}
                            onRefresh={handleRefresh}
                            title="Archived Products"
                            showAddButton={false}
                        />
                    ),
                },
            ]}
        />
    )
}

