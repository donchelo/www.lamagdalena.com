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
  const sentimentColors = ['#d4ff00', '#eef151', '#5c4a33']

  return (
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Análisis de Sentimiento</Text>
        <Text style={pdfStyles.subtitle}>Percepción de la audiencia y temas clave</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={pdfStyles.sectionTitle}>Distribución de Sentimiento</Text>
          <View style={styles.chartContainer}>
            <DonutChart data={sentimentData} size={150} />
            <View style={{ marginTop: 10 }}>
              {sentimentData.map((d, i) => (
                <Text key={i} style={{ fontSize: 9, marginBottom: 2 }}>
                  {d.label}: {d.value}%
                </Text>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.half}>
          <Text style={pdfStyles.sectionTitle}>Temas Dominantes</Text>
          <View style={styles.topicList}>
            {dominantTopics.map((topic, i) => (
              <Text key={i} style={styles.topicItem}>{topic}</Text>
            ))}
          </View>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Factores de Sentimiento (Drivers)</Text>
        <View style={styles.row}>
          <View style={[styles.half, styles.driverBox, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[styles.driverTitle, { color: '#166534' }]}>Positivos</Text>
            {drivers.positive.map((d, i) => (
              <Text key={i} style={[pdfStyles.text, { marginBottom: 3 }]}>• {d}</Text>
            ))}
          </View>
          <View style={[styles.half, styles.driverBox, { backgroundColor: '#fef2f2' }]}>
            <Text style={[styles.driverTitle, { color: '#991b1b' }]}>Negativos</Text>
            {drivers.negative.map((d, i) => (
              <Text key={i} style={[pdfStyles.text, { marginBottom: 3 }]}>• {d}</Text>
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
