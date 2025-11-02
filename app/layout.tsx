import { ConfigProvider } from 'antd'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Yemeni agate',
    description: 'Authentic Yemeni agate jewelry and gemstones - Handcrafted rings, stones, and Islamic jewelry with fast shipping',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#f16521',
                                borderRadius: 8,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            },
                            components: {
                                Button: {
                                    borderRadius: 8,
                                    controlHeight: 40,
                                },
                                Input: {
                                    borderRadius: 8,
                                    controlHeight: 44,
                                },
                                Card: {
                                    borderRadius: 12,
                                },
                            },
                        }}
                    >
                        {children}
                    </ConfigProvider>
                </Providers>
            </body>
        </html>
    )
}

