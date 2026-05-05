import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors } from './styles'
import type { JobData } from '@/lib/supabase'
import type { Analysis } from '@/lib/claude'

const styles = StyleSheet.create({
  onePagerPage: {
    padding: 40,
    backgroundColor: colors.bg,
    fontFamily: 'Neue Haas Display',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: colors.accent,
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 10,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 5,
  },
  logoPlaceholder: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.accent,
  },
  summarySection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.accent,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.9)',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  kpiBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 15,
    borderRadius: 2,
    borderLeft: 2,
    borderLeftColor: colors.accent,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 900,
    color: colors.accent,
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightItem: {
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
  insightBullet: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: 900,
  },
  insightText: {
    fontSize: 9,
    lineHeight: 1.5,
    flex: 1,
  },
  recommendationBox: {
    backgroundColor: colors.accent,
    padding: 20,
    borderRadius: 2,
    marginTop: 'auto',
  },
  recLabel: {
    fontSize: 8,
    fontWeight: 900,
    color: colors.bg,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: 900,
    color: colors.bg,
    marginBottom: 4,
  },
  recDesc: {
    fontSize: 9,
    color: colors.bg,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  footer: {
    marginTop: 20,
    borderTop: 0.5,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.3)',
  }
})

interface OnePagerProps {
  job: JobData
  analysis: Analysis
}

export const OnePagerDocument = ({ job, analysis }: OnePagerProps) => {
  const sentiment = analysis.sentimentAnalysis.positivePercent - analysis.sentimentAnalysis.negativePercent
  
  return (
    <Document title={`One-pager - ${job.clientName}`}>
      <Page size="A4" style={styles.onePagerPage}>
        <View style={styles.header}>
          <View>
            <Text style={styles.mainTitle}>ESTRATEGIA NEON</Text>
            <Text style={styles.clientName}>{job.clientName} | {job.dateFrom} - {job.dateTo}</Text>
          </View>
          <Text style={styles.logoPlaceholder}>LA MAGDALENA</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
          <Text style={styles.summaryText}>
            {analysis.executiveSummary?.split('\n')[0] || 'Sin resumen disponible.'}
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{analysis.volumeMetrics?.totalReach?.toLocaleString() || 0}</Text>
            <Text style={styles.kpiLabel}>Alcance Total</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{analysis.engagementMetrics?.avgEngagementRate || 0}%</Text>
            <Text style={styles.kpiLabel}>Engagement</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{analysis.volumeMetrics?.totalPosts || 0}</Text>
            <Text style={styles.kpiLabel}>Publicaciones</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiValue}>{sentiment > 0 ? '+' : ''}{sentiment}%</Text>
            <Text style={styles.kpiLabel}>Sentimiento Neto</Text>
          </View>
        </View>

        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Hallazgos Clave</Text>
          {(analysis.keyInsights || []).slice(0, 4).map((insight, i) => (
            <View key={i} style={styles.insightItem}>
              <Text style={styles.insightBullet}>//</Text>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recommendationBox}>
          <Text style={styles.recLabel}>Recomendación de Negocio</Text>
          <Text style={styles.recTitle}>{analysis.recommendations?.[0]?.title || 'Optimización Continua'}</Text>
          <Text style={styles.recDesc}>{analysis.recommendations?.[0]?.description || 'Seguir monitoreando las tendencias del mercado para ajustar la estrategia.'}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Social Listening Intelligence — Reporte Confidencial</Text>
          <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  )
}
