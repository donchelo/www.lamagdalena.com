import { NextRequest } from "next/server"

const BACKEND_URL = process.env.MAGDALENA_BACKEND_URL ?? "https://magdalena-backend.vercel.app"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const upstream = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.MAGDALENA_INTERNAL_SECRET
        ? { "x-internal-secret": process.env.MAGDALENA_INTERNAL_SECRET }
        : {}),
    },
    body,
  })
  const responseHeaders = new Headers(upstream.headers)
  responseHeaders.delete("content-encoding")
  responseHeaders.delete("content-length")
  responseHeaders.delete("transfer-encoding")
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders })
}
