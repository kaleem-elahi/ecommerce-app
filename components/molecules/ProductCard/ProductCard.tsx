'use client'

import { Rating } from '@/components/atoms/Rating'
import { Product } from '@/lib/supabase'
import { HeartFilled, HeartOutlined } from '@ant-design/icons'
import { Card, Space, Typography } from 'antd'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const images = product.images && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400']

    const hasMultipleImages = images.length > 1

    const discountPercentage =
        product.originalPrice && product.price
            ? Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
            : null

    // Auto-slide images when hovered
    useEffect(() => {
        if (!hasMultipleImages || !isHovered) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 1500) // Change image every 1.5 seconds

        return () => clearInterval(interval)
    }, [hasMultipleImages, images.length, isHovered])

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsWishlisted(!isWishlisted)
    }

    const handleDotClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        setCurrentImageIndex(index)
    }

    return (
        <Card
            hoverable
            className={styles.productCard}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false)
                setCurrentImageIndex(0)
            }}
            cover={
                <div className={styles.imageContainer}>
                    {/* Carousel Dots */}
                    {hasMultipleImages && (
                        <div className={styles.carouselDots}>
                            {images.map((_, index) => (
                                <span
                                    key={index}
                                    className={`${styles.dot} ${index === currentImageIndex ? styles.activeDot : ''}`}
                                    onClick={(e) => handleDotClick(e, index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Wishlist Icon */}
                    <div className={styles.wishlistIcon} onClick={handleWishlistClick}>
                        {isWishlisted ? (
                            <HeartFilled style={{ color: '#ff4d4f', fontSize: 20 }} />
                        ) : (
                            <HeartOutlined style={{ fontSize: 20 }} />
                        )}
                    </div>

                    <Image
                        src={images[currentImageIndex]}
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
                        <Rating value={product.rating || 0} />
                        <Text type="secondary" className={styles.reviewCount}>
                            ({product.reviewCount || 0})
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

