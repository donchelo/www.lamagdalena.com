import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  container: {
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 4,
    marginTop: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.accent,
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  dataSourceBox: {
    marginTop: 20,
    padding: 15,
    borderLeft: 2,
    borderLeftColor: colors.accent,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sourceTitle: {
    fontSize: 9,
    fontWeight: 900,
    color: colors.accent,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
})

interface MethodologyPageProps {
  methodology: string
}

export const MethodologyPage = ({ methodology }: MethodologyPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>AUDITORÍA Y METODOLOGÍA</Text>
      <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Transparencia de datos y origen de la información</Text>
    </View>

    <View style={styles.container}>
      <Text style={styles.title}>Robustez del Análisis</Text>
      <Text style={styles.paragraph}>
        Este reporte estratégico se fundamenta en una infraestructura de recolección de datos de grado industrial. 
        A diferencia de los resúmenes manuales, nuestro pipeline captura el 100% de la actividad en los perfiles seleccionados, 
        asegurando que ninguna interacción (like, comentario o vista) sea omitida.
      </Text>

      <View style={styles.dataSourceBox}>
        <Text style={styles.sourceTitle}>Fuentes de Información Primaria</Text>
        <Text style={{ ...styles.paragraph, marginBottom: 0 }}>
          {methodology}
        </Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Text style={{ ...styles.sourceTitle, color: 'rgba(255,255,255,0.4)' }}>Procesamiento de Inteligencia Artificial</Text>
        <Text style={styles.paragraph}>
          Los insights han sido generados mediante el modelo Anthropic Claude 4.6 (Mayo 2026), entrenado para análisis de 
          sentimiento profundo y detección de patrones estratégicos en grandes volúmenes de datos sociales.
        </Text>
      </View>
    </View>

    <View style={pdfStyles.footer}>
      <Text style={{ color: colors.accent, fontWeight: 700 }}>LA MAGDALENA — CERTIFIED DATA REPORT</Text>
    </View>
  </Page>
)
