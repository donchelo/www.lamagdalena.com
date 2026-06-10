import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ name: "La Magdalena", tenant: "magdalena-advisor" })
}
