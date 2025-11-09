'use client'

import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { Button, Modal, Upload, message } from 'antd'
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

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [fileList, setFileList] = useState<MediaUploadFile[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewTitle, setPreviewTitle] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const [previewIsVideo, setPreviewIsVideo] = useState(false)
    const [previewEmbedUrl, setPreviewEmbedUrl] = useState<string | null>(null)

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
                thumbUrl: isVideoFile ? VIDEO_PLACEHOLDER : dataUrl,
                type: file.type,
                isVideo: isVideoFile,
                originFileObj: file,
            })

            if (isVideoFile) {
                videoCount += 1
            } else {
                imageCount += 1
            }
        }

        if (!additions.length) return

        const nextList = [...currentList, ...additions]
        setFileList(nextList)
        fileListRef.current = nextList
        emitChange(nextList)

        const addedImages = additions.filter(item => !item.isVideo).length
        const addedVideos = additions.filter(item => item.isVideo).length
        const parts: string[] = []
        if (addedImages) parts.push(`${addedImages} image${addedImages > 1 ? 's' : ''}`)
        if (addedVideos) parts.push(`${addedVideos} video${addedVideos > 1 ? 's' : ''}`)
        message.success(`Added ${parts.join(' and ')}`)
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
        </div>
    )
}

