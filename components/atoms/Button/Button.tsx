import { Button as AntButton, ButtonProps } from 'antd'
import React from 'react'

export interface CustomButtonProps extends ButtonProps {
    children: React.ReactNode
}

export const Button: React.FC<CustomButtonProps> = ({ children, ...props }) => {
    return <AntButton {...props}>{children}</AntButton>
}

