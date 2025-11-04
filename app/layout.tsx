import { ConfigProvider } from 'antd'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })
const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['700'],
    variable: '--font-playfair',
})

export const metadata: Metadata = {
    title: 'the agate city',
    description: 'Authentic Yemeni agate jewelry and gemstones - Handcrafted rings, stones, and Islamic jewelry with fast shipping',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${playfairDisplay.variable}`}>
                <Providers>
                    <ConfigProvider
                        theme={{
                            token: {
                                colorPrimary: '#8F61DB',
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

