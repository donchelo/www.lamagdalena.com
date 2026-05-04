import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  engagementBanner: {
    backgroundColor: 'rgba(238, 241, 81, 0.05)',
    border: '1px solid rgba(238, 241, 81, 0.2)',
    padding: 30,
    marginBottom: 40,
    alignItems: 'center',
    borderRadius: 2,
  },
  engagementValue: {
    fontSize: 48,
    fontWeight: 900,
    color: colors.accent,
    letterSpacing: -2,
  },
  engagementLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 5,
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: colors.accent,
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 0.5,
    paddingVertical: 10,
  },
  colPlatform: { width: '15%', fontSize: 9, color: colors.accent, fontWeight: 700 },
  colCaption: { width: '55%', fontSize: 9, color: 'rgba(255, 255, 255, 0.8)' },
  colLikes: { width: '15%', fontSize: 9, textAlign: 'right', color: '#fff' },
  colComments: { width: '15%', fontSize: 9, textAlign: 'right', color: '#fff' },
  headerText: { fontWeight: 700, fontSize: 8, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 },
})

interface EngagementPageProps {
  avgEngagementRate: number
  topPosts: {
    url: string
    platform: string
    likes: number
    comments: number
    caption: string
  }[]
}

export const EngagementPage = ({ avgEngagementRate, topPosts }: EngagementPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>ENGAGEMENT</Text>
      <Text style={{ ...pdfStyles.subtitle, color: 'rgba(255,255,255,0.4)' }}>Interacción y contenido destacado</Text>
    </View>

    <View style={styles.engagementBanner}>
      <Text style={styles.engagementValue}>{(avgEngagementRate * 100).toFixed(2)}%</Text>
      <Text style={styles.engagementLabel}>Tasa de Engagement Promedio</Text>
    </View>

    <View style={pdfStyles.section}>
      <Text style={pdfStyles.sectionTitle}>Top 5 Publicaciones</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.colPlatform, styles.headerText]}>Red</Text>
          <Text style={[styles.colCaption, styles.headerText]}>Contenido</Text>
          <Text style={[styles.colLikes, styles.headerText]}>Likes</Text>
          <Text style={[styles.colComments, styles.headerText]}>Comentarios</Text>
        </View>
        {topPosts.map((post, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.colPlatform}>{post.platform}</Text>
            {/* @ts-ignore */}
            <Text style={styles.colCaption} numberOfLines={2}>
              {post.caption || 'Sin texto'}
            </Text>
            <Text style={styles.colLikes}>{post.likes.toLocaleString()}</Text>
            <Text style={styles.colComments}>{post.comments.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </View>

    <View style={pdfStyles.footer}>
      <Text>La Magdalena — Reporte de Social Listening</Text>
    </View>
  </Page>
)
