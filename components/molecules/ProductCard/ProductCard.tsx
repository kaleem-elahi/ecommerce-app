'use client'

import { Rating } from '@/components/atoms/Rating'
import { Product } from '@/lib/supabase'
import { HeartFilled, HeartOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Card, Space, Typography } from 'antd'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import styles from './ProductCard.module.css'

const { Text, Title } = Typography

// Helper to detect if URL is a video
const isVideo = (url: string): boolean => {
    if (!url) return false

    // Check for video file extensions
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv']
    const lowerUrl = url.toLowerCase()

    // Check file extension
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
        return true
    }

    // Check for data URL video type
    if (url.startsWith('data:video/')) {
        return true
    }

    // Check for YouTube or Vimeo
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) {
        return true
    }

    return false
}

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
    const videoRef = useRef<HTMLVideoElement>(null)

    const media = product.images && product.images.length > 0
        ? product.images
        : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400']

    const hasMultipleMedia = media.length > 1

    const discountPercentage =
        product.originalPrice && product.price
            ? Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
            : null

    // Auto-slide media when hovered
    useEffect(() => {
        if (!hasMultipleMedia || !isHovered) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % media.length)
        }, 3000) // Change media every 3 seconds (longer for videos)

        return () => clearInterval(interval)
    }, [hasMultipleMedia, media.length, isHovered])

    // Handle video autoplay when it becomes active
    useEffect(() => {
        const currentMedia = media[currentImageIndex]
        const isCurrentVideo = isVideo(currentMedia)

        if (videoRef.current && isCurrentVideo) {
            // Play current video if hovered
            if (isHovered) {
                videoRef.current.play().catch(() => {
                    // Autoplay may be blocked by browser, ignore error
                })
            } else {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        } else if (videoRef.current && !isCurrentVideo) {
            // If current media is not a video, pause any playing video
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
    }, [currentImageIndex, isHovered, media])

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
                // Pause video when mouse leaves
                if (videoRef.current) {
                    videoRef.current.pause()
                    videoRef.current.currentTime = 0
                }
            }}
            cover={
                <div className={styles.imageContainer}>
                    {/* Carousel Dots */}
                    {hasMultipleMedia && (
                        <div className={styles.carouselDots}>
                            {media.map((_, index) => {
                                const isVideoItem = isVideo(media[index])
                                return (
                                    <span
                                        key={index}
                                        className={`${styles.dot} ${index === currentImageIndex ? styles.activeDot : ''} ${isVideoItem ? styles.videoDot : ''}`}
                                        onClick={(e) => handleDotClick(e, index)}
                                        title={isVideoItem ? 'Video' : 'Image'}
                                    />
                                )
                            })}
                        </div>
                    )}

                    {/* Video Badge */}
                    {isVideo(media[currentImageIndex]) && (
                        <div className={styles.videoBadge}>
                            <PlayCircleOutlined style={{ fontSize: 16, marginRight: 4 }} />
                            <span>VIDEO</span>
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

                    {/* Render Video or Image */}
                    {isVideo(media[currentImageIndex]) ? (
                        <div className={styles.videoWrapper}>
                            {media[currentImageIndex].includes('youtube.com') ||
                                media[currentImageIndex].includes('youtu.be') ||
                                media[currentImageIndex].includes('vimeo.com') ? (
                                <div className={styles.videoPlaceholder}>
                                    <PlayCircleOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 8 }} />
                                    <Text style={{ color: '#fff', fontSize: 12 }}>Video URL</Text>
                                </div>
                            ) : (
                                <video
                                    key={`video-${currentImageIndex}`}
                                    ref={videoRef}
                                    src={media[currentImageIndex]}
                                    className={styles.productVideo}
                                    loop
                                    muted
                                    playsInline
                                    onLoadedData={() => {
                                        if (isHovered && videoRef.current) {
                                            videoRef.current.play().catch(() => {
                                                // Autoplay may be blocked, ignore
                                            })
                                        }
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        <Image
                            src={media[currentImageIndex]}
                            alt={product.name}
                            width={300}
                            height={300}
                            className={styles.productImage}
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                    )}
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

