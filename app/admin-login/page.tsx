'use client'

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './login.module.css'

export default function AdminLoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm()

    const handleLogin = async (values: { username: string; password: string }) => {
        setLoading(true)

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (response.ok) {
                message.success(`Welcome, ${values.username}!`)
                router.push('/admin')
                router.refresh()
            } else {
                message.error(data.error || 'Invalid credentials')
            }
        } catch (error) {
            message.error('An error occurred. Please try again.')
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginContainer}>
            <Card className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <h1 className={styles.title}>Admin Panel</h1>
                    <p className={styles.subtitle}>Sign in to access the admin dashboard</p>
                </div>

                <Form
                    form={form}
                    name="admin-login"
                    onFinish={handleLogin}
                    layout="vertical"
                    size="large"
                    className={styles.loginForm}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            { required: true, message: 'Please enter your username' },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Username"
                            autoComplete="username"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            className={styles.loginButton}
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

