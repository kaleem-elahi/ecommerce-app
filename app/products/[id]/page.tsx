import { getProductById } from '@/lib/queries'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './ProductDetailClient'

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}

