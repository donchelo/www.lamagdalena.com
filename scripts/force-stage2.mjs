import { loadJob, updateJobStatus, saveRawData, getRawData } from './lib/supabase.js';
import { fetchDatasetItems, startInstagramCommentsRun } from './lib/apify.js';

// Este script simula la llegada de un webhook de Apify para pasar a la Fase 2 manualmente
async function forceStage2(reportId, datasetId) {
  console.log(`[Manual] Forcing Stage 2 for report ${reportId}...`);
  
  const job = await loadJob(reportId);
  if (!job) {
    console.error(`Report ${reportId} not found`);
    return;
  }

  console.log(`[Manual] Fetching items from dataset ${datasetId}...`);
  const items = await fetchDatasetItems(datasetId);
  console.log(`[Manual] Found ${items.length} posts.`);

  const existing = await getRawData(reportId);
  const combined = [...existing, ...items];
  await saveRawData(reportId, combined);

  const postUrls = items
    .map((item) => item.url || item.directUrl || item.link || item.postUrl)
    .filter(Boolean)
    .filter((url) => url.includes('instagram.com/p/'))
    .slice(0, 200);

  if (postUrls.length > 0) {
    console.log(`[Manual] Found ${postUrls.length} Instagram post URLs. Starting Stage 2 (Comments)...`);
    
    // Usamos una URL de webhook local o una pública si existe
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/reports/${reportId}/apify-webhook`;

    try {
      const commentRunId = await startInstagramCommentsRun(postUrls, webhookUrl);
      const apifyRunIds = { ...job.apifyRunIds, instagram_comments: commentRunId };
      await updateJobStatus(reportId, { status: 'scraping_comments', apifyRunIds });
      console.log(`[Manual] Stage 2 started! Run ID: ${commentRunId}`);
      console.log(`[Manual] IMPORTANT: If you are on localhost, the webhook will still not arrive unless you use a tunnel.`);
    } catch (err) {
      console.error(`[Manual] Error starting Stage 2:`, err);
    }
  } else {
    console.error(`[Manual] No valid Instagram post URLs found.`);
  }
}

// Para usar: node force-stage2.js <reportId> <datasetId>
const [,, reportId, datasetId] = process.argv;
if (reportId && datasetId) {
  forceStage2(reportId, datasetId);
} else {
  console.log('Usage: node force-stage2.js <reportId> <datasetId>');
}
