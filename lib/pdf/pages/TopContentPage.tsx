import React from 'react'
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { colors, pdfStyles } from '../styles'

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  postCard: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#eeeeee',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  platformBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  postCaption: {
    fontSize: 8,
    lineHeight: 1.4,
    height: 45,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#eeeeee',
    paddingTop: 5,
    justifyContent: 'space-between',
  },
  metricItem: {
    fontSize: 7,
    color: colors.muted,
  },
})

interface TopContentPageProps {
  posts: {
    url: string
    platform: string
    likes: number
    comments: number
    caption: string
  }[]
}

export const TopContentPage = ({ posts }: TopContentPageProps) => (
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.title}>Contenido Destacado</Text>
      <Text style={pdfStyles.subtitle}>Publicaciones con mayor impacto visual y engagement</Text>
    </View>

    <View style={styles.grid}>
      {posts.map((post, i) => (
        <View key={i} style={styles.postCard}>
          <Text style={styles.platformBadge}>{post.platform.toUpperCase()}</Text>
          {/* @ts-ignore */}
          <Text style={styles.postCaption} numberOfLines={4}>
            {post.caption || 'Contenido visual sin texto descriptivo.'}
          </Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metricItem}>Likes: {post.likes.toLocaleString()}</Text>
            <Text style={styles.metricItem}>Comms: {post.comments.toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </View>

    <View style={pdfStyles.footer}>
      <Text>La Magdalena — Reporte de Social Listening</Text>
    </View>
  </Page>
)
