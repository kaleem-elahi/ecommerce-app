'use client'

import { FilterBar } from '@/components/organisms/FilterBar'
import { Header } from '@/components/organisms/Header'
import { ProductGrid } from '@/components/organisms/ProductGrid'
import { getProducts } from '@/lib/queries'
import { Product, ProductFilters } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Layout, Spin, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './page.module.css'

const { Content } = Layout
const { Title, Text } = Typography

export default function HomePage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState<ProductFilters>({})
    const [sortBy, setSortBy] = useState('relevance')

    const {
        data: products = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['products', searchTerm, filters, sortBy],
        queryFn: () => getProducts(searchTerm, filters, sortBy),
        staleTime: 30000, // 30 seconds
    })

    useEffect(() => {
        refetch()
    }, [searchTerm, filters, sortBy, refetch])

    const handleProductClick = (product: Product) => {
        router.push(`/products/${product.id}`)
    }

    return (
        <Layout className={styles.layout}>
            <Header onSearch={setSearchTerm} searchValue={searchTerm} />
            <Content className={styles.content}>
                <div className={styles.container}>
                    {/* Page Title and Results Count */}
                    <div className={styles.pageHeader}>
                        <Title level={1} className={styles.pageTitle}>
                            {searchTerm || 'All Products'}
                        </Title>
                        {!isLoading && (
                            <Text type="secondary" className={styles.resultCount}>
                                {products.length} relevant results
                                {products.length > 0 && ', with ads'}
                            </Text>
                        )}
                    </div>

                    {/* Filters and Sort */}
                    <FilterBar
                        filters={filters}
                        sortBy={sortBy}
                        onFilterChange={setFilters}
                        onSortChange={setSortBy}
                    />

                    {/* Product Grid */}
                    <ProductGrid
                        products={products}
                        loading={isLoading}
                        onProductClick={handleProductClick}
                    />
                </div>
            </Content>
        </Layout>
    )
}

