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
    placeholder = 'Search for anything',
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
            <div className={styles.searchWrapper}>
                <Input
                    className={styles.searchInput}
                    size="large"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
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
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    className={styles.searchButton}
                />
            </div>
        </div>
    )
}

