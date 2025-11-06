'use client'

import { FilterButton } from '@/components/molecules/FilterButton'
import { ProductFilters, SortOption } from '@/lib/supabase'
import { Select, Space } from 'antd'
import React from 'react'
import styles from './FilterBar.module.css'

const { Option } = Select

export interface FilterBarProps {
    filters: ProductFilters
    sortBy: string
    onFilterChange: (filters: ProductFilters) => void
    onSortChange: (sortBy: string) => void
}

const sortOptions: SortOption[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
]

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    sortBy,
    onFilterChange,
    onSortChange,
}) => {
    const handleFilterToggle = (filterKey: keyof ProductFilters) => {
        onFilterChange({
            ...filters,
            [filterKey]: !filters[filterKey],
        })
    }

    return (
        <div className={styles.filterBar}>
            <div className={styles.filterButtons}>
                <Space size={12} wrap>
                    <FilterButton
                        label="Exclude digital items"
                        active={!!filters.excludeDigital}
                        onClick={() => handleFilterToggle('excludeDigital')}
                    />
                    {/* Commented out unused filters - add to ProductFilters interface if needed
                    <FilterButton
                        label="Free delivery"
                        active={!!filters.freeDelivery}
                        onClick={() => handleFilterToggle('freeDelivery')}
                    />
                    <FilterButton
                        label="Star Seller"
                        active={!!filters.starSeller}
                        onClick={() => handleFilterToggle('starSeller')}
                    />
                    <FilterButton
                        label="Dispatched from India"
                        active={filters.dispatchedFrom === 'India'}
                        onClick={handleLocationFilter}
                    />
                    */}
                </Space>
            </div>

            <div className={styles.sortContainer}>
                <Select
                    value={sortBy}
                    onChange={onSortChange}
                    style={{ width: 200 }}
                    suffixIcon={null}
                >
                    {sortOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                            Sort by: {option.label} ↑↓
                        </Option>
                    ))}
                </Select>
            </div>
        </div>
    )
}

