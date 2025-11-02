'use client'

import { Rating } from '@/components/atoms/Rating'
import { Product } from '@/lib/supabase'
import { Card, Space, Typography } from 'antd'
import Image from 'next/image'
import React from 'react'
import styles from './ProductCard.module.css'

const { Text, Title } = Typography

export interface ProductCardProps {
    product: Product
    onClick?: () => void
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onClick,
}) => {
    const discountPercentage =
        product.originalPrice && product.price
            ? Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
            : null

    return (
        <Card
            hoverable
            className={styles.productCard}
            cover={
                <div className={styles.imageContainer}>
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={300}
                        height={300}
                        className={styles.productImage}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                </div>
            }
            onClick={onClick}
        >
            <div className={styles.productInfo}>
                <Title level={5} className={styles.productTitle} ellipsis={{ rows: 2 }}>
                    {product.name}
                </Title>

                <Space direction="vertical" size={4} className={styles.productMeta}>
                    <Space size={8}>
                        <Rating value={product.rating} />
                        <Text type="secondary" className={styles.reviewCount}>
                            ({product.reviewCount})
                        </Text>
                    </Space>

                    <Space direction="vertical" size={0}>
                        <Space size={8}>
                            <Text strong className={styles.price}>
                                ₹{product.price.toLocaleString()}
                            </Text>
                            {product.originalPrice && (
                                <>
                                    <Text delete type="secondary" className={styles.originalPrice}>
                                        ₹{product.originalPrice.toLocaleString()}
                                    </Text>
                                    {discountPercentage && (
                                        <Text type="danger" className={styles.discount}>
                                            {discountPercentage}% off
                                        </Text>
                                    )}
                                </>
                            )}
                        </Space>

                        {product.freeDelivery && (
                            <Text type="success" className={styles.deliveryBadge}>
                                FREE delivery
                            </Text>
                        )}
                    </Space>
                </Space>
            </div>
        </Card>
    )
}

