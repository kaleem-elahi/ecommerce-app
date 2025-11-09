import { Button, Result } from 'antd'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the product you are looking for does not exist."
      extra={
        <Link href="/">
          <Button type="primary">Back Home</Button>
        </Link>
      }
    />
  )
}

