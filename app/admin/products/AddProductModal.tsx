'use client'

import { Product as ProductType } from '@/lib/supabase'
import { Button, Form, Input, InputNumber, Modal, Select, Switch, message } from 'antd'
import { useEffect, useState } from 'react'
import { ImageUpload } from './ImageUpload'

const { Option } = Select
const { TextArea } = Input

interface AddProductModalProps {
    open: boolean
    onCancel: () => void
    onSuccess: () => void
    product?: ProductType | null // For edit mode
}

interface ProductFormValues {
    sku?: string
    name: string
    slug?: string
    category?: string
    subcategory?: string
    description?: string
    price: number
    currency?: string
    stock?: number
    weightGrams?: number
    dimensions?: {
        length_mm?: number
        width_mm?: number
        height_mm?: number
    }
    color?: string
    clarity?: string
    origin?: string
    cut?: string
    grade?: string
    materials?: string[]
    tags?: string[]
    images?: string[]  // Contains both images and videos
    featured?: boolean
    status?: string
}

export function AddProductModal({ open, onCancel, onSuccess, product }: AddProductModalProps) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [tagsInput, setTagsInput] = useState('')
    const [materialsInput, setMaterialsInput] = useState('')
    const [requirementsModalOpen, setRequirementsModalOpen] = useState(false)
    const isEditMode = !!product

    useEffect(() => {
        if (open) {
            if (product) {
                // Edit mode: populate form with existing product data
                // Process images first
                let productImages: string[] = []
                if (product.images && Array.isArray(product.images)) {
                    productImages = product.images.filter((img: any) => img && typeof img === 'string' && img.trim().length > 0)
                }

                console.log('Setting form fields including images:', productImages)

                form.setFieldsValue({
                    name: product.name,
                    sku: product.sku,
                    slug: product.slug,
                    category: product.category,
                    subcategory: product.subcategory,
                    description: product.description,
                    price: product.price,
                    currency: product.currency || 'USD',
                    stock: product.stock || 0,
                    weightGrams: product.weightGrams,
                    dimensions: product.dimensions,
                    color: product.color,
                    clarity: product.clarity,
                    origin: product.origin,
                    cut: product.cut,
                    grade: product.grade,
                    featured: product.featured || false,
                    status: product.status || 'active',
                    images: productImages, // Contains both images and videos
                })
                setTagsInput(product.tags?.join(', ') || '')
                setMaterialsInput(product.materials?.join(', ') || '')
            } else {
                // Add mode: reset form
                form.resetFields()
                setTagsInput('')
                setMaterialsInput('')
            }
        }
    }, [open, form, product])

    const handleSubmit = async (values: ProductFormValues) => {
        setLoading(true)
        try {
            console.log('handleSubmit - form values:', values)
            console.log('handleSubmit - images from form:', values.images)

            // Parse tags and materials from comma-separated strings
            // Images come from form values
            const formData = {
                ...values,
                tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [],
                materials: materialsInput ? materialsInput.split(',').map(m => m.trim()).filter(m => m) : [],
                images: values.images && values.images.length > 0 ? values.images : [],
            }

            const url = isEditMode
                ? `/api/admin/products/${product!.id}`
                : '/api/admin/products'
            const method = isEditMode ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                message.success(isEditMode ? 'Product updated successfully!' : 'Product added successfully!')
                form.resetFields()
                onSuccess()
                onCancel()
            } else {
                message.error(data.error || `Failed to ${isEditMode ? 'update' : 'add'} product`)
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error)
            message.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        setTagsInput('')
        setMaterialsInput('')
        onCancel()
    }

    return (
        <Modal
            title={isEditMode ? "Edit Product" : "Add New Product"}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={900}
            style={{ top: 20 }}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    currency: 'USD',
                    stock: 0,
                    featured: false,
                    status: 'active',
                }}
                style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}
            >
                {/* Images */}
                <div style={{ marginBottom: 16 }}>
                    <Form.Item
                        name="images"
                        label={
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>Product Media (Images & Video)</span>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setRequirementsModalOpen(true)}
                                    style={{
                                        padding: 0,
                                        height: 'auto',
                                        fontSize: 12,
                                        color: '#8F61DB'
                                    }}
                                >
                                    📋 Know Requirements
                                </Button>
                            </div>
                        }
                        rules={[
                            {
                                validator: (_, value) => {
                                    console.log('Form validator - checking images:', value)
                                    if (!value || value.length === 0) {
                                        return Promise.reject('Please add at least one image')
                                    }
                                    return Promise.resolve()
                                }
                            }
                        ]}
                        trigger="onChange"
                        valuePropName="value"
                    >
                        <ImageUpload />
                    </Form.Item>
                </div>

                {/* Basic Information */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Basic Information</h3>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="name"
                            label="Product Name"
                            rules={[{ required: true, message: 'Please enter product name' }]}
                            style={{ flex: 2 }}
                        >
                            <Input placeholder="Enter product name" />
                        </Form.Item>

                        <Form.Item
                            name="sku"
                            label="SKU"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="Stock keeping unit" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="slug"
                        label="Slug (URL-friendly name)"
                        tooltip="Auto-generated from name if left empty"
                    >
                        <Input placeholder="product-slug" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter product description"
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="category"
                            label="Category"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="e.g., jewelry, stones" />
                        </Form.Item>

                        <Form.Item
                            name="subcategory"
                            label="Subcategory"
                            style={{ flex: 1 }}
                        >
                            <Input placeholder="e.g., rings, necklaces" />
                        </Form.Item>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Pricing & Stock</h3>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="price"
                            label="Price"
                            rules={[
                                { required: true, message: 'Please enter price' },
                                { type: 'number', min: 0, message: 'Price must be positive' },
                            ]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0.00"
                                min={0}
                                step={0.01}
                                precision={2}
                            />
                        </Form.Item>

                        <Form.Item
                            name="currency"
                            label="Currency"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Option value="USD">USD ($)</Option>
                                <Option value="INR">INR (₹)</Option>
                                <Option value="EUR">EUR (€)</Option>
                                <Option value="GBP">GBP (£)</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Stock Quantity"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0"
                                min={0}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Physical Attributes */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Physical Attributes</h3>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="weightGrams"
                            label="Weight (grams)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0.000"
                                min={0}
                                step={0.001}
                                precision={3}
                            />
                        </Form.Item>

                        <Form.Item
                            name={['dimensions', 'length_mm']}
                            label="Length (mm)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0"
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item
                            name={['dimensions', 'width_mm']}
                            label="Width (mm)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0"
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item
                            name={['dimensions', 'height_mm']}
                            label="Height (mm)"
                            style={{ flex: 1 }}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="0"
                                min={0}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Gemstone/Stone Attributes */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Gemstone Attributes</h3>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Form.Item
                            name="color"
                            label="Color"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Input placeholder="e.g., Red, Blue, Green" />
                        </Form.Item>

                        <Form.Item
                            name="clarity"
                            label="Clarity"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Input placeholder="e.g., VVS1, VS2" />
                        </Form.Item>

                        <Form.Item
                            name="origin"
                            label="Origin"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Input placeholder="e.g., Yemen, India" />
                        </Form.Item>

                        <Form.Item
                            name="cut"
                            label="Cut"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Input placeholder="e.g., Round, Oval, Princess" />
                        </Form.Item>

                        <Form.Item
                            name="grade"
                            label="Grade"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Input placeholder="e.g., A, AA, AAA" />
                        </Form.Item>
                    </div>
                </div>

                {/* Materials & Tags */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Materials & Classification</h3>

                    <Form.Item
                        label="Materials (comma-separated)"
                        tooltip="e.g., agate, gemstone, silver"
                    >
                        <Input
                            value={materialsInput}
                            onChange={(e) => setMaterialsInput(e.target.value)}
                            placeholder="agate, gemstone, silver"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tags (comma-separated)"
                        tooltip="e.g., premium, handmade, islamic"
                    >
                        <Input
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="premium, handmade, islamic"
                        />
                    </Form.Item>
                </div>

                {/* Status & Settings */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Status & Settings</h3>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="status"
                            label="Status"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="draft">Draft</Option>
                                <Option value="archived">Archived</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="featured"
                            label="Featured"
                            valuePropName="checked"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: 32 }}
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {isEditMode ? 'Update Product' : 'Add Product'}
                        </Button>
                    </div>
                </Form.Item>
            </Form>

            {/* Image Requirements Modal */}
            <Modal
                title="📸 Image Upload Requirements"
                open={requirementsModalOpen}
                onCancel={() => setRequirementsModalOpen(false)}
                footer={
                    <Button type="primary" onClick={() => setRequirementsModalOpen(false)}>
                        Got it!
                    </Button>
                }
                width={700}
            >
                <div style={{ lineHeight: 1.8 }}>
                    <div style={{
                        background: '#f0f7ff',
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 20,
                        border: '1px solid #bae0ff'
                    }}>
                        <h4 style={{ marginTop: 0, color: '#0958d9' }}>📐 Media Specifications</h4>
                        <div style={{ marginBottom: 12 }}>
                            <strong>Images:</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: 20, marginTop: 4 }}>
                                <li><strong>Quantity:</strong> Maximum 4 images per product</li>
                                <li><strong>Aspect Ratio:</strong> Any aspect ratio is allowed (square, portrait, or landscape)</li>
                                <li><strong>File Size:</strong> Maximum 1MB per image</li>
                                <li><strong>Format:</strong> JPG, PNG, WebP, or GIF</li>
                            </ul>
                        </div>
                        <div>
                            <strong>Video (Optional):</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: 20, marginTop: 4 }}>
                                <li><strong>Quantity:</strong> 1 video per product</li>
                                <li><strong>File Size:</strong> Maximum 50MB</li>
                                <li><strong>Format:</strong> MP4, WebM, MOV</li>
                                <li><strong>Alternative:</strong> You can also add YouTube or Vimeo URLs</li>
                            </ul>
                        </div>
                    </div>

                    <h4 style={{ marginTop: 0 }}>✨ Best Practices for Product Photos</h4>

                    <div style={{ marginBottom: 16 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 12,
                            background: '#f6ffed',
                            borderRadius: 8,
                            marginBottom: 12,
                            border: '1px solid #b7eb8f'
                        }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <strong>Take photos from a little distance</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                    Ensure the whole product is visible with some empty space around it. This creates a professional look and prevents cropping issues.
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 12,
                            background: '#f6ffed',
                            borderRadius: 8,
                            marginBottom: 12,
                            border: '1px solid #b7eb8f'
                        }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <strong>Keep a little breathing room around the product</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                    Whether your photo is portrait, landscape, or square, leave space around the product so it still looks great if a thumbnail crops the edges.
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 12,
                            background: '#fff7e6',
                            borderRadius: 8,
                            marginBottom: 12,
                            border: '1px solid #ffd591'
                        }}>
                            <span style={{ fontSize: 20 }}>⚠️</span>
                            <div>
                                <strong>Preview rectangular photos before publishing</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                    Some storefront layouts automatically crop to square thumbnails. Double-check the preview to ensure the most important details stay visible.
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 12,
                            background: '#f6ffed',
                            borderRadius: 8,
                            marginBottom: 12,
                            border: '1px solid #b7eb8f'
                        }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <strong>Use high-resolution images</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                    Upload high-quality images to ensure they look sharp and clear. The final thumbnail will be generated from your original photo, so quality matters!
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: 12,
                            background: '#f6ffed',
                            borderRadius: 8,
                            border: '1px solid #b7eb8f'
                        }}>
                            <span style={{ fontSize: 20 }}>✅</span>
                            <div>
                                <strong>Use good lighting and clean background</strong>
                                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                                    Natural lighting or soft white light works best. A clean, neutral background helps your product stand out.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: '#fffbe6',
                        padding: 16,
                        borderRadius: 8,
                        border: '1px solid #ffe58f',
                        marginTop: 20
                    }}>
                        <h4 style={{ marginTop: 0, color: '#d48806' }}>💡 Pro Tips</h4>

                        <div style={{ marginBottom: 12 }}>
                            <strong>Optional editing tools:</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: 20, marginTop: 4 }}>
                                <li><a href="https://www.canva.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>Canva.com</a> (crop, resize, and enhance photos)</li>
                                <li><a href="https://www.photopea.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>Photopea.com</a> (free Photoshop alternative)</li>
                                <li><a href="https://www.iloveimg.com/crop-image" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>iloveimg.com/crop-image</a> (quick crop tool)</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <strong>🗜️ To compress & resize images (reduce file size):</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: 20, marginTop: 4 }}>
                                <li><a href="https://image.pi7.org/resize-image-pixel" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>Pi7 Image Tool</a> - Resize pixels & compress to specific KB</li>
                                <li><a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>TinyPNG.com</a> - Smart PNG & JPEG compression</li>
                                <li><a href="https://squoosh.app" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>Squoosh.app</a> - Google&apos;s image compressor</li>
                            </ul>
                        </div>

                        <div>
                            <strong>🎥 To compress product videos (for social media/presentations):</strong>
                            <ul style={{ marginBottom: 0, paddingLeft: 20, marginTop: 4 }}>
                                <li><a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>FreeConvert.com</a> - Free video compressor</li>
                                <li><a href="https://clideo.com/compress-video" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>Clideo.com</a> - Online video compression</li>
                                <li><a href="https://www.videosmaller.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>VideoSmaller.com</a> - Reduce video file size</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Modal>
        </Modal>
    )
}
