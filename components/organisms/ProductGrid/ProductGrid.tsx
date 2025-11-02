'use client'

import { ProductCard } from '@/components/molecules/ProductCard'
import { Product } from '@/lib/supabase'
import { Col, Empty, Row, Spin } from 'antd'
import React from 'react'
import styles from './ProductGrid.module.css'

export interface ProductGridProps {
    products: Product[]
    loading?: boolean
    onProductClick?: (product: Product) => void
}

export const ProductGrid: React.FC<ProductGridProps> = ({
    products,
    loading = false,
    onProductClick,
}) => {
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" />
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <Empty
                    description="No products found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            </div>
        )
    }

    return (
        <Row gutter={[12, 16]} className={styles.productGrid}>
            {products.map((product) => (
                <Col
                    key={product.id}
                    xs={12}
                    sm={12}
                    md={8}
                    lg={6}
                    xl={6}
                    xxl={4}
                >
                    <ProductCard
                        product={product}
                        onClick={() => onProductClick?.(product)}
                    />
                </Col>
            ))}
        </Row>
    )
}

