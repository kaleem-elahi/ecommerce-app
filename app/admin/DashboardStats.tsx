'use client'

import { DollarOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import styles from './dashboard.module.css'

const { Title } = Typography

interface DashboardStatsProps {
    stats: {
        totalProducts: number
        totalValue: number
        averageRating: number
    }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    return (
        <>
            <Title level={2}>Dashboard Overview</Title>

            <Row gutter={[16, 16]} className={styles.statsRow}>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Products"
                            value={stats.totalProducts}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: '#8F61DB' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Total Inventory Value"
                            value={stats.totalValue}
                            prefix={<DollarOutlined />}
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card>
                        <Statistic
                            title="Average Rating"
                            value={stats.averageRating}
                            precision={2}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card className={styles.welcomeCard}>
                <Title level={3}>Welcome to Admin Panel</Title>
                <p>
                    Manage your e-commerce store from here. You can view products, add new items,
                    manage inventory, and more.
                </p>
            </Card>
        </>
    )
}

