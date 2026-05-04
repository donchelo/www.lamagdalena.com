import React from 'react'
import { Svg, Rect, Line, Text, Path, Circle, G } from '@react-pdf/renderer'

interface DataPoint {
  label: string
  value: number
}

export const BarChart = ({ data, width = 500, height = 200 }: { data: DataPoint[], width?: number, height?: number }) => {
  const padding = 40
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const barWidth = (chartWidth / data.length) * 0.7
  const barGap = (chartWidth / data.length) * 0.3

  return (
    <Svg width={width} height={height}>
      {/* Axes */}
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#5c4a33" strokeWidth={1} />
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#5c4a33" strokeWidth={1} />
      
      {data.map((d, i) => {
        const h = (d.value / maxValue) * chartHeight
        const x = padding + i * (barWidth + barGap) + barGap / 2
        const y = height - padding - h
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barWidth} height={h} fill="#d4ff00" />
            {/* @ts-ignore - textAnchor is supported by react-pdf SVG but missing in some type versions */}
            <Text x={x + barWidth / 2} y={height - padding + 15} fontSize={8} textAnchor="middle" fill="#5c4a33">
              {d.label}
            </Text>
          </G>
        )
      })}
    </Svg>
  )
}

export const DonutChart = ({ data, size = 200 }: { data: DataPoint[], size?: number }) => {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  const center = size / 2
  const radius = size * 0.4
  const innerRadius = size * 0.25
  const colors = ['#d4ff00', '#eef151', '#5c4a33', '#a8a29e', '#f9f9f9']
  
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
        const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${center} ${center} Z`

        return (
          <Path
            key={i}
            d={pathData}
            fill={colors[i % colors.length]}
          />
        )
      })}
      <Circle cx={center} cy={center} r={innerRadius} fill="white" />
    </Svg>
  )
}
