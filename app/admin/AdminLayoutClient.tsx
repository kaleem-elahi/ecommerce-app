'use client'

import {
    DashboardOutlined,
    LogoutOutlined,
    ShoppingOutlined,
    UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Layout, Menu, Typography } from 'antd'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './admin.module.css'

const { Header, Content, Sider } = Layout
const { Text } = Typography

interface AdminLayoutClientProps {
    admin: { username: string }
    children: React.ReactNode
}

export function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/admin/logout', {
                method: 'POST',
            })

            if (response.ok) {
                router.push('/admin-login')
                router.refresh()
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const userMenuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: handleLogout,
        },
    ]

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => router.push('/admin'),
        },
        {
            key: '/admin/products',
            icon: <ShoppingOutlined />,
            label: 'Products',
            onClick: () => router.push('/admin/products'),
        },
    ]

    return (
        <Layout className={styles.adminLayout}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={240}
                className={styles.sider}
            >
                <div className={styles.logo}>
                    {!collapsed ? (
                        <span className={styles.logoText}>Admin Panel</span>
                    ) : (
                        <span className={styles.logoIcon}>A</span>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    items={menuItems}
                    selectedKeys={[pathname]}
                />
            </Sider>
            <Layout>
                <Header className={styles.header}>
                    <div className={styles.headerContent}>
                        <Text className={styles.headerTitle}>Admin Dashboard</Text>
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Button
                                type="text"
                                className={styles.userButton}
                                icon={
                                    <Avatar
                                        size="small"
                                        icon={<UserOutlined />}
                                        className={styles.avatar}
                                    />
                                }
                            >
                                <Text className={styles.username}>{admin.username}</Text>
                            </Button>
                        </Dropdown>
                    </div>
                </Header>
                <Content className={styles.content}>{children}</Content>
            </Layout>
        </Layout>
    )
}

