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
  const logoPath = path.join(process.cwd(), 'public/assets/logos/Logo-Neon.png')
  
  return (
    <Page size="A4" style={styles.page}>
      <View style={{ position: 'absolute', top: 40, left: 40 }}>
        <Image src={logoPath} style={{ width: 120 }} />
      </View>
      
      <View style={{ alignItems: 'flex-start', width: '80%', marginTop: 100 }}>
        <Text style={{ ...styles.title, textAlign: 'left', fontSize: 48, letterSpacing: -2 }}>
          SOCIAL{'\n'}LISTENING{'\n'}REPORT
        </Text>
        <View style={{ ...styles.accentBar, width: 60, height: 4, marginBottom: 40 }} />
        
        <Text style={{ ...styles.subtitle, color: colors.accent, fontWeight: 700, fontSize: 24, marginBottom: 10 }}>
          {clientName.toUpperCase()}
        </Text>
        
        <View style={{ ...styles.infoContainer, alignItems: 'flex-start', marginTop: 0 }}>
          <Text style={{ ...styles.infoText, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>
            PERÍODO: {dateFrom} — {dateTo}
          </Text>
          <Text style={{ ...styles.infoText, color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4 }}>
            GENERADO EL: {new Date().toLocaleDateString('es-CO')}
          </Text>
        </View>
      </View>
      
      <View style={pdfStyles.footer}>
        <Text style={{ color: colors.accent, fontWeight: 700 }}>LA MAGDALENA — NEON ERA</Text>
      </View>
    </Page>
  )
}
