import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  recCard: {
    padding: 20,
    borderLeftWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 20,
    borderRadius: 2,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: colors.accent,
    width: '75%',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    fontSize: 7,
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recDescription: {
    fontSize: 10,
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.7)',
  },
})

interface RecommendationsPageProps {
  recommendations: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return { bg: 'rgba(255, 80, 80, 0.15)', text: '#ff5050', border: '#ff5050' }
    case 'medium': return { bg: 'rgba(238, 241, 81, 0.15)', text: colors.accent, border: colors.accent }
    case 'low': return { bg: 'rgba(255, 255, 255, 0.1)', text: 'rgba(255, 255, 255, 0.5)', border: 'rgba(255, 255, 255, 0.2)' }
    default: return { bg: 'rgba(255, 255, 255, 0.05)', text: '#fff', border: '#fff' }
  }
}

export const RecommendationsPage = ({ recommendations }: RecommendationsPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>RECOMENDACIONES</Text>
      <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Acciones sugeridas para optimizar la presencia digital</Text>
    </View>

    <View style={pdfStyles.section}>
      {recommendations.map((rec, i) => {
        const pColor = getPriorityColor(rec.priority)
        return (
          <View key={i} style={[styles.recCard, { borderLeftColor: pColor.border }]}>
            <View style={styles.recHeader}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: pColor.bg }]}>
                <Text style={{ color: pColor.text }}>{rec.priority}</Text>
              </View>
            </View>
            <Text style={styles.recDescription}>{rec.description}</Text>
          </View>
        )
      })}
    </View>

    <View style={pdfStyles.footer}>
      <Text>La Magdalena — Reporte de Social Listening</Text>
    </View>
  </Page>
)
