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
  const ct = upstream.headers.get("content-type") ?? "text/event-stream"
  const responseHeaders = new Headers({ "Content-Type": ct })
  const status = Math.min(Math.max(upstream.status, 200), 599)
  return new Response(upstream.body, { status, headers: responseHeaders })
}
