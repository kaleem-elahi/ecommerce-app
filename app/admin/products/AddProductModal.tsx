'use client'

import { Product as ProductType } from '@/lib/supabase'
import { Button, Form, Input, InputNumber, Modal, Select, Switch, message } from 'antd'
import { useEffect, useState } from 'react'
import { ImageUpload } from './ImageUpload'
import {
    CLARITY_OPTIONS_CABOCHON,
    CLARITY_OPTIONS_FACETED,
    COLOR_OPTIONS,
    CUT_OPTIONS,
    GRADE_OPTIONS,
    MATERIALS_OPTIONS,
    ORIGIN_OPTIONS,
    SHAPE_OPTIONS,
    TAGS_OPTIONS,
} from './productOptions'

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
    shape?: string
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
    const [requirementsModalOpen, setRequirementsModalOpen] = useState(false)
    const isEditMode = !!product
    const selectedCut = Form.useWatch('cut', form)

    // State to track custom options for each field
    const [customColors, setCustomColors] = useState<string[]>([])
    const [customClarities, setCustomClarities] = useState<string[]>([])
    const [customOrigins, setCustomOrigins] = useState<string[]>([])
    const [customCuts, setCustomCuts] = useState<string[]>([])
    const [customShapes, setCustomShapes] = useState<string[]>([])
    const [customGrades, setCustomGrades] = useState<string[]>([])
    const [customMaterials, setCustomMaterials] = useState<string[]>([])
    const [customTags, setCustomTags] = useState<string[]>([])

    // State to track search values for Enter key handling
    const [searchValues, setSearchValues] = useState<Record<string, string>>({})

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

                // Extract custom values that aren't in base options
                if (product.color && !COLOR_OPTIONS.includes(product.color)) {
                    setCustomColors([product.color])
                }
                if (product.clarity && !CLARITY_OPTIONS_FACETED.includes(product.clarity) && !CLARITY_OPTIONS_CABOCHON.includes(product.clarity)) {
                    setCustomClarities([product.clarity])
                }
                if (product.origin && !ORIGIN_OPTIONS.includes(product.origin)) {
                    setCustomOrigins([product.origin])
                }
                if (product.cut && !CUT_OPTIONS.includes(product.cut)) {
                    setCustomCuts([product.cut])
                }
                if (product.grade && !GRADE_OPTIONS.includes(product.grade)) {
                    setCustomGrades([product.grade])
                }
                const shapeValue = (product as any).shape || product.metadata?.shape
                if (shapeValue && !SHAPE_OPTIONS.includes(shapeValue)) {
                    setCustomShapes([shapeValue])
                }
                // Handle materials and tags
                if (product.materials && Array.isArray(product.materials)) {
                    const customMats = product.materials.filter(m => !MATERIALS_OPTIONS.includes(m))
                    if (customMats.length > 0) {
                        setCustomMaterials(customMats)
                    }
                }
                if (product.tags && Array.isArray(product.tags)) {
                    const customTagsList = product.tags.filter(t => !TAGS_OPTIONS.includes(t))
                    if (customTagsList.length > 0) {
                        setCustomTags(customTagsList)
                    }
                }

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
                    shape: shapeValue,
                    grade: product.grade,
                    featured: product.featured || false,
                    status: product.status || 'active',
                    images: productImages, // Contains both images and videos
                    materials: product.materials || [],
                    tags: product.tags || [],
                })
            } else {
                // Add mode: reset form
                form.resetFields()
            }
            // Reset custom options and search values
            setCustomColors([])
            setCustomClarities([])
            setCustomOrigins([])
            setCustomCuts([])
            setCustomShapes([])
            setCustomGrades([])
            setCustomMaterials([])
            setCustomTags([])
            setSearchValues({})
        }
    }, [open, form, product])

    const handleSubmit = async (values: ProductFormValues) => {
        setLoading(true)
        try {
            console.log('handleSubmit - form values:', values)
            console.log('handleSubmit - images from form:', values.images)

            // Images come from form values
            const formData = {
                ...values,
                tags: values.tags || [],
                materials: values.materials || [],
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
        // Reset custom options and search values
        setCustomColors([])
        setCustomClarities([])
        setCustomOrigins([])
        setCustomCuts([])
        setCustomShapes([])
        setCustomGrades([])
        setCustomMaterials([])
        setCustomTags([])
        setSearchValues({})
        onCancel()
    }

    // Determine clarity options based on cut type
    const getClarityOptions = () => {
        let baseOptions: string[] = []
        if (!selectedCut) {
            baseOptions = [...CLARITY_OPTIONS_FACETED, ...CLARITY_OPTIONS_CABOCHON]
        } else if (selectedCut === 'Faceted') {
            baseOptions = CLARITY_OPTIONS_FACETED
        } else if (selectedCut === 'Cabochon' || selectedCut === 'Raw / Rough' || selectedCut === 'Tumbled' || selectedCut === 'Carved') {
            baseOptions = CLARITY_OPTIONS_CABOCHON
        } else {
            baseOptions = [...CLARITY_OPTIONS_FACETED, ...CLARITY_OPTIONS_CABOCHON]
        }
        return [...baseOptions, ...customClarities]
    }

    // Helper function to handle custom value addition for single-select fields
    const handleCustomValue = (
        value: string,
        setCustomOptions: (options: string[]) => void,
        currentCustomOptions: string[],
        baseOptions: string[]
    ) => {
        if (value && !baseOptions.includes(value) && !currentCustomOptions.includes(value)) {
            setCustomOptions([...currentCustomOptions, value])
        }
    }

    // Helper function to create options array with custom values
    const createOptions = (baseOptions: string[], customOptions: string[]) => {
        const allOptions = [...baseOptions, ...customOptions]
        return allOptions.map(opt => ({ label: opt, value: opt }))
    }

    // Handler for Enter key to add custom values in single-select fields
    const handleKeyDown = (
        e: React.KeyboardEvent,
        fieldName: string,
        setCustomOptions: (options: string[]) => void,
        currentCustomOptions: string[],
        baseOptions: string[]
    ) => {
        if (e.key === 'Enter') {
            const searchValue = searchValues[fieldName]
            if (searchValue && searchValue.trim()) {
                const trimmedValue = searchValue.trim()
                if (!baseOptions.includes(trimmedValue) && !currentCustomOptions.includes(trimmedValue)) {
                    setCustomOptions([...currentCustomOptions, trimmedValue])
                    // Set the form value
                    form.setFieldValue(fieldName, trimmedValue)
                    // Clear search value
                    setSearchValues({ ...searchValues, [fieldName]: '' })
                }
                e.preventDefault()
            }
        }
    }

    // Handler to track search values
    const handleSearch = (fieldName: string, value: string) => {
        setSearchValues({ ...searchValues, [fieldName]: value })
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
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type color (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={createOptions(COLOR_OPTIONS, customColors)}
                                onSearch={(value) => handleSearch('color', value)}
                                onSelect={(value) => {
                                    handleCustomValue(value, setCustomColors, customColors, COLOR_OPTIONS)
                                    setSearchValues({ ...searchValues, color: '' })
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'color', setCustomColors, customColors, COLOR_OPTIONS)}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="cut"
                            label="Cut"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type cut (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={createOptions(CUT_OPTIONS, customCuts)}
                                onSearch={(value) => handleSearch('cut', value)}
                                onSelect={(value) => {
                                    handleCustomValue(value, setCustomCuts, customCuts, CUT_OPTIONS)
                                    setSearchValues({ ...searchValues, cut: '' })
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'cut', setCustomCuts, customCuts, CUT_OPTIONS)}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="clarity"
                            label="Clarity"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type clarity (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={getClarityOptions().map(clarity => ({ label: clarity, value: clarity }))}
                                onSearch={(value) => handleSearch('clarity', value)}
                                onSelect={(value) => {
                                    const baseClarities = getClarityOptions().filter(c => !customClarities.includes(c))
                                    handleCustomValue(value, setCustomClarities, customClarities, baseClarities)
                                    setSearchValues({ ...searchValues, clarity: '' })
                                }}
                                onKeyDown={(e) => {
                                    const baseClarities = getClarityOptions().filter(c => !customClarities.includes(c))
                                    handleKeyDown(e, 'clarity', setCustomClarities, customClarities, baseClarities)
                                }}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="origin"
                            label="Origin"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type origin (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={createOptions(ORIGIN_OPTIONS, customOrigins)}
                                onSearch={(value) => handleSearch('origin', value)}
                                onSelect={(value) => {
                                    handleCustomValue(value, setCustomOrigins, customOrigins, ORIGIN_OPTIONS)
                                    setSearchValues({ ...searchValues, origin: '' })
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'origin', setCustomOrigins, customOrigins, ORIGIN_OPTIONS)}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="grade"
                            label="Grade"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type grade (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={createOptions(GRADE_OPTIONS, customGrades)}
                                onSearch={(value) => handleSearch('grade', value)}
                                onSelect={(value) => {
                                    handleCustomValue(value, setCustomGrades, customGrades, GRADE_OPTIONS)
                                    setSearchValues({ ...searchValues, grade: '' })
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'grade', setCustomGrades, customGrades, GRADE_OPTIONS)}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="shape"
                            label="Shape"
                            style={{ flex: 1, minWidth: 150 }}
                        >
                            <Select
                                showSearch
                                size="small"
                                placeholder="Select or type shape (press Enter)"
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={createOptions(SHAPE_OPTIONS, customShapes)}
                                onSearch={(value) => handleSearch('shape', value)}
                                onSelect={(value) => {
                                    handleCustomValue(value, setCustomShapes, customShapes, SHAPE_OPTIONS)
                                    setSearchValues({ ...searchValues, shape: '' })
                                }}
                                onKeyDown={(e) => handleKeyDown(e, 'shape', setCustomShapes, customShapes, SHAPE_OPTIONS)}
                                allowClear
                                notFoundContent={null}
                            />
                        </Form.Item>
                    </div>
                </div>

                {/* Materials & Tags */}
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Materials & Classification</h3>

                    <Form.Item
                        name="materials"
                        label="Materials"
                        tooltip="Select one or more materials or type to add custom"
                    >
                        <Select
                            mode="tags"
                            showSearch
                            size="small"
                            placeholder="Select or type materials"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={createOptions(MATERIALS_OPTIONS, customMaterials)}
                            tokenSeparators={[',']}
                            onSelect={(value) => {
                                if (typeof value === 'string' && !MATERIALS_OPTIONS.includes(value) && !customMaterials.includes(value)) {
                                    setCustomMaterials([...customMaterials, value])
                                }
                            }}
                            allowClear
                            notFoundContent={null}
                        />
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="Tags"
                        tooltip="Select one or more tags or type to add custom"
                    >
                        <Select
                            mode="tags"
                            showSearch
                            size="small"
                            placeholder="Select or type tags"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={createOptions(TAGS_OPTIONS, customTags)}
                            tokenSeparators={[',']}
                            onSelect={(value) => {
                                if (typeof value === 'string' && !TAGS_OPTIONS.includes(value) && !customTags.includes(value)) {
                                    setCustomTags([...customTags, value])
                                }
                            }}
                            allowClear
                            notFoundContent={null}
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
