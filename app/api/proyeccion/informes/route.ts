import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const REPORTS_DIR = path.join(process.cwd(), 'data', 'proyeccion', 'informes')

export async function GET() {
  try {
    if (!fs.existsSync(REPORTS_DIR)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'))
    const reports = files.map(file => {
      const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf-8')
      return {
        id: file,
        title: file.replace('.md', '').replace(/_/g, ' ').toUpperCase(),
        content
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching static reports:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
