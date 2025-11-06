import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { AdminLayoutClient } from './AdminLayoutClient'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const admin = await getAdminSession()

    if (!admin) {
        redirect('/admin-login')
    }

    return <AdminLayoutClient admin={admin}>{children}</AdminLayoutClient>
}

