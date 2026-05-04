import React from 'react'
import { Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'
import path from 'path'

const styles = StyleSheet.create({
  page: {
    ...pdfStyles.page,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  logo: {
    width: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 400,
    marginBottom: 60,
    color: colors.text,
  },
  infoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 500,
  },
  accentBar: {
    width: 100,
    height: 8,
    backgroundColor: colors.accent,
    marginTop: 20,
  },
})

interface CoverPageProps {
  clientName: string
  dateFrom: string
  dateTo: string
}

export const CoverPage = ({ clientName, dateFrom, dateTo }: CoverPageProps) => {
  const logoPath = path.join(process.cwd(), 'public/assets/logo-main.png')
  
  return (
    <Page size="A4" style={styles.page}>
      <Image src={logoPath} style={styles.logo} />
      <Text style={styles.title}>Social Listening Report</Text>
      <Text style={styles.subtitle}>{clientName}</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Período: {dateFrom} - {dateTo}</Text>
        <Text style={styles.infoText}>Fecha de generación: {new Date().toLocaleDateString('es-CO')}</Text>
      </View>
      
      <View style={styles.accentBar} />
      
      <View style={pdfStyles.footer}>
        <Text>La Magdalena — Estrategia y Contenido</Text>
      </View>
    </Page>
  )
}
