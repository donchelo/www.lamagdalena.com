import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'
import { DonutChart } from '../charts'

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  half: {
    width: '48%',
  },
  chartContainer: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  topicList: {
    marginTop: 10,
  },
  topicItem: {
    fontSize: 10,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeft: 2,
    borderLeftColor: colors.accent,
  },
  driverBox: {
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  driverTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
})

interface SentimentPageProps {
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  dominantTopics: string[]
  drivers: {
    positive: string[]
    negative: string[]
  }
}

export const SentimentPage = ({ sentiment, dominantTopics, drivers }: SentimentPageProps) => {
  const sentimentData = [
    { label: 'Positivo', value: sentiment.positive },
    { label: 'Neutral', value: sentiment.neutral },
    { label: 'Negativo', value: sentiment.negative },
  ]
  const sentimentColors = [colors.accent, 'rgba(255,255,255,0.2)', '#ff5050']

  return (
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>ANÁLISIS DE SENTIMIENTO</Text>
        <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Percepción de la audiencia y temas clave</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={pdfStyles.sectionTitle}>Distribución</Text>
          <View style={{ ...styles.chartContainer, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <DonutChart data={sentimentData} size={150} colors={sentimentColors} />
            <View style={{ marginTop: 15, width: '100%' }}>
              {sentimentData.map((d, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingBottom: 4, borderBottom: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                  <Text style={{ fontSize: 9, color: sentimentColors[i], fontWeight: 700 }}>{d.label}</Text>
                  <Text style={{ fontSize: 9, color: '#fff' }}>{d.value}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.half}>
          <Text style={pdfStyles.sectionTitle}>Temas Dominantes</Text>
          <View style={styles.topicList}>
            {dominantTopics.map((topic, i) => (
              <Text key={i} style={{ ...styles.topicItem, color: '#fff', borderLeftColor: colors.accent }}>{topic}</Text>
            ))}
          </View>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Drivers Estratégicos</Text>
        <View style={styles.row}>
          <View style={[styles.half, styles.driverBox, { backgroundColor: 'rgba(238, 241, 81, 0.05)', border: '1px solid rgba(238, 241, 81, 0.2)' }]}>
            <Text style={[styles.driverTitle, { color: colors.accent }]}>Positivos</Text>
            {drivers.positive.map((d, i) => (
              <Text key={i} style={[pdfStyles.text, { marginBottom: 3, color: 'rgba(255,255,255,0.8)' }]}>— {d}</Text>
            ))}
          </View>
          <View style={[styles.half, styles.driverBox, { backgroundColor: 'rgba(255, 80, 80, 0.05)', border: '1px solid rgba(255, 80, 80, 0.2)' }]}>
            <Text style={[styles.driverTitle, { color: '#ff5050' }]}>Críticos</Text>
            {drivers.negative.map((d, i) => (
              <Text key={i} style={[pdfStyles.text, { marginBottom: 3, color: 'rgba(255,255,255,0.8)' }]}>— {d}</Text>
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
