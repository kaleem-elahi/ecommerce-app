'use client'

import { Product } from '@/lib/supabase'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Image, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { AddProductModal } from './AddProductModal'
import styles from './products.module.css'

const { Title } = Typography

interface ProductsTableProps {
    products: Product[]
    onRefresh?: () => void
}

export function ProductsTable({ products, onRefresh }: ProductsTableProps) {
    const [modalOpen, setModalOpen] = useState(false)

    const columns: ColumnsType<Product> = [
        {
            title: 'Image',
            key: 'image',
            width: 100,
            render: (_: any, record: Product) => {
                const imageUrl = record.images && record.images.length > 0
                    ? record.images[0]
                    : null
                return imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={record.name}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                ) : (
                    <div style={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        color: '#999'
                    }}>
                        No Image
                    </div>
                )
            },
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 120,
            render: (sku: string) => sku || <span style={{ color: '#999' }}>N/A</span>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 200,
        },
        {
            title: 'Category',
            key: 'category',
            width: 120,
            render: (_: any, record: Product) => (
                <div>
                    {record.category && (
                        <Tag color="blue">{record.category}</Tag>
                    )}
                    {record.subcategory && (
                        <Tag color="cyan" style={{ marginTop: 4, display: 'block' }}>
                            {record.subcategory}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Price',
            key: 'price',
            width: 120,
            render: (_: any, record: Product) => {
                const currencySymbol = record.currency === 'INR' ? '₹' :
                    record.currency === 'USD' ? '$' :
                        record.currency === 'EUR' ? '€' :
                            record.currency === 'GBP' ? '£' : '$'
                return `${currencySymbol}${record.price.toLocaleString()}`
            },
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            width: 80,
            render: (stock: number) => (
                <span style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
                    {stock ?? 0}
                </span>
            ),
            sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                const colorMap: Record<string, string> = {
                    active: 'green',
                    draft: 'orange',
                    archived: 'red',
                }
                return (
                    <Tag color={colorMap[status || 'active']}>
                        {(status || 'active').toUpperCase()}
                    </Tag>
                )
            },
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Draft', value: 'draft' },
                { text: 'Archived', value: 'archived' },
            ],
            onFilter: (value, record) => (record.status || 'active') === value,
        },
        {
            title: 'Featured',
            dataIndex: 'featured',
            key: 'featured',
            width: 80,
            render: (featured: boolean) => featured ? (
                <Tag color="gold">⭐ Featured</Tag>
            ) : null,
            filters: [
                { text: 'Featured', value: true },
                { text: 'Not Featured', value: false },
            ],
            onFilter: (value, record) => !!record.featured === value,
        },
        {
            title: 'Attributes',
            key: 'attributes',
            width: 200,
            render: (_: any, record: Product) => (
                <div style={{ fontSize: 12 }}>
                    {record.color && <div>Color: {record.color}</div>}
                    {record.clarity && <div>Clarity: {record.clarity}</div>}
                    {record.origin && <div>Origin: {record.origin}</div>}
                    {record.cut && <div>Cut: {record.cut}</div>}
                    {record.grade && <div>Grade: {record.grade}</div>}
                </div>
            ),
        },
        {
            title: 'Tags',
            key: 'tags',
            width: 150,
            render: (_: any, record: Product) => (
                <div>
                    {record.tags && record.tags.length > 0 ? (
                        record.tags.slice(0, 3).map((tag, idx) => (
                            <Tag key={idx} color="purple" style={{ marginBottom: 4 }}>
                                {tag}
                            </Tag>
                        ))
                    ) : (
                        <span style={{ color: '#999', fontSize: 12 }}>No tags</span>
                    )}
                </div>
            ),
        },
    ]

    const handleSuccess = () => {
        if (onRefresh) {
            onRefresh()
        } else {
            // Fallback: reload the page
            window.location.reload()
        }
    }

    return (
        <div className={styles.productsPage}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2} style={{ margin: 0 }}>Products Management</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                    size="large"
                >
                    Add Product
                </Button>
            </div>
            <Card>
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    scroll={{ x: 1400 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} products`,
                    }}
                />
            </Card>
            <AddProductModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </div>
    )
}
