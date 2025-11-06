'use client'

import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Image, message, Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { useState, useRef, useEffect } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
    value?: string[]
    onChange?: (urls: string[]) => void
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
    const [imageUrls, setImageUrls] = useState<string[]>(value)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setImageUrls(value)
    }, [value])

    const handleFileToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        const imageFiles = Array.from(files).filter(file => 
            file.type.startsWith('image/')
        )

        if (imageFiles.length === 0) {
            message.warning('Please select image files only')
            return
        }

        if (imageFiles.length + imageUrls.length > 10) {
            message.warning('Maximum 10 images allowed')
            return
        }

        try {
            const newUrls: string[] = []
            for (const file of imageFiles) {
                // Convert to data URL for preview
                // In production, you'd upload to Supabase Storage or another service
                const dataUrl = await handleFileToDataURL(file)
                newUrls.push(dataUrl)
            }

            const updatedUrls = [...imageUrls, ...newUrls]
            setImageUrls(updatedUrls)
            onChange?.(updatedUrls)
            message.success(`Added ${imageFiles.length} image(s)`)
        } catch (error) {
            console.error('Error processing images:', error)
            message.error('Failed to process images')
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        handleFiles(files)
    }

    const handlePaste = (e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        const imageFiles: File[] = []
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile()
                if (file) {
                    imageFiles.push(file)
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault()
            // Create a FileList-like object
            const dataTransfer = new DataTransfer()
            imageFiles.forEach(file => dataTransfer.items.add(file))
            handleFiles(dataTransfer.files)
        }
    }

    useEffect(() => {
        const dropZone = dropZoneRef.current
        if (!dropZone) return

        // Add paste event listener
        const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e)
        window.addEventListener('paste', handlePasteEvent)

        return () => {
            window.removeEventListener('paste', handlePasteEvent)
        }
    }, [imageUrls])

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files)
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUrlInput = (url: string) => {
        if (!url.trim()) return

        // Validate URL
        try {
            new URL(url)
        } catch {
            message.error('Please enter a valid URL')
            return
        }

        if (imageUrls.length >= 10) {
            message.warning('Maximum 10 images allowed')
            return
        }

        if (imageUrls.includes(url)) {
            message.warning('This image URL is already added')
            return
        }

        const updatedUrls = [...imageUrls, url]
        setImageUrls(updatedUrls)
        onChange?.(updatedUrls)
        message.success('Image URL added')
    }

    const removeImage = (index: number) => {
        const updatedUrls = imageUrls.filter((_, i) => i !== index)
        setImageUrls(updatedUrls)
        onChange?.(updatedUrls)
    }

    const handleManualUrlAdd = () => {
        const url = prompt('Enter image URL:')
        if (url) {
            handleUrlInput(url)
        }
    }

    return (
        <div className={styles.imageUploadContainer}>
            {/* Drag & Drop Zone */}
            <div
                ref={dropZoneRef}
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <UploadOutlined className={styles.uploadIcon} />
                <p className={styles.dropZoneText}>
                    Drag & drop images here, or{' '}
                    <Button
                        type="link"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: 0, height: 'auto' }}
                    >
                        browse
                    </Button>
                </p>
                <p className={styles.dropZoneHint}>
                    You can also paste images from clipboard (Ctrl+V / Cmd+V)
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                />
            </div>

            {/* Manual URL Input */}
            <div className={styles.urlInputSection}>
                <Button
                    icon={<PlusOutlined />}
                    onClick={handleManualUrlAdd}
                    style={{ marginBottom: 12 }}
                >
                    Add Image URL
                </Button>
            </div>

            {/* Image Preview Grid */}
            {imageUrls.length > 0 && (
                <div className={styles.imageGrid}>
                    {imageUrls.map((url, index) => (
                        <div key={index} className={styles.imageItem}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    width={120}
                                    height={120}
                                    style={{
                                        objectFit: 'cover',
                                        borderRadius: 4,
                                    }}
                                    fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23f0f0f0' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    className={styles.deleteButton}
                                    onClick={() => removeImage(index)}
                                    size="small"
                                />
                            </div>
                            <div className={styles.imageIndex}>{index + 1}</div>
                        </div>
                    ))}
                </div>
            )}

            {imageUrls.length > 0 && (
                <div className={styles.imageCount}>
                    {imageUrls.length} / 10 images
                </div>
            )}
        </div>
    )
}

