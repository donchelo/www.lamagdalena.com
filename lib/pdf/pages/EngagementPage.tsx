import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  engagementBanner: {
    backgroundColor: colors.accent,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  engagementValue: {
    fontSize: 32,
    fontWeight: 900,
  },
  engagementLabel: {
    fontSize: 12,
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomColor: colors.text,
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#eeeeee',
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  colPlatform: { width: '15%', fontSize: 9 },
  colCaption: { width: '55%', fontSize: 9 },
  colLikes: { width: '15%', fontSize: 9, textAlign: 'right' },
  colComments: { width: '15%', fontSize: 9, textAlign: 'right' },
  headerText: { fontWeight: 700, fontSize: 9 },
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
      <Text style={pdfStyles.title}>Engagement</Text>
      <Text style={pdfStyles.subtitle}>Interacción y contenido destacado</Text>
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
