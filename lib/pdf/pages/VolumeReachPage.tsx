import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'
import { BarChart, DonutChart } from '../charts'

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 5,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  half: {
    width: '48%',
  },
  legend: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  legendColor: {
    width: 6,
    height: 6,
    marginRight: 8,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
})

interface VolumeReachPageProps {
  timeSeries: { date: string, count: number }[]
  volumeByNetwork: Record<string, number>
}

export const VolumeReachPage = ({ timeSeries, volumeByNetwork }: VolumeReachPageProps) => {
  const chartData = timeSeries.map(d => ({ label: d.date.split('-').slice(1).join('/'), value: d.count }))
  const networkData = Object.entries(volumeByNetwork).map(([label, value]) => ({ label, value }))
  const legendColors = [colors.accent, colors.secondary, 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']

  return (
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>VOLUMEN Y ALCANCE</Text>
        <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Evolución temporal y distribución por red</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={styles.chartTitle}>Volumen de Publicaciones (Tendencia Temporal)</Text>
        <View style={styles.chartContainer}>
          <BarChart data={chartData} width={500} height={180} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.chartTitle}>Distribución por Red</Text>
          <View style={styles.chartContainer}>
            <DonutChart data={networkData} size={150} />
          </View>
        </View>
        <View style={styles.half}>
          <Text style={styles.chartTitle}>Leyenda</Text>
          <View style={styles.legend}>
            {networkData.map((d, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: legendColors[i % legendColors.length] }]} />
                <Text style={styles.legendText}>{d.label}: {d.value} posts</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={pdfStyles.footer}>
        <Text>La Magdalena — Reporte de Social Listening</Text>
      </View>
    </Page>
  )
}
