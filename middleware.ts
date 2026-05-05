import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const auth = request.headers.get('authorization')
  const password = process.env.BACKOFFICE_PASSWORD ?? 'magdalena'
  const expected = `Basic ${Buffer.from(`admin:${password}`).toString('base64')}`

  if (auth !== expected) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="La Magdalena Backoffice"' },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/social-listening/:path*', '/proyeccion-financiera/:path*'],
}
