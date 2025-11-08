'use client'

import { SearchBar } from '@/components/molecules/SearchBar'
import {
    GiftOutlined,
    GlobalOutlined,
    HeartOutlined,
    MenuOutlined,
    ShoppingCartOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { Badge, Drawer, Dropdown, Layout, Menu, Space } from 'antd'
import Image from 'next/image'
import React, { useState } from 'react'
import styles from './Header.module.css'

const { Header: AntHeader } = Layout

export interface HeaderProps {
    onSearch: (value: string) => void
    searchValue?: string
}

export const Header: React.FC<HeaderProps> = ({ onSearch, searchValue }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const categoryItems = [
        { key: '1', label: 'Gifts' },
        { key: '2', label: 'Housewarming Gifts' },
        { key: '3', label: 'Home Favourites' },
        { key: '4', label: 'Fashion Finds' },
        { key: '5', label: 'Registry' },
    ]

    const mobileMenu = (
        <Menu
            mode="vertical"
            items={[
                { key: '1', label: 'Gifts', icon: <GiftOutlined /> },
                { key: '2', label: 'Housewarming Gifts' },
                { key: '3', label: 'Home Favourites' },
                { key: '4', label: 'Fashion Finds' },
                { key: '5', label: 'Registry' },
                { type: 'divider' },
                { key: '6', label: 'Sign in', icon: <UserOutlined /> },
            ]}
        />
    )

    return (
        <AntHeader className={styles.header}>
            <div className={styles.headerContent}>
                {/* Logo and Categories */}
                <div className={styles.headerLeft}>
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <MenuOutlined />
                    </button>
                    <a className={styles.logo} href="/" aria-label="The Agate City home">
                        <Image
                            src="/assets/the-agate-city-logo.png"
                            alt="The Agate City - Where Elegance is Unveiled"
                            width={320}
                            height={72}
                            priority
                        />
                    </a>
                    <Dropdown menu={{ items: categoryItems }} placement="bottomLeft">
                        <span className={styles.categoriesButton}>
                            <MenuOutlined /> <span className={styles.categoriesText}>Categories</span>
                        </span>
                    </Dropdown>
                </div>

                {/* Search Bar */}
                <div className={styles.headerCenter}>
                    <SearchBar initialValue={searchValue} onSearch={onSearch} />
                </div>

                {/* User Actions */}
                <div className={styles.headerRight}>
                    <Space size="large" className={styles.headerActions}>
                        <span className={styles.headerLink}>
                            <span className={styles.headerLinkText}>Sign in</span>
                        </span>
                        <span className={styles.headerLink}>
                            <GlobalOutlined /> <span className={styles.flag}>🇮🇳</span>
                        </span>
                        <Badge count={0} showZero>
                            <HeartOutlined className={styles.headerIcon} />
                        </Badge>
                        <Badge count={0} showZero>
                            <GiftOutlined className={styles.headerIcon} />
                        </Badge>
                        <Badge count={0} showZero>
                            <ShoppingCartOutlined className={styles.headerIcon} />
                        </Badge>
                    </Space>
                </div>
            </div>

            {/* Secondary Navigation */}
            <div className={styles.secondaryNav}>
                <Space size="large" wrap>
                    <a href="#" className={`${styles.navLink} ${styles.navLinkActive}`}>
                        <GiftOutlined className={styles.navIcon} />
                        Gifts
                    </a>
                    <a href="#" className={styles.navLink}>
                        Housewarming Gifts
                    </a>
                    <a href="#" className={styles.navLink}>
                        Home Favourites
                    </a>
                    <a href="#" className={styles.navLink}>
                        Fashion Finds
                    </a>
                    <a href="#" className={styles.navLink}>
                        Registry
                    </a>
                </Space>
            </div>

            {/* Mobile Drawer */}
            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                className={styles.mobileDrawer}
                bodyStyle={{ padding: 0 }}
            >
                {mobileMenu}
            </Drawer>
        </AntHeader>
    )
}

