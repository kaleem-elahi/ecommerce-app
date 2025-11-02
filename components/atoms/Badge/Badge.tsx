import { Badge as AntBadge, BadgeProps } from 'antd'
import React from 'react'

export interface CustomBadgeProps extends BadgeProps {
    children?: React.ReactNode
}

export const Badge: React.FC<CustomBadgeProps> = ({
    children,
    ...props
}) => {
    return <AntBadge {...props}>{children}</AntBadge>
}

