'use client'

import { Button, Form, Input, InputNumber, Modal, Switch, message } from 'antd'
import { useEffect, useState } from 'react'

interface AddProductModalProps {
    open: boolean
    onCancel: () => void
    onSuccess: () => void
}

interface ProductFormValues {
    name: string
    description?: string
    price: number
    originalPrice?: number
    discount?: number
    imageUrl: string
    rating?: number
    reviewCount?: number
    freeDelivery?: boolean
    starSeller?: boolean
    dispatchedFrom?: string
    category?: string
}

export function AddProductModal({ open, onCancel, onSuccess }: AddProductModalProps) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            form.resetFields()
        }
    }, [open, form])

    const handleSubmit = async (values: ProductFormValues) => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (response.ok) {
                message.success('Product added successfully!')
                form.resetFields()
                onSuccess()
                onCancel()
            } else {
                message.error(data.error || 'Failed to add product')
            }
        } catch (error) {
            console.error('Error adding product:', error)
            message.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            title="Add New Product"
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    rating: 0,
                    reviewCount: 0,
                    freeDelivery: false,
                    starSeller: false,
                }}
            >
                <Form.Item
                    name="name"
                    label="Product Name"
                    rules={[{ required: true, message: 'Please enter product name' }]}
                >
                    <Input placeholder="Enter product name" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Enter product description"
                    />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="price"
                        label="Price (₹)"
                        rules={[
                            { required: true, message: 'Please enter price' },
                            { type: 'number', min: 0, message: 'Price must be positive' },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0.00"
                            prefix="₹"
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>

                    <Form.Item
                        name="originalPrice"
                        label="Original Price (₹)"
                        rules={[
                            { type: 'number', min: 0, message: 'Price must be positive' },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0.00"
                            prefix="₹"
                            min={0}
                            step={0.01}
                        />
                    </Form.Item>

                    <Form.Item
                        name="discount"
                        label="Discount (%)"
                        rules={[
                            { type: 'number', min: 0, max: 100, message: 'Discount must be between 0-100' },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                            max={100}
                            suffix="%"
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="imageUrl"
                    label="Image URL"
                    rules={[
                        { required: true, message: 'Please enter image URL' },
                        { type: 'url', message: 'Please enter a valid URL' },
                    ]}
                >
                    <Input placeholder="https://example.com/image.jpg" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="rating"
                        label="Rating"
                        rules={[
                            { type: 'number', min: 0, max: 5, message: 'Rating must be between 0-5' },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0.0"
                            min={0}
                            max={5}
                            step={0.1}
                        />
                    </Form.Item>

                    <Form.Item
                        name="reviewCount"
                        label="Review Count"
                        rules={[
                            { type: 'number', min: 0, message: 'Review count must be positive' },
                        ]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="0"
                            min={0}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="category"
                        label="Category"
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="e.g., jewelry, stones, home-decor" />
                    </Form.Item>

                    <Form.Item
                        name="dispatchedFrom"
                        label="Dispatched From"
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="e.g., India, USA" />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="freeDelivery"
                        label="Free Delivery"
                        valuePropName="checked"
                        style={{ flex: 1 }}
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        name="starSeller"
                        label="Star Seller"
                        valuePropName="checked"
                        style={{ flex: 1 }}
                    >
                        <Switch />
                    </Form.Item>
                </div>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Add Product
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    )
}

