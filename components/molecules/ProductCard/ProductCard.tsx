'use client'

import { Rating } from '@/components/atoms/Rating'
import { Product } from '@/lib/supabase'
import { CaretRightFilled, HeartFilled, HeartOutlined, PlayCircleOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Card, Typography } from 'antd'
import Image from 'next/image'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ProductCard.module.css'

const { Text } = Typography

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

    const media = useMemo(() => {
        return product.images && product.images.length > 0
            ? product.images
            : ['/public/assets/the-agate-city-logo.png']
    }, [product.images])

    const hasMultipleMedia = media.length > 1
    const showBadge = !!product.featured
    const resolveBrand = (value: any): string | undefined => {
        if (!value) return undefined
        if (typeof value === 'string') return value
        if (typeof value === 'object' && 'name' in value && typeof value.name === 'string') {
            return value.name
        }
        return undefined
    }

    const brandName =
        resolveBrand(product.metadata?.brand) ||
        resolveBrand(product.metadata?.seller) ||
        resolveBrand((product as any).brand) ||
        resolveBrand(product.category)

    const discountPercentage =
        product.originalPrice && product.price
            ? Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) *
                100
            )
            : null

    // Auto-slide media when hovered - wait for videos to finish
    useEffect(() => {
        if (!hasMultipleMedia || !isHovered) return

        const currentMedia = media[currentImageIndex]
        const isCurrentVideo = isVideo(currentMedia)
        const isVideoURL = isCurrentVideo && (
            currentMedia.includes('youtube.com') ||
            currentMedia.includes('youtu.be') ||
            currentMedia.includes('vimeo.com')
        )
        let timeoutId: NodeJS.Timeout | null = null

        // If current item is an image, use timer
        if (!isCurrentVideo) {
            timeoutId = setTimeout(() => {
                setCurrentImageIndex((prev) => (prev + 1) % media.length)
            }, 3000) // Change image every 3 seconds
        }
        // For YouTube/Vimeo URLs (no video element), use a longer timer
        else if (isVideoURL) {
            timeoutId = setTimeout(() => {
                setCurrentImageIndex((prev) => (prev + 1) % media.length)
            }, 10000) // Wait 10 seconds for video URLs (can't detect when they end)
        }
        // For actual video files, we'll wait for the 'ended' event (handled in video effect)

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [hasMultipleMedia, media.length, isHovered, currentImageIndex, media])

    // Handle video autoplay and slide to next when video ends
    useEffect(() => {
        const currentMedia = media[currentImageIndex]
        const isCurrentVideo = isVideo(currentMedia)
        const videoElement = videoRef.current

        if (videoElement && isCurrentVideo) {
            // Play current video if hovered
            if (isHovered) {
                videoElement.play().catch(() => {
                    // Autoplay may be blocked by browser, ignore error
                })

                // Listen for video end event
                const handleVideoEnd = () => {
                    if (hasMultipleMedia && isHovered) {
                        // Move to next item when video finishes
                        setCurrentImageIndex((prev) => (prev + 1) % media.length)
                    }
                }

                videoElement.addEventListener('ended', handleVideoEnd)

                return () => {
                    videoElement.removeEventListener('ended', handleVideoEnd)
                }
            } else {
                videoElement.pause()
                videoElement.currentTime = 0
            }
        } else if (videoElement && !isCurrentVideo) {
            // If current media is not a video, pause any playing video
            videoElement.pause()
            videoElement.currentTime = 0
        }
    }, [currentImageIndex, isHovered, media, hasMultipleMedia])

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsWishlisted(!isWishlisted)
    }

    const handleDotClick = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        setCurrentImageIndex(index)
    }

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Add to cart logic here
        console.log('Add to cart:', product.id)
    }

    const handleMoreLikeThis = (e: React.MouseEvent) => {
        e.stopPropagation()
        // More like this logic here
        console.log('More like this:', product.id)
    }

    const formatReviewCount = (count: number): string => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`
        }
        return count.toString()
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
                    {/* Bestseller Badge */}
                    {showBadge && (
                        <div className={styles.bestsellerBadge}>
                            Bestseller
                        </div>
                    )}

                    {/* Carousel Dots */}
                    {hasMultipleMedia && (
                        <div className={`${styles.carouselDots} ${showBadge ? styles.carouselDotsWithBadge : ''}`}>
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

                    {/* Wishlist Icon - Hidden by default, shown on hover */}
                    <div className={styles.wishlistIcon} onClick={handleWishlistClick}>
                        {isWishlisted ? (
                            <HeartFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
                        ) : (
                            <HeartOutlined style={{ fontSize: 18 }} />
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

                    {isVideo(media[currentImageIndex]) && (
                        <div className={styles.videoIndicator}>
                            <CaretRightFilled className={styles.videoIndicatorIcon} />
                        </div>
                    )}
                </div>
            }
            onClick={onClick}
        >
            <div className={styles.productInfo}>
                {/* Product Title with Rating */}
                <div className={styles.titleRow}>
                    <div className={styles.productTitle}>
                        {product.name}
                    </div>
                    <div className={styles.ratingContainer}>
                        <span className={styles.ratingValue}>
                            {product.rating?.toFixed(1) || '0.0'}
                        </span>
                        <span className={styles.starIcon}>★</span>
                        <span className={styles.reviewCount}>
                            ({formatReviewCount(product.reviewCount || 0)})
                        </span>
                    </div>
                </div>

                {/* Brand Name */}
                {brandName && (
                    <Text className={styles.brandName}>
                        By {brandName}
                    </Text>
                )}

                {/* Pricing */}
                <div className={styles.pricingSection}>
                    <div className={styles.priceRow}>
                        <Text className={styles.currentPrice}>
                            ₹{product.price.toLocaleString()}
                        </Text>
                        {product.originalPrice && (
                            <>
                                <Text delete className={styles.originalPrice}>
                                    ₹{product.originalPrice.toLocaleString()}
                                </Text>
                                {discountPercentage && (
                                    <Text className={styles.discount}>
                                        ({discountPercentage}% off)
                                    </Text>
                                )}
                            </>
                        )}
                    </div>
                    {product.freeDelivery && (
                        <Text className={styles.deliveryBadge}>
                            Free delivery
                        </Text>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={styles.actionButtons}>
                    <Button
                        className={styles.addToCartButton}
                        onClick={handleAddToCart}
                        icon={<PlusOutlined />}
                    />
                    <Button
                        type="link"
                        className={styles.moreLikeThisButton}
                        onClick={handleMoreLikeThis}
                    >
                        <span>More like this</span>
                        <RightOutlined className={styles.moreLikeThisIcon} />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

