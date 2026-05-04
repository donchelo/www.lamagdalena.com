import React from 'react'
import { Svg, Rect, Line, Text, Path, Circle, G } from '@react-pdf/renderer'
import { colors as themeColors } from './styles'

interface DataPoint {
  label: string
  value: number
}

export const BarChart = ({ data, width = 500, height = 220 }: { data: DataPoint[], width?: number, height?: number }) => {
  const padding = 50
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1]

  return (
    <Svg width={width} height={height}>
      {/* Grid Lines */}
      {gridLines.map((g, i) => {
        const y = height - padding - g * chartHeight
        return (
          <G key={i}>
            <Line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
            <Text x={padding - 10} y={y + 3} style={{ fontSize: 7, fill: 'rgba(255,255,255,0.3)', textAnchor: 'end' }}>
              {Math.round(g * maxValue)}
            </Text>
          </G>
        )
      })}

      {/* Axes */}
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
      
      {data.map((d, i) => {
        const h = (d.value / maxValue) * chartHeight
        const barWidth = (chartWidth / data.length) * 0.7
        const barGap = (chartWidth / data.length) * 0.3
        const x = padding + i * (barWidth + barGap) + barGap / 2
        const y = height - padding - h
        
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barWidth} height={h} fill={themeColors.accent} opacity={0.9} />
            {/* Solo mostrar etiquetas cada 5 días si hay muchos datos */}
            {(data.length < 15 || i % 5 === 0) && (
              <Text x={x + barWidth / 2} y={height - padding + 15} style={{ fontSize: 7, textAnchor: 'middle', fill: 'rgba(255,255,255,0.5)' }}>
                {d.label}
              </Text>
            )}
          </G>
        )
      })}
    </Svg>
  )
}

export const DonutChart = ({ data, size = 200, colors }: { data: DataPoint[], size?: number, colors?: string[] }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  if (total === 0) return null
  
  const center = size / 2
  const radius = size * 0.4
  const innerRadius = size * 0.25
  const chartColors = colors || [themeColors.accent, themeColors.secondary, 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']
  
  let currentAngle = -90 // Start at top
  
  return (
    <Svg width={size} height={size}>
      {data.map((d, i) => {
        const sliceAngle = (d.value / total) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + sliceAngle
        currentAngle += sliceAngle

        const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180)
        const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180)
        const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180)
        const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180)

        const largeArcFlag = sliceAngle > 180 ? 1 : 0
        
        // Si es casi un círculo completo (360), el path de arco suele fallar en PDF.
        // Dibujamos un círculo completo en su lugar si solo hay un elemento o el ángulo es > 359.
        if (sliceAngle >= 359) {
          return (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill={chartColors[i % chartColors.length]}
            />
          )
        }

        const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${center} ${center} Z`

        return (
          <Path
            key={i}
            d={pathData}
            fill={chartColors[i % chartColors.length]}
          />
        )
      })}
      <Circle cx={center} cy={center} r={innerRadius} fill={themeColors.bg} />
    </Svg>
  )
}
