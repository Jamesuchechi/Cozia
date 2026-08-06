import { runIngestionJob } from '../src/lib/ingestion';

async function main() {
  console.log('🚀 Starting video ingestion pipeline across YouTube, Vimeo, Dailymotion, & Twitch...');
  try {
    const result = await runIngestionJob();
    console.log('\n✅ Ingestion finished successfully!');
    console.log(`- Total Fetched: ${result.totalFetched}`);
    console.log(`- Auto-Approved: ${result.autoApprovedCount}`);
    console.log(`- Sent to Moderation Queue: ${result.pendingCount}`);
    console.log('\nQuota Tracker:');
    console.table(result.quotaUsage);

    if (result.errors.length > 0) {
      console.warn('\n⚠️ Errors encountered during ingestion:');
      result.errors.forEach((err) => console.warn(`  - ${err}`));
    }
  } catch (err) {
    console.error('❌ Ingestion pipeline failed:', err);
    process.exit(1);
  }
}

main();
