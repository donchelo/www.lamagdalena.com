import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  insightCard: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  numberBox: {
    width: 24,
    height: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderRadius: 2,
  },
  number: {
    fontSize: 12,
    fontWeight: 900,
    color: colors.bg,
  },
  content: {
    flex: 1,
  },
  insightText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.9)',
  },
})

interface KeyInsightsPageProps {
  insights: string[]
}

export const KeyInsightsPage = ({ insights }: KeyInsightsPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>INSIGHTS CLAVE</Text>
      <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Hallazgos estratégicos derivados del análisis</Text>
    </View>

    <View style={pdfStyles.section}>
      {insights.map((insight, i) => (
        <View key={i} style={styles.insightCard}>
          <View style={styles.numberBox}>
            <Text style={styles.number}>{i + 1}</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        </View>
      ))}
    </View>

    <View style={pdfStyles.footer}>
      <Text>La Magdalena — Reporte de Social Listening</Text>
    </View>
  </Page>
)
