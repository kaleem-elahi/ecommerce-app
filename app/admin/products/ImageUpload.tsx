'use client'

import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { Button, Image, message, Modal, Upload } from 'antd'
import { useEffect, useRef, useState } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
    value?: string[]
    onChange?: (urls: string[]) => void
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
    // Helper to normalize image values
    const getValidImages = (val: string[] | string | undefined): string[] => {
        if (Array.isArray(val)) {
            return val.filter(url => url && typeof url === 'string' && url.trim().length > 0)
        } else if (val && typeof val === 'string' && val.trim().length > 0) {
            return [val]
        }
        return []
    }

    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    // Sync with value prop - simplified version
    useEffect(() => {
        console.log('=== ImageUpload useEffect TRIGGERED ===')
        console.log('value prop received:', value)
        console.log('value type:', typeof value)
        console.log('value is array?:', Array.isArray(value))
        console.log('value length:', Array.isArray(value) ? value.length : 'N/A')

        const valueArray = getValidImages(value)
        console.log('After getValidImages:', valueArray)
        console.log('valueArray length:', valueArray.length)
        console.log('Setting imageUrls to:', valueArray)
        setImageUrls(valueArray)
        console.log('=== ImageUpload useEffect END ===')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        message.success('Image removed')
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

            {/* Image Preview Grid - Always show section, even if empty */}
            <div style={{ marginTop: 24 }}>
                <div style={{
                    marginBottom: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#666'
                }}>
                    Current Images {imageUrls.length > 0 && `(${imageUrls.length})`}:
                    {process.env.NODE_ENV === 'development' && (
                        <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                            (Debug: imageUrls={imageUrls.length}, value={Array.isArray(value) ? value.length : 'N/A'})
                        </span>
                    )}
                </div>

                {imageUrls.length > 0 ? (
                    <>
                        <div className={styles.imageGrid}>
                            {imageUrls.map((url, index) => (
                                <div key={`${url}-${index}`} className={styles.imageItem}>
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            width={120}
                                            height={120}
                                            style={{
                                                objectFit: 'cover',
                                                borderRadius: 4,
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            preview={{
                                                mask: 'Preview',
                                            }}
                                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23f0f0f0' width='120' height='120'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className={styles.deleteButton}
                                            onClick={() => {
                                                Modal.confirm({
                                                    title: 'Delete Image',
                                                    content: 'Are you sure you want to remove this image?',
                                                    okText: 'Delete',
                                                    okType: 'danger',
                                                    cancelText: 'Cancel',
                                                    onOk: () => {
                                                        removeImage(index)
                                                    },
                                                })
                                            }}
                                            size="small"
                                            title="Delete image"
                                        />
                                    </div>
                                    <div className={styles.imageIndex}>{index + 1}</div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.imageCount} style={{ marginTop: 12 }}>
                            {imageUrls.length} / 10 images
                        </div>
                    </>
                ) : (
                    <div style={{
                        padding: 20,
                        textAlign: 'center',
                        color: '#999',
                        fontSize: 14,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 4,
                        background: '#fafafa'
                    }}>
                        No images added yet
                    </div>
                )}
            </div>
        </div>
    )
}

