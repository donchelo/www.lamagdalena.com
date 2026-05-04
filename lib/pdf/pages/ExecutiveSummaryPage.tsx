import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 30,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  kpiBox: {
    width: '48%',
    backgroundColor: colors.accent,
    padding: 15,
    marginBottom: 15,
    borderRadius: 4,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 5,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 500,
    textTransform: 'uppercase',
  },
})

interface ExecutiveSummaryPageProps {
  summary: string
  metrics: {
    totalPosts: number
    totalReach: number
    avgEngagement: number
    sentiment: number
  }
}

export const ExecutiveSummaryPage = ({ summary, metrics }: ExecutiveSummaryPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>Resumen Ejecutivo</Text>
      <Text style={pdfStyles.subtitle}>Puntos clave y métricas principales</Text>
    </View>

    <Text style={styles.summaryText}>{summary}</Text>

    <View style={styles.kpiGrid}>
      <View style={styles.kpiBox}>
        <Text style={styles.kpiValue}>{metrics.totalPosts.toLocaleString()}</Text>
        <Text style={styles.kpiLabel}>Total Publicaciones</Text>
      </View>
      <View style={styles.kpiBox}>
        <Text style={styles.kpiValue}>{metrics.totalReach.toLocaleString()}</Text>
        <Text style={styles.kpiLabel}>Alcance Estimado</Text>
      </View>
      <View style={styles.kpiBox}>
        <Text style={styles.kpiValue}>{(metrics.avgEngagement * 100).toFixed(2)}%</Text>
        <Text style={styles.kpiLabel}>Engagement Promedio</Text>
      </View>
      <View style={styles.kpiBox}>
        <Text style={styles.kpiValue}>{metrics.sentiment > 0 ? '+' : ''}{metrics.sentiment}%</Text>
        <Text style={styles.kpiLabel}>Sentimiento Neto</Text>
      </View>
    </View>

    <View style={pdfStyles.footer}>
      <Text>La Magdalena — Reporte de Social Listening</Text>
    </View>
  </Page>
)
