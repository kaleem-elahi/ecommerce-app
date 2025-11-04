'use client'

import { Tag } from 'antd'
import React from 'react'
import styles from './FilterButton.module.css'

export interface FilterButtonProps {
    label: string
    active: boolean
    onClick: () => void
}

export const FilterButton: React.FC<FilterButtonProps> = ({
    label,
    active,
    onClick,
}) => {
    return (
        <Tag
            className={`${styles.filterButton} ${active ? styles.active : ''}`}
            onClick={onClick}
            style={{
                cursor: 'pointer',
                padding: '4px 12px',
                borderRadius: '16px',
                border: active ? '1px solid #8F61DB' : '1px solid #d9d9d9',
                backgroundColor: active ? '#EDBBCE' : '#ffffff',
                color: active ? '#502688' : '#595959',
                fontSize: '14px',
                transition: 'all 0.2s',
            }}
        >
            {label}
        </Tag>
    )
}

