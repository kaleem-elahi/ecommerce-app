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
            dataIndex: 'imageUrl',
            key: 'image',
            width: 100,
            render: (url: string) => (
                <Image
                    src={url}
                    alt="Product"
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price: number) => `₹${price.toLocaleString()}`,
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            width: 100,
            render: (rating: number) => (
                <span>{rating.toFixed(1)} ⭐</span>
            ),
            sorter: (a, b) => a.rating - b.rating,
        },
        {
            title: 'Reviews',
            dataIndex: 'reviewCount',
            key: 'reviewCount',
            width: 100,
            sorter: (a, b) => a.reviewCount - b.reviewCount,
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            render: (category: string) => (
                <Tag color="purple">{category || 'N/A'}</Tag>
            ),
        },
        {
            title: 'Features',
            key: 'features',
            width: 150,
            render: (_: any, record: Product) => (
                <div className={styles.features}>
                    {record.freeDelivery && <Tag color="green">Free Delivery</Tag>}
                    {record.starSeller && <Tag color="gold">Star Seller</Tag>}
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

