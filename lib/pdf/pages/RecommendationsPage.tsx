import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  recCard: {
    padding: 15,
    borderLeftWidth: 5,
    backgroundColor: '#fafafa',
    marginBottom: 15,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: 700,
    width: '80%',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  recDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: colors.text,
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
    case 'high': return { bg: '#fee2e2', text: '#b91c1c', border: '#ef4444' }
    case 'medium': return { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' }
    case 'low': return { bg: '#dcfce7', text: '#15803d', border: '#22c55e' }
    default: return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
  }
}

export const RecommendationsPage = ({ recommendations }: RecommendationsPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>Recomendaciones</Text>
      <Text style={pdfStyles.subtitle}>Acciones sugeridas para optimizar la presencia digital</Text>
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
