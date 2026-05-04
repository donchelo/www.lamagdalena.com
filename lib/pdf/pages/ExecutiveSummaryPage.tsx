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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: 20,
    marginBottom: 15,
    borderRadius: 2,
    borderLeft: 3,
    borderLeftColor: colors.accent,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.accent,
    marginBottom: 5,
    letterSpacing: -1,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
      <Text style={pdfStyles.title}>RESUMEN EJECUTIVO</Text>
      <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Puntos clave y métricas principales</Text>
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
