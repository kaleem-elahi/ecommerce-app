'use client'

import { DeleteOutlined, PlayCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { Button, Image, message, Modal, Upload } from 'antd'
import { useEffect, useRef, useState } from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
    value?: string[]
    onChange?: (urls: string[]) => void
}

const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB in bytes for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB in bytes for videos
const MAX_IMAGES = 4 // Maximum 4 images allowed
const MAX_VIDEOS = 1 // Maximum 1 video allowed

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
    // Helper to normalize media values
    const getValidMedia = (val: string[] | string | undefined): string[] => {
        if (Array.isArray(val)) {
            return val.filter(url => url && typeof url === 'string' && url.trim().length > 0)
        } else if (val && typeof val === 'string' && val.trim().length > 0) {
            return [val]
        }
        return []
    }

    // Helper to detect if URL is a video
    const isVideo = (url: string): boolean => {
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

    const [mediaUrls, setMediaUrls] = useState<string[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropZoneRef = useRef<HTMLDivElement>(null)

    // Detect mobile view
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)

        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Sync with value prop
    useEffect(() => {
        const valueArray = getValidMedia(value)
        setMediaUrls(valueArray)
    }, [value])

    const handleFileToDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const validateFileSize = (file: File, isVideo: boolean): boolean => {
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
        const sizeLabel = isVideo ? '50MB' : '1MB'
        const fileType = isVideo ? 'video' : 'image'

        if (file.size > maxSize) {
            message.error(`${file.name} exceeds ${sizeLabel} size limit. Please choose a smaller ${fileType}.`)
            return false
        }
        return true
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        // Separate images and videos
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
        const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'))

        if (imageFiles.length === 0 && videoFiles.length === 0) {
            message.warning('Please select image or video files')
            return
        }

        // Count current images and videos
        const currentImages = mediaUrls.filter(url => !isVideo(url))
        const currentVideos = mediaUrls.filter(url => isVideo(url))

        // Check limits
        if (imageFiles.length + currentImages.length > MAX_IMAGES) {
            message.warning(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        if (videoFiles.length + currentVideos.length > MAX_VIDEOS) {
            message.warning(`Maximum ${MAX_VIDEOS} video allowed`)
            return
        }

        try {
            const newUrls: string[] = []
            // Process images
            for (const file of imageFiles) {
                // Validate file size
                if (!validateFileSize(file, false)) {
                    continue
                }

                // Convert to data URL for preview
                const dataUrl = await handleFileToDataURL(file)
                newUrls.push(dataUrl)
            }

            // Process videos
            for (const file of videoFiles) {
                // Validate file size
                if (!validateFileSize(file, true)) {
                    continue
                }

                // Convert to data URL for preview
                const dataUrl = await handleFileToDataURL(file)
                newUrls.push(dataUrl)
            }

            if (newUrls.length > 0) {
                const updatedUrls = [...mediaUrls, ...newUrls]
                setMediaUrls(updatedUrls)
                onChange?.(updatedUrls)

                const imageCount = imageFiles.length
                const videoCount = videoFiles.length
                const parts = []
                if (imageCount > 0) parts.push(`${imageCount} image(s)`)
                if (videoCount > 0) parts.push(`${videoCount} video(s)`)
                message.success(`Added ${parts.join(' and ')}`)
            } else {
                message.error('No valid files were added. Please check the requirements.')
            }
        } catch (error) {
            console.error('Error processing files:', error)
            message.error('Failed to process files')
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
    }, [mediaUrls])

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

        // Check if it's a video or image URL
        const isVideoUrl = isVideo(url)
        const currentImages = mediaUrls.filter(u => !isVideo(u))
        const currentVideos = mediaUrls.filter(u => isVideo(u))

        if (isVideoUrl && currentVideos.length >= MAX_VIDEOS) {
            message.warning(`Maximum ${MAX_VIDEOS} video allowed`)
            return
        }

        if (!isVideoUrl && currentImages.length >= MAX_IMAGES) {
            message.warning(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        if (mediaUrls.includes(url)) {
            message.warning('This URL is already added')
            return
        }

        const updatedUrls = [...mediaUrls, url]
        setMediaUrls(updatedUrls)
        onChange?.(updatedUrls)
        message.success(`${isVideoUrl ? 'Video' : 'Image'} URL added`)
    }

    const removeMedia = (index: number) => {
        const mediaType = isVideo(mediaUrls[index]) ? 'Video' : 'Image'
        const updatedUrls = mediaUrls.filter((_, i) => i !== index)
        setMediaUrls(updatedUrls)
        onChange?.(updatedUrls)
        message.success(`${mediaType} removed`)
    }

    const handleManualUrlAdd = () => {
        const url = prompt('Enter image or video URL (YouTube, Vimeo, or direct link):')
        if (url) {
            handleUrlInput(url)
        }
    }

    return (
        <div className={styles.imageUploadContainer}>
            {/* Mobile View: Simple Browse Button */}
            {isMobile ? (
                <div className={styles.mobileUploadSection}>
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => fileInputRef.current?.click()}
                        size="large"
                        block
                        style={{ marginBottom: 12 }}
                    >
                        Browse Images
                    </Button>
                    <div className={styles.uploadRequirements}>
                        <div>📸 Max {MAX_IMAGES} images (1MB each)</div>
                        <div>🎥 Max {MAX_VIDEOS} video (50MB, MP4/WebM/MOV)</div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                    />
                </div>
            ) : (
                <>
                    {/* Desktop View: Drag & Drop Zone */}
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
                        <div className={styles.uploadRequirements} style={{ marginTop: 12 }}>
                            <div>📸 Max {MAX_IMAGES} images (1MB each)</div>
                            <div>🎥 Max {MAX_VIDEOS} video (50MB, MP4/WebM/MOV)</div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileInputChange}
                        />
                    </div>

                    {/* Manual URL Input - Desktop only */}
                    <div className={styles.urlInputSection}>
                        <Button
                            icon={<PlusOutlined />}
                            onClick={handleManualUrlAdd}
                            style={{ marginBottom: 12 }}
                        >
                            Add Media URL
                        </Button>
                    </div>
                </>
            )}

            {/* Media Preview Grid - Always show section, even if empty */}
            <div style={{ marginTop: 24 }}>
                <div style={{
                    marginBottom: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#666'
                }}>
                    Current Media {mediaUrls.length > 0 && `(${mediaUrls.filter(u => !isVideo(u)).length} images, ${mediaUrls.filter(u => isVideo(u)).length} video)`}:
                </div>

                {mediaUrls.length > 0 ? (
                    <>
                        <div className={styles.imageGrid}>
                            {mediaUrls.map((url, index) => {
                                const isVideoFile = isVideo(url)
                                return (
                                    <div key={`${url}-${index}`} className={styles.imageItem}>
                                        <div className={styles.imageWrapper}>
                                            {isVideoFile ? (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: '#000',
                                                    borderRadius: 4,
                                                    position: 'relative'
                                                }}>
                                                    {url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') ? (
                                                        <div style={{
                                                            color: '#fff',
                                                            textAlign: 'center',
                                                            fontSize: 10,
                                                            padding: 8
                                                        }}>
                                                            <PlayCircleOutlined style={{ fontSize: 32, marginBottom: 4 }} />
                                                            <div>Video URL</div>
                                                        </div>
                                                    ) : (
                                                        <video
                                                            src={url}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                borderRadius: 4
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 4,
                                                        left: 4,
                                                        background: 'rgba(255, 0, 0, 0.8)',
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        padding: '2px 6px',
                                                        borderRadius: 3,
                                                        fontWeight: 600,
                                                    }}>
                                                        VIDEO
                                                    </div>
                                                </div>
                                            ) : (
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
                                            )}
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                className={styles.deleteButton}
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: `Delete ${isVideoFile ? 'Video' : 'Image'}`,
                                                        content: `Are you sure you want to remove this ${isVideoFile ? 'video' : 'image'}?`,
                                                        okText: 'Delete',
                                                        okType: 'danger',
                                                        cancelText: 'Cancel',
                                                        onOk: () => {
                                                            removeMedia(index)
                                                        },
                                                    })
                                                }}
                                                size="small"
                                                title={`Delete ${isVideoFile ? 'video' : 'image'}`}
                                            />
                                        </div>
                                        <div className={styles.imageIndex}>{index + 1}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={styles.imageCount} style={{ marginTop: 12 }}>
                            {mediaUrls.filter(u => !isVideo(u)).length} / {MAX_IMAGES} images • {mediaUrls.filter(u => isVideo(u)).length} / {MAX_VIDEOS} video
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
                        No media added yet
                    </div>
                )}
            </div>
        </div>
    )
}

