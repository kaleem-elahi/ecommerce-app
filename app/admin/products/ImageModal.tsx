'use client'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Image, Modal } from 'antd'
import { useEffect, useState } from 'react'
import styles from './ImageModal.module.css'

interface ImageModalProps {
    open: boolean
    images: string[]
    initialIndex?: number
    onClose: () => void
}

export function ImageModal({ open, images, initialIndex = 0, onClose }: ImageModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex, open])

    if (!images || images.length === 0) {
        return null
    }

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index)
    }

    const currentImage = images[currentIndex]

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width="90vw"
            style={{ top: 20 }}
            className={styles.imageModal}
            centered
        >
            <div className={styles.modalContent}>
                {/* Main Image Display */}
                <div className={styles.mainImageContainer}>
                    {images.length > 1 && (
                        <Button
                            type="text"
                            icon={<LeftOutlined />}
                            className={styles.navButton}
                            onClick={handlePrevious}
                            size="large"
                        />
                    )}

                    <div className={styles.mainImageWrapper}>
                        <Image
                            src={currentImage}
                            alt={`Product image ${currentIndex + 1}`}
                            className={styles.mainImage}
                            preview={false}
                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E"
                        />
                    </div>

                    {images.length > 1 && (
                        <Button
                            type="text"
                            icon={<RightOutlined />}
                            className={styles.navButton}
                            onClick={handleNext}
                            size="large"
                        />
                    )}
                </div>

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className={styles.imageCounter}>
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                    <div className={styles.thumbnailContainer}>
                        <div className={styles.thumbnailGrid}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''
                                        }`}
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <Image
                                        src={image}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={80}
                                        height={80}
                                        preview={false}
                                        style={{
                                            objectFit: 'cover',
                                            borderRadius: 4,
                                        }}
                                        fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23f0f0f0' width='80' height='80'/%3E%3C/svg%3E"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

