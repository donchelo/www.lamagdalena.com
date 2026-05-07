import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors } from './styles'
import type { JobData } from '@/lib/supabase'
import type { Analysis } from '@/lib/claude'

const styles = StyleSheet.create({
  onePagerPage: {
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.bg,
    fontFamily: 'Neue Haas Display',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    borderBottom: 1,
    borderBottomColor: colors.accent,
    paddingBottom: 15,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: colors.accent,
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 9,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  logoPlaceholder: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.accent,
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.accent,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: 'rgba(255,255,255,0.9)',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  kpiBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 2,
    borderLeft: 2,
    borderLeftColor: colors.accent,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 900,
    color: colors.accent,
  },
  kpiLabel: {
    fontSize: 7,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightItem: {
    marginBottom: 6,
    flexDirection: 'row',
    gap: 8,
  },
  insightBullet: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: 900,
  },
  insightText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    flex: 1,
  },
  recommendationBox: {
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 2,
    marginTop: 'auto',
  },
  recLabel: {
    fontSize: 7,
    fontWeight: 900,
    color: colors.bg,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  recTitle: {
    fontSize: 11,
    fontWeight: 900,
    color: colors.bg,
    marginBottom: 3,
  },
  recDesc: {
    fontSize: 8.5,
    color: colors.bg,
    lineHeight: 1.3,
    fontWeight: 400,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
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
        <View wrap={false} style={{ flex: 1 }}>
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
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Social Listening Intelligence — Reporte Confidencial</Text>
          <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>
    </Document>
  )
}
