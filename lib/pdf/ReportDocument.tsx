import React from 'react'
import { Document } from '@react-pdf/renderer'
import { CoverPage } from './pages/CoverPage'
import { ExecutiveSummaryPage } from './pages/ExecutiveSummaryPage'
import { VolumeReachPage } from './pages/VolumeReachPage'
import { EngagementPage } from './pages/EngagementPage'
import { SentimentPage } from './pages/SentimentPage'
import { TopContentPage } from './pages/TopContentPage'
import { KeyInsightsPage } from './pages/KeyInsightsPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import type { JobData } from '@/lib/blob'
import type { Analysis } from '@/lib/claude'

interface ReportDocumentProps {
  job: JobData
  analysis: Analysis
}

export const ReportDocument = ({ job, analysis }: ReportDocumentProps) => {
  if (!job || !analysis) return null;
  
  return (
    <Document
      title={`Reporte Social Listening - ${job.clientName}`}
    author="La Magdalena"
    subject="Social Listening Analysis"
    keywords="social listening, analytics, report"
  >
    <CoverPage
      clientName={job.clientName}
      dateFrom={job.dateFrom}
      dateTo={job.dateTo}
    />
    
    <ExecutiveSummaryPage
      summary={analysis.executiveSummary}
      metrics={{
        totalPosts: analysis.volumeMetrics.totalPosts,
        totalReach: analysis.volumeMetrics.totalReach,
        avgEngagement: analysis.engagementMetrics.avgEngagementRate,
        sentiment: analysis.sentimentAnalysis.positivePercent - analysis.sentimentAnalysis.negativePercent
      }}
    />
    
    <VolumeReachPage
      timeSeries={analysis.volumeMetrics.timeSeries}
      volumeByNetwork={analysis.volumeMetrics.volumeByNetwork}
    />
    
    <EngagementPage
      avgEngagementRate={analysis.engagementMetrics.avgEngagementRate}
      topPosts={analysis.engagementMetrics.topPosts}
    />
    
    <SentimentPage
      sentiment={{
        positive: analysis.sentimentAnalysis.positivePercent,
        neutral: analysis.sentimentAnalysis.neutralPercent,
        negative: analysis.sentimentAnalysis.negativePercent
      }}
      dominantTopics={analysis.sentimentAnalysis.dominantTopics}
      drivers={analysis.sentimentAnalysis.sentimentDrivers}
    />
    
    <TopContentPage
      posts={analysis.engagementMetrics.topPosts}
    />
    
    <KeyInsightsPage
      insights={analysis.keyInsights}
    />
    
    <RecommendationsPage
      recommendations={analysis.recommendations}
    />
  </Document>
  )
}
