import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4 text-center">
      <h1 className="text-6xl font-bold gradient-title mb-4">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-gray-600">
        Sorry we couldn't find the page you were looking for. It might have been removed, renamed, or did not exist in the first place.
      </p>
      <Link href="/">
      <Button>Return Home</Button>
      </Link>
    </div>
  )
}

export default NotFound;
