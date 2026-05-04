import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'
import { BarChart, DonutChart } from '../charts'

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 10,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  legend: {
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    marginRight: 5,
  },
  legendText: {
    fontSize: 8,
  },
})

interface VolumeReachPageProps {
  timeSeries: { date: string, count: number }[]
  volumeByNetwork: Record<string, number>
}

export const VolumeReachPage = ({ timeSeries, volumeByNetwork }: VolumeReachPageProps) => {
  const chartData = timeSeries.map(d => ({ label: d.date.split('-').slice(1).join('/'), value: d.count }))
  const networkData = Object.entries(volumeByNetwork).map(([label, value]) => ({ label, value }))
  const legendColors = ['#d4ff00', '#eef151', '#5c4a33', '#a8a29e', '#f9f9f9']

  return (
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Volumen y Alcance</Text>
        <Text style={pdfStyles.subtitle}>Evolución temporal y distribución por red</Text>
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
