'use client'

import { CheckOutlined, LinkOutlined, PlusOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { Button, Modal, Slider, Space, Upload, message } from 'antd'
import type { RcFile } from 'antd/es/upload'
import NextImage from 'next/image'
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import styles from './ImageUpload.module.css'

interface ImageUploadProps {
    value?: string[]
    onChange?: (urls: string[]) => void
}

type MediaUploadFile = UploadFile & { isVideo?: boolean }

const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB per image
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB per video
const MAX_IMAGES = 4
const MAX_VIDEOS = 1

const VIDEO_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vidgrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8F61DB"/>
      <stop offset="100%" stop-color="#FF7A45"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="14" fill="url(#vidgrad)"/>
  <polygon points="52,40 52,80 82,60" fill="#FFFFFF" opacity="0.85"/>
  <text x="50%" y="94" font-size="14" fill="#FFFFFF" font-family="Arial, sans-serif" text-anchor="middle">VIDEO</text>
</svg>
`)}`

const normalizeValue = (val?: string[] | string): string[] => {
    if (Array.isArray(val)) {
        return val.filter(url => typeof url === 'string' && url.trim().length > 0)
    }
    if (typeof val === 'string' && val.trim().length > 0) {
        return [val]
    }
    return []
}

const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv']

const isVideoUrl = (url: string): boolean => {
    if (!url) return false
    const lower = url.toLowerCase()

    if (url.startsWith('data:video/')) return true
    if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return true
    if (videoExtensions.some(ext => lower.includes(ext))) return true

    return false
}

const getVideoEmbedUrl = (url: string): string | null => {
    try {
        const parsed = new URL(url)
        if (parsed.hostname.includes('youtube.com')) {
            const id = parsed.searchParams.get('v')
            return id ? `https://www.youtube.com/embed/${id}` : null
        }

        if (parsed.hostname === 'youtu.be') {
            const id = parsed.pathname.slice(1)
            return id ? `https://www.youtube.com/embed/${id}` : null
        }

        if (parsed.hostname.includes('vimeo.com')) {
            const segments = parsed.pathname.split('/').filter(Boolean)
            const id = segments.at(-1)
            return id ? `https://player.vimeo.com/video/${id}` : null
        }
    } catch {
        return null
    }

    return null
}

const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })

// Create image element from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.src = url
    })

// Crop image using canvas (native browser API)
const cropImage = async (
    imageSrc: string,
    cropArea: { x: number; y: number; width: number; height: number },
    rotation: number = 0
): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Could not get canvas context')
    }

    // Set canvas size to crop area
    canvas.width = cropArea.width
    canvas.height = cropArea.height

    // Handle rotation
    if (rotation !== 0) {
        const maxSize = Math.max(image.width, image.height)
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) throw new Error('Could not get temp canvas context')

        tempCanvas.width = maxSize
        tempCanvas.height = maxSize

        tempCtx.translate(maxSize / 2, maxSize / 2)
        tempCtx.rotate((rotation * Math.PI) / 180)
        tempCtx.drawImage(image, -image.width / 2, -image.height / 2)

        // Draw cropped area from rotated image
        ctx.drawImage(
            tempCanvas,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
        )
    } else {
        // Draw cropped area directly
        ctx.drawImage(
            image,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
        )
    }

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    resolve('')
                    return
                }
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => resolve('')
                reader.readAsDataURL(blob)
            },
            'image/jpeg',
            0.92
        )
    })
}

