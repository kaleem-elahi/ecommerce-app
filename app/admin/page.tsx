import { getProducts } from '@/lib/queries'
import { DashboardStats } from './DashboardStats'
import styles from './dashboard.module.css'

export default async function AdminDashboardPage() {
    const products = await getProducts()

    const stats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + p.price, 0),
        averageRating: products.length > 0
            ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
            : 0,
    }

    return (
        <div className={styles.dashboard}>
            <DashboardStats stats={stats} />
        </div>
    )
}

