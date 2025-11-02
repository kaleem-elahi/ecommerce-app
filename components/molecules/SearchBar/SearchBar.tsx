'use client'

import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import React, { useState } from 'react'
import styles from './SearchBar.module.css'

export interface SearchBarProps {
    initialValue?: string
    onSearch: (value: string) => void
    placeholder?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
    initialValue = '',
    onSearch,
    placeholder = 'Search for products...',
}) => {
    const [searchValue, setSearchValue] = useState(initialValue)

    const handleSearch = () => {
        onSearch(searchValue)
    }

    const handleClear = () => {
        setSearchValue('')
        onSearch('')
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className={styles.searchContainer}>
            <Input
                className={styles.searchInput}
                size="large"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                prefix={<SearchOutlined />}
                suffix={
                    searchValue ? (
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={handleClear}
                            className={styles.clearButton}
                        />
                    ) : null
                }
            />
        </div>
    )
}

