'use client'

import { Header } from '@/components/organisms/Header'
import { Product } from '@/lib/supabase'
import {
  CrownOutlined,
  GiftOutlined,
  LeftOutlined,
  RightOutlined,
  SafetyOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons'
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Layout,
  Radio,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './product-detail.module.css'

const { Content } = Layout
const { Title, Text } = Typography

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedCertificate, setSelectedCertificate] = useState<string>('')
  const [selectedPooja, setSelectedPooja] = useState<string>('')
  const [customizeOption, setCustomizeOption] = useState<string>('ring')
  const [selectedMetal, setSelectedMetal] = useState<string>('')

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/assets/the-agate-city-logo.png']

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleAddToCart = () => {
    // Add to cart logic
    console.log('Add to cart:', product.id)
  }

  const handleBuyNow = () => {
    // Buy now logic
    console.log('Buy now:', product.id)
  }

  const pricePerCarat = product.metadata?.pricePerCarat || product.metadata?.carat
    ? (product.price / (product.metadata?.carat || 1)).toFixed(0)
    : null

  const carat = product.metadata?.carat || product.metadata?.weightGrams
    ? `${product.metadata?.carat || (product.metadata?.weightGrams! / 0.2).toFixed(2)} Carat`
    : null

  const ratti = product.metadata?.ratti || null

  const handleSearch = (value: string) => {
    // Navigate to home page with search query
    router.push(`/?search=${encodeURIComponent(value)}`)
  }

  return (
    <Layout className={styles.layout}>
      <Header onSearch={handleSearch} />
      <Content className={styles.content}>
        <div className={styles.container}>
          {/* Breadcrumbs */}
          <Breadcrumb className={styles.breadcrumb}>
            <Breadcrumb.Item>
              <Link href="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[32, 32]} className={styles.productRow}>
            {/* Left Column - Image Gallery */}
            <Col xs={24} lg={12}>
              <div className={styles.imageGallery}>
                {/* Main Image */}
                <div className={styles.mainImageContainer}>
                  <Button
                    type="text"
                    icon={<LeftOutlined />}
                    className={styles.navButton}
                    onClick={handlePreviousImage}
                    disabled={images.length <= 1}
                  />
                  <div className={styles.mainImageWrapper}>
                    <Image
                      src={images[currentImageIndex]}
                      alt={product.name}
                      width={600}
                      height={600}
                      className={styles.mainImage}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  <Button
                    type="text"
                    icon={<RightOutlined />}
                    className={styles.navButton}
                    onClick={handleNextImage}
                    disabled={images.length <= 1}
                  />
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className={styles.thumbnails}>
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''
                          }`}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} - ${index + 1}`}
                          width={80}
                          height={80}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Ask A Question Button */}
                <Button
                  type="default"
                  icon={<WhatsAppOutlined />}
                  className={styles.askQuestionButton}
                  block
                >
                  Ask A Question :
                </Button>
              </div>
            </Col>

            {/* Right Column - Product Info */}
            <Col xs={24} lg={12}>
              <div className={styles.productInfo}>
                {/* Product Title */}
                <Title level={1} className={styles.productTitle}>
                  {product.name}
                </Title>

                {/* Product Description */}
                {product.description && (
                  <Text className={styles.productDescription}>
                    {product.description}
                    {carat && ` ${carat}`}
                    {ratti && ` ${ratti} Ratti`}
                    {product.origin && ` From ${product.origin}`}
                  </Text>
                )}

                {/* SKU, Origin, Price per Carat */}
                <div className={styles.productMeta}>
                  {product.sku && (
                    <Text className={styles.metaItem}>
                      <strong>SKU:</strong> {product.sku}
                    </Text>
                  )}
                  {product.origin && (
                    <Text className={styles.metaItem}>
                      <strong>ORIGIN:</strong> {product.origin}
                    </Text>
                  )}
                  {pricePerCarat && (
                    <Text className={styles.metaItem}>
                      <strong>PRICE PER CARAT:</strong> ₹{pricePerCarat}
                    </Text>
                  )}
                </div>

                {/* Main Price */}
                <div className={styles.priceSection}>
                  <Title level={2} className={styles.price}>
                    ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Title>
                  {product.originalPrice && (
                    <Text delete className={styles.originalPrice}>
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </Text>
                  )}
                </div>

                <Divider style={{ margin: '8px 0' }} />

                {/* Certificate Option */}
                <div className={styles.optionGroup}>
                  <Text strong className={styles.optionLabel}>
                    Certificate <span className={styles.required}>*</span>
                  </Text>
                  <Select
                    value={selectedCertificate}
                    onChange={setSelectedCertificate}
                    placeholder="ISO Certified Lab Certificate 400/-(Provide Free of Cost)"
                    className={styles.select}
                  >
                    <Select.Option value="iso">
                      ISO Certified Lab Certificate 400/-(Provide Free of Cost)
                    </Select.Option>
                  </Select>
                </div>

                {/* Pooja/Energization Option */}
                <div className={styles.optionGroup}>
                  <Text strong className={styles.optionLabel}>
                    Pooja/Energization
                  </Text>
                  <Select
                    value={selectedPooja}
                    onChange={setSelectedPooja}
                    placeholder="-- Please Select --"
                    className={styles.select}
                  >
                    <Select.Option value="pooja1">Pooja Option 1</Select.Option>
                    <Select.Option value="pooja2">Pooja Option 2</Select.Option>
                  </Select>
                </div>

                {/* Customize With Ring, Pendant & Bracelet */}
                <div className={styles.optionGroup}>
                  <Text strong className={styles.optionLabel}>
                    Customize With Ring, Pendant & Bracelet{' '}
                    <span className={styles.required}>*</span>
                  </Text>
                  <Radio.Group
                    value={customizeOption}
                    onChange={(e) => setCustomizeOption(e.target.value)}
                    className={styles.radioGroup}
                  >
                    <Radio.Button value="gemstone" className={styles.radioButton}>
                      <CrownOutlined /> Gemstone
                    </Radio.Button>
                    <Radio.Button value="ring" className={styles.radioButton}>
                      <GiftOutlined /> Ring
                    </Radio.Button>
                    <Radio.Button value="pendant" className={styles.radioButton}>
                      <SafetyOutlined /> Pendant
                    </Radio.Button>
                    <Radio.Button value="bracelet" className={styles.radioButton}>
                      <ThunderboltOutlined /> Bracelet
                    </Radio.Button>
                  </Radio.Group>
                </div>

                {/* Metal Options */}
                <div className={styles.optionGroup}>
                  <Text strong className={styles.optionLabel}>
                    Metal <span className={styles.required}>*</span>
                  </Text>
                  <Radio.Group
                    value={selectedMetal}
                    onChange={(e) => setSelectedMetal(e.target.value)}
                    className={styles.radioGroup}
                  >
                    <Radio.Button value="silver" className={styles.radioButton}>
                      Silver
                    </Radio.Button>
                    <Radio.Button value="gold" className={styles.radioButton}>
                      Gold (RRB)
                    </Radio.Button>
                    <Radio.Button value="copper" className={styles.radioButton}>
                      Copper (RRB)
                    </Radio.Button>
                    <Radio.Button value="panchdhattu" className={styles.radioButton}>
                      Panchdhattu (RRB)
                    </Radio.Button>
                  </Radio.Group>
                </div>

                {/* Availability & Action Buttons */}
                <div className={styles.actionSection}>
                  {product.stock !== undefined && product.stock > 0 && (
                    <Text type="success" className={styles.stockInfo}>
                      Only {product.stock} left
                    </Text>
                  )}
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ShoppingCartOutlined />}
                      className={styles.addToCartButton}
                      onClick={handleAddToCart}
                      block
                    >
                      Add to cart
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className={styles.buyNowButton}
                      onClick={handleBuyNow}
                      block
                    >
                      Buy Now
                    </Button>
                  </Space>
                </div>

                {/* Benefits Section */}
                <Card className={styles.benefitsCard}>
                  <Title level={4} className={styles.benefitsTitle}>
                    Benefits
                  </Title>
                  <ul className={styles.benefitsList}>
                    <li>Promotes Prosperity</li>
                    <li>Supports Health</li>
                    <li>Encourages Wisdom</li>
                    <li>Business Success</li>
                  </ul>
                </Card>
              </div>
            </Col>
          </Row>

          {/* Shipping & Return Policy */}
          <Row gutter={[16, 16]} className={styles.policyRow}>
            <Col xs={24} sm={12}>
              <Card className={styles.policyCard}>
                <Title level={4}>Shipping Policy</Title>
                <Text>
                  We offer fast and secure shipping for all orders. Delivery times may vary based on
                  your location.
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card className={styles.policyCard}>
                <Title level={4}>Return Policy</Title>
                <Text>
                  We offer a hassle-free return policy. If you&apos;re not satisfied, return within 30
                  days for a full refund.
                </Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  )
}