// Add watermark to image
const addWatermark = async (imageSrc: string): Promise<string> => {
    const image = await createImage(imageSrc)

    // Try to load logo, but continue without it if it fails
    let logo: HTMLImageElement | null = null
    try {
        logo = await createImage('/assets/brand-logo-transparent.png')
    } catch (error) {
        console.warn('Logo not found, watermarking with text only:', error)
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Could not get canvas context')
    }

    // Set canvas size to image size
    canvas.width = image.width
    canvas.height = image.height

    // Draw the image
    ctx.drawImage(image, 0, 0)

    // Calculate watermark size (proportional to image)
    const watermarkHeight = Math.max(30, image.height * 0.08) // 8% of image height, min 30px

    // Set font first to measure text correctly
    const fontSize = watermarkHeight * 0.6
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    // Measure text width
    const textWidth = ctx.measureText('theagatecity.com').width

    // Calculate logo width if logo exists
    const logoWidth = logo ? (watermarkHeight * (logo.width / logo.height)) : 0
    const gap = logo ? 8 : 0 // Gap between logo and text (only if logo exists)

    // Position watermark in bottom right with padding
    const padding = Math.max(10, image.width * 0.02) // 2% padding, min 10px
    const bgPadding = 8
    const totalWidth = logoWidth + gap + textWidth
    const bgX = image.width - padding - totalWidth - bgPadding * 2
    const bgY = image.height - padding - watermarkHeight - bgPadding
    const bgWidth = totalWidth + bgPadding * 2
    const bgHeight = watermarkHeight + bgPadding

    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight)

    // Draw logo if available
    if (logo) {
        ctx.drawImage(
            logo,
            bgX + bgPadding,
            bgY + bgPadding / 2,
            logoWidth,
            watermarkHeight
        )
    }

    // Draw website text
    ctx.fillStyle = '#ffffff'
    ctx.fillText(
        'theagatecity.com',
        bgX + bgPadding + logoWidth + gap,
        bgY + bgHeight / 2
    )

    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    resolve('')
                    return
                }
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = () => resolve('')
                reader.readAsDataURL(blob)
            },
            'image/jpeg',
            0.92
        )
    })
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [fileList, setFileList] = useState<MediaUploadFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewTitle, setPreviewTitle] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [previewIsVideo, setPreviewIsVideo] = useState(false)
    const [previewEmbedUrl, setPreviewEmbedUrl] = useState<string | null>(null)

    // Crop modal state
    const [cropModalVisible, setCropModalVisible] = useState(false)
    const [imageToCrop, setImageToCrop] = useState<string>('')
    const [cropFileName, setCropFileName] = useState<string>('')
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [isCropping, setIsCropping] = useState(false)
    const [isDraggingCrop, setIsDraggingCrop] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const pendingImageFile = useRef<File | null>(null)
    const imageContainerRef = useRef<HTMLDivElement | null>(null)
    const cropBoxRef = useRef<HTMLDivElement | null>(null)

    const containerRef = useRef<HTMLDivElement | null>(null)
    const fileListRef = useRef<MediaUploadFile[]>([])

    const emitChange = useCallback((list: MediaUploadFile[]) => {
        const urls = list
            .map(item => item.url)
            .filter((url): url is string => typeof url === 'string' && url.length > 0)
        onChange?.(urls)
    }, [onChange])

    useEffect(() => {
        fileListRef.current = fileList
    }, [fileList])

    useEffect(() => {
        const normalized = normalizeValue(value)
        const currentUrls = fileListRef.current
            .map(file => file.url)
            .filter((url): url is string => typeof url === 'string')

        const areSame =
            normalized.length === currentUrls.length &&
            normalized.every((url, idx) => url === currentUrls[idx])

        if (areSame) return

        const nextList: MediaUploadFile[] = normalized.map((url, index) => {
            const video = isVideoUrl(url)
            return {
                uid: `existing-${index}-${url}`,
                name: url.split('/').pop() || (video ? 'Video' : 'Image'),
                status: 'done',
                url,
                thumbUrl: video ? VIDEO_PLACEHOLDER : url,
                type: video ? 'video/url' : 'image/url',
                isVideo: video,
            }
        })

        setFileList(nextList)
        fileListRef.current = nextList
    }, [value])

    const handleAddFiles = useCallback(async (files: File[]) => {
        if (!files.length) return

        const currentList = fileListRef.current
        let imageCount = currentList.filter(item => !item.isVideo).length
        let videoCount = currentList.filter(item => item.isVideo).length

        const additions: MediaUploadFile[] = []
        const imagesToCrop: File[] = []

        for (const file of files) {
            const isVideoFile = file.type.startsWith('video/')
            const isImageFile = file.type.startsWith('image/')

            if (!isVideoFile && !isImageFile) {
                message.warning(`${file.name} is not an image or video`)
                continue
            }

            if (isVideoFile && videoCount >= MAX_VIDEOS) {
                message.warning(`Maximum ${MAX_VIDEOS} video allowed`)
                continue
            }

            if (isImageFile && imageCount >= MAX_IMAGES) {
                message.warning(`Maximum ${MAX_IMAGES} images allowed`)
                continue
            }

            const maxSize = isVideoFile ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
            const sizeLabel = isVideoFile ? '50MB' : '1MB'

            if (file.size > maxSize) {
                message.error(`${file.name} exceeds ${sizeLabel} limit`)
                continue
            }

            // For images, open crop modal. For videos, add directly.
            if (isImageFile) {
                imagesToCrop.push(file)
                imageCount += 1
            } else {
                // Handle videos directly
                let dataUrl: string
                try {
                    dataUrl = await fileToDataUrl(file)
                } catch (err) {
                    console.error('Failed to read file', err)
                    message.error(`Failed to read ${file.name}`)
                    continue
                }

                additions.push({
                    uid: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    name: file.name,
                    status: 'done',
                    url: dataUrl,
                    thumbUrl: VIDEO_PLACEHOLDER,
                    type: file.type,
                    isVideo: true,
                    originFileObj: file as RcFile,
                })
                videoCount += 1
            }
        }

        // Process first image for cropping
        if (imagesToCrop.length > 0) {
            const firstImage = imagesToCrop[0]
            try {
                const imageUrl = await fileToDataUrl(firstImage)
                pendingImageFile.current = firstImage
                setCropFileName(firstImage.name)
                setImageToCrop(imageUrl)

                // Load image to get dimensions
                const img = await createImage(imageUrl)
                const containerWidth = 600
                const containerHeight = 400
                const imgAspect = img.width / img.height
                const containerAspect = containerWidth / containerHeight

                let displayWidth = containerWidth
                let displayHeight = containerHeight

                if (imgAspect > containerAspect) {
                    displayHeight = containerWidth / imgAspect
                } else {
                    displayWidth = containerHeight * imgAspect
                }

                setImageSize({ width: displayWidth, height: displayHeight })

                // Initialize crop area (center, 200x200 or smaller)
                const cropSize = Math.min(200, displayWidth * 0.8, displayHeight * 0.8)
                setCropArea({
                    x: (displayWidth - cropSize) / 2,
                    y: (displayHeight - cropSize) / 2,
                    width: cropSize,
                    height: cropSize,
                })
                setZoom(1)
                setRotation(0)
                setCropModalVisible(true)
            } catch (err) {
                console.error('Failed to read image', err)
                message.error(`Failed to read ${firstImage.name}`)
            }
        }

        // Add videos immediately if any
        if (additions.length > 0) {
            const nextList = [...currentList, ...additions]
            setFileList(nextList)
            fileListRef.current = nextList
            emitChange(nextList)
            message.success(`Added ${additions.length} video${additions.length > 1 ? 's' : ''}`)
        }
    }, [emitChange])

    const handleBeforeUpload = useCallback((file: RcFile) => {
        void handleAddFiles([file])
        return Upload.LIST_IGNORE
    }, [handleAddFiles])

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)

        const droppedFiles = Array.from(event.dataTransfer.files || [])
        if (droppedFiles.length) {
            void handleAddFiles(droppedFiles)
        }
    }, [handleAddFiles])

    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(true)
    }, [])

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
    }, [])

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const current = containerRef.current
        const related = event.relatedTarget as Node | null
        if (current && related && current.contains(related)) {
            return
        }
        setIsDragging(false)
    }, [])

    const addUrl = useCallback((rawUrl: string) => {
        const trimmed = rawUrl.trim()
        if (!trimmed) return

        try {
            new URL(trimmed)
        } catch {
            message.error('Please enter a valid URL')
            return
        }

        const currentList = fileListRef.current

        if (currentList.some(item => item.url === trimmed)) {
            message.warning('This URL is already added')
            return
        }

        const isVideo = isVideoUrl(trimmed)
        const imageCount = currentList.filter(item => !item.isVideo).length
        const videoCount = currentList.filter(item => item.isVideo).length

        if (isVideo && videoCount >= MAX_VIDEOS) {
            message.warning(`Maximum ${MAX_VIDEOS} video allowed`)
            return
        }

        if (!isVideo && imageCount >= MAX_IMAGES) {
            message.warning(`Maximum ${MAX_IMAGES} images allowed`)
            return
        }

        const nextFile: MediaUploadFile = {
            uid: `url-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            name: trimmed.split('/').pop() || (isVideo ? 'Video URL' : 'Image URL'),
            status: 'done',
            url: trimmed,
            thumbUrl: isVideo ? VIDEO_PLACEHOLDER : trimmed,
            type: isVideo ? 'video/url' : 'image/url',
            isVideo,
        }

        const nextList = [...currentList, nextFile]
        setFileList(nextList)
        fileListRef.current = nextList
        emitChange(nextList)
        message.success(`${isVideo ? 'Video' : 'Image'} URL added`)
    }, [emitChange])

    const handleManualUrlAdd = useCallback(() => {
        const input = window.prompt('Enter image or video URL (YouTube, Vimeo, or direct link):')
        if (input) {
            addUrl(input)
        }
    }, [addUrl])

    const handleRemove = useCallback((file: UploadFile) => {
        const mediaFile = file as MediaUploadFile
        Modal.confirm({
            title: `Delete ${mediaFile.isVideo ? 'Video' : 'Image'}`,
            content: `Are you sure you want to remove this ${mediaFile.isVideo ? 'video' : 'image'}?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            onOk: () => {
                const nextList = fileListRef.current.filter(item => item.uid !== mediaFile.uid)
                setFileList(nextList)
                fileListRef.current = nextList
                emitChange(nextList)
                message.success(`${mediaFile.isVideo ? 'Video' : 'Image'} removed`)
            },
        })
        return false
    }, [emitChange])

    // Crop handlers
    const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDraggingCrop(true)
        setDragStart({ x: e.clientX, y: e.clientY })
    }, [])

    const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDraggingCrop || !imageContainerRef.current) return

        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        setCropArea(prev => ({
            ...prev,
            x: Math.max(0, Math.min(imageSize.width - prev.width, prev.x + deltaX)),
            y: Math.max(0, Math.min(imageSize.height - prev.height, prev.y + deltaY)),
        }))
        setDragStart({ x: e.clientX, y: e.clientY })
    }, [isDraggingCrop, dragStart, imageSize])

    const handleCropMouseUp = useCallback(() => {
        setIsDraggingCrop(false)
    }, [])

    const handleCropResize = useCallback((e: React.MouseEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
        e.stopPropagation()
        const startX = e.clientX
        const startY = e.clientY
        const startCrop = { ...cropArea }

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            let newCrop = { ...startCrop }
            const minSize = 50

            if (corner === 'se') {
                newCrop.width = Math.max(minSize, Math.min(imageSize.width - newCrop.x, startCrop.width + deltaX))
                newCrop.height = Math.max(minSize, Math.min(imageSize.height - newCrop.y, startCrop.height + deltaY))
            } else if (corner === 'sw') {
                newCrop.x = Math.max(0, Math.min(startCrop.x + deltaX, startCrop.x + startCrop.width - minSize))
                newCrop.width = startCrop.x + startCrop.width - newCrop.x
                newCrop.height = Math.max(minSize, Math.min(imageSize.height - newCrop.y, startCrop.height + deltaY))
            } else if (corner === 'ne') {
                newCrop.y = Math.max(0, Math.min(startCrop.y + deltaY, startCrop.y + startCrop.height - minSize))
                newCrop.width = Math.max(minSize, Math.min(imageSize.width - newCrop.x, startCrop.width + deltaX))
                newCrop.height = startCrop.y + startCrop.height - newCrop.y
            } else if (corner === 'nw') {
                newCrop.x = Math.max(0, Math.min(startCrop.x + deltaX, startCrop.x + startCrop.width - minSize))
                newCrop.y = Math.max(0, Math.min(startCrop.y + deltaY, startCrop.y + startCrop.height - minSize))
                newCrop.width = startCrop.x + startCrop.width - newCrop.x
                newCrop.height = startCrop.y + startCrop.height - newCrop.y
            }

            setCropArea(newCrop)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }, [cropArea, imageSize])

    const handleCropConfirm = useCallback(async () => {
        if (!imageToCrop || !pendingImageFile.current) return

        setIsCropping(true)
        try {
            // Calculate actual crop coordinates based on original image dimensions
            const img = await createImage(imageToCrop)
            const scaleX = img.width / imageSize.width
            const scaleY = img.height / imageSize.height

            const actualCropArea = {
                x: cropArea.x * scaleX,
                y: cropArea.y * scaleY,
                width: cropArea.width * scaleX,
                height: cropArea.height * scaleY,
            }

            const croppedImageUrl = await cropImage(imageToCrop, actualCropArea, rotation)

            if (!croppedImageUrl) {
                message.error('Failed to crop image')
                setIsCropping(false)
                return
            }

            // Add watermark to the cropped image
            const watermarkedImageUrl = await addWatermark(croppedImageUrl)

            if (!watermarkedImageUrl) {
                message.error('Failed to add watermark')
                setIsCropping(false)
                return
            }

            const currentList = fileListRef.current
            const newFile: MediaUploadFile = {
                uid: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                name: cropFileName,
                status: 'done',
                url: watermarkedImageUrl,
                thumbUrl: watermarkedImageUrl,
                type: 'image/jpeg',
                isVideo: false,
                originFileObj: pendingImageFile.current as RcFile,
            }

            const nextList = [...currentList, newFile]
            setFileList(nextList)
            fileListRef.current = nextList
            emitChange(nextList)

            setCropModalVisible(false)
            setImageToCrop('')
            setCropFileName('')
            setCropArea({ x: 0, y: 0, width: 200, height: 200 })
            setImageSize({ width: 0, height: 0 })
            setZoom(1)
            setRotation(0)
            pendingImageFile.current = null

            message.success('Image cropped and added successfully')
        } catch (error) {
            console.error('Crop error:', error)
            message.error('Failed to crop image')
        } finally {
            setIsCropping(false)
        }
    }, [imageToCrop, cropArea, rotation, cropFileName, imageSize, emitChange])

    const handleCropCancel = useCallback(() => {
        setCropModalVisible(false)
        setImageToCrop('')
        setCropFileName('')
        setCropArea({ x: 0, y: 0, width: 200, height: 200 })
        setImageSize({ width: 0, height: 0 })
        setZoom(1)
        setRotation(0)
        pendingImageFile.current = null
    }, [])

    const handlePreview = useCallback((file: UploadFile) => {
        const mediaFile = file as MediaUploadFile
        const url = mediaFile.url || mediaFile.thumbUrl || ''
        if (!url) return

        const isVideo = mediaFile.isVideo ?? isVideoUrl(url)
        setPreviewUrl(url)
        setPreviewTitle(mediaFile.name || (isVideo ? 'Product video' : 'Product image'))
        setPreviewIsVideo(isVideo)
        setPreviewEmbedUrl(isVideo ? getVideoEmbedUrl(url) : null)
        setPreviewVisible(true)
    }, [])

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items
            if (!items) return

            const files: File[] = []
            for (let i = 0; i < items.length; i += 1) {
                const item = items[i]
                if (item.kind === 'file' && (item.type.startsWith('image/') || item.type.startsWith('video/'))) {
                    const file = item.getAsFile()
                    if (file) {
                        files.push(file)
                    }
                }
            }

            if (files.length) {
                event.preventDefault()
                void handleAddFiles(files)
            }
        }

        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [handleAddFiles])

    const imageCount = useMemo(
        () => fileList.filter(file => !file.isVideo).length,
        [fileList],
    )
    const videoCount = useMemo(
        () => fileList.filter(file => file.isVideo).length,
        [fileList],
    )

    const canAddMore = imageCount < MAX_IMAGES || videoCount < MAX_VIDEOS

    const uploadButton = (
        <div className={styles.uploadButton}>
            <PlusOutlined className={styles.uploadButtonIcon} />
            <span className={styles.uploadButtonText}>Upload</span>
            <span className={styles.uploadButtonHint}>Drag, click or paste</span>
        </div>
    )

    return (
        <div className={styles.imageUploadContainer}>
            <div
                ref={containerRef}
                className={`${styles.picturesWallWrapper} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <Upload
                    accept="image/*,video/*"
                    multiple
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={handleBeforeUpload}
                    onPreview={handlePreview}
                    onRemove={handleRemove}
                    className={styles.picturesWallUpload}
                >
                    {canAddMore ? uploadButton : null}
                </Upload>

                <div className={styles.instructions}>
                    Drag &amp; drop images or videos, click <strong>Upload</strong>, or paste with{' '}
                    <strong>⌘V / Ctrl+V</strong>.
                </div>

                <div className={styles.countSummary}>
                    Images {imageCount}/{MAX_IMAGES} • Video {videoCount}/{MAX_VIDEOS}
                </div>
            </div>

            <div className={styles.controlsRow}>
                <Button
                    icon={<LinkOutlined />}
                    onClick={handleManualUrlAdd}
                    disabled={!canAddMore}
                >
                    Add Media URL
                </Button>
            </div>

            <div className={styles.uploadRequirements}>
                <div>📸 Max {MAX_IMAGES} images (1MB each)</div>
                <div>🎥 Max {MAX_VIDEOS} video (50MB, MP4/WebM/MOV or YouTube/Vimeo URL)</div>
            </div>

            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                centered
                width={previewIsVideo ? 720 : 600}
                destroyOnClose
            >
                {previewIsVideo ? (
                    previewEmbedUrl ? (
                        <iframe
                            src={previewEmbedUrl}
                            title={previewTitle}
                            width="100%"
                            height="360"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ border: 0, borderRadius: 8 }}
                        />
                    ) : (
                        <video
                            controls
                            src={previewUrl}
                            style={{ width: '100%', borderRadius: 8, maxHeight: 420 }}
                        />
                    )
                ) : (
                    <NextImage
                        src={previewUrl}
                        alt={previewTitle}
                        width={1200}
                        height={800}
                        unoptimized
                        style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                    />
                )}
            </Modal>

            {/* Crop Modal */}
            <Modal
                open={cropModalVisible}
                title={`Crop Image: ${cropFileName}`}
                onCancel={handleCropCancel}
                footer={[
                    <Button key="cancel" onClick={handleCropCancel}>
                        Cancel
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        icon={<CheckOutlined />}
                        loading={isCropping}
                        onClick={handleCropConfirm}
                    >
                        Confirm Crop
                    </Button>,
                ]}
                centered
                width={700}
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <div
                        ref={imageContainerRef}
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: 400,
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            borderRadius: 8,
                            marginBottom: 16,
                        }}
                        onMouseMove={handleCropMouseMove}
                        onMouseUp={handleCropMouseUp}
                        onMouseLeave={handleCropMouseUp}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageToCrop}
                            alt="Crop preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDraggingCrop ? 'none' : 'transform 0.1s',
                            }}
                        />
                        {/* Crop overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                clipPath: `polygon(
                                    0% 0%,
                                    0% 100%,
                                    ${(cropArea.x / imageSize.width) * 100}% 100%,
                                    ${(cropArea.x / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                                    ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${(cropArea.y / imageSize.height) * 100}%,
                                    ${((cropArea.x + cropArea.width) / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                                    ${(cropArea.x / imageSize.width) * 100}% ${((cropArea.y + cropArea.height) / imageSize.height) * 100}%,
                                    ${(cropArea.x / imageSize.width) * 100}% 100%,
                                    100% 100%,
                                    100% 0%
                                )`,
                            }}
                        />
                        {/* Crop box */}
                        {imageSize.width > 0 && (
                            <div
                                ref={cropBoxRef}
                                style={{
                                    position: 'absolute',
                                    left: `${(cropArea.x / imageSize.width) * 100}%`,
                                    top: `${(cropArea.y / imageSize.height) * 100}%`,
                                    width: `${(cropArea.width / imageSize.width) * 100}%`,
                                    height: `${(cropArea.height / imageSize.height) * 100}%`,
                                    border: '2px solid #1890ff',
                                    cursor: isDraggingCrop ? 'grabbing' : 'grab',
                                    boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
                                }}
                                onMouseDown={handleCropMouseDown}
                            >
                                {/* Resize handles */}
                                {['nw', 'ne', 'sw', 'se'].map((corner) => (
                                    <div
                                        key={corner}
                                        style={{
                                            position: 'absolute',
                                            width: 12,
                                            height: 12,
                                            background: '#1890ff',
                                            border: '2px solid #fff',
                                            borderRadius: '50%',
                                            cursor: `${corner}-resize`,
                                            [corner.includes('n') ? 'top' : 'bottom']: -6,
                                            [corner.includes('w') ? 'left' : 'right']: -6,
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation()
                                            handleCropResize(e, corner as 'nw' | 'ne' | 'sw' | 'se')
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <div>
                            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                                Zoom: {Math.round(zoom * 100)}%
                            </div>
                            <Slider
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={setZoom}
                                marks={{
                                    0.5: '50%',
                                    1: '100%',
                                    2: '200%',
                                    3: '300%',
                                }}
                            />
                        </div>

                        <Space>
                            <Button
                                icon={<RotateLeftOutlined />}
                                onClick={() => setRotation((prev) => (prev - 90) % 360)}
                            >
                                Rotate Left
                            </Button>
                            <Button
                                icon={<RotateRightOutlined />}
                                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                            >
                                Rotate Right
                            </Button>
                            <Button
                                icon={<ZoomOutOutlined />}
                                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}
                            >
                                Zoom Out
                            </Button>
                            <Button
                                icon={<ZoomInOutlined />}
                                onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                            >
                                Zoom In
                            </Button>
                        </Space>
                    </Space>
                </div>
            </Modal>
        </div>
    )
}

