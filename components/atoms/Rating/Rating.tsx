import { Rate } from 'antd'
import React from 'react'

export interface RatingProps {
    value: number
    disabled?: boolean
    allowHalf?: boolean
}

export const Rating: React.FC<RatingProps> = ({
    value,
    disabled = true,
    allowHalf = true,
}) => {
    return (
        <Rate
            disabled={disabled}
            allowHalf={allowHalf}
            value={value}
            style={{ fontSize: '14px', color: '#faad14' }}
        />
    )
}

