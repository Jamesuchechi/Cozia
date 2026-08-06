import { runIngestionJob } from '../src/lib/ingestion';
import { getCuratedVideos } from '../src/lib/curation';
import { supabase } from '../src/lib/supabase';

async function testIngestion() {
  console.log('--- RUNNING INGESTION JOB PASS 1 ---');
  const run1 = await runIngestionJob();
  console.log('Run 1 Errors:', run1.errors);
  console.log('Run 1 Total Fetched:', run1.totalFetched);
  console.log('Run 1 Auto-Approved:', run1.autoApprovedCount);
  console.log('Run 1 Pending:', run1.pendingCount);
  console.log('Run 1 Provider Video IDs:', run1.providerVideoIds);

  console.log('\n--- RUNNING INGESTION JOB PASS 2 ---');
  const run2 = await runIngestionJob();
  console.log('Run 2 Total Fetched:', run2.totalFetched);
  console.log('Run 2 Auto-Approved:', run2.autoApprovedCount);
  console.log('Run 2 Pending:', run2.pendingCount);
  console.log('Run 2 Provider Video IDs:', run2.providerVideoIds);

  const set1 = new Set(run1.providerVideoIds);
  const set2 = new Set(run2.providerVideoIds);

  const onlyInRun1 = run1.providerVideoIds.filter((id) => !set2.has(id));
  const onlyInRun2 = run2.providerVideoIds.filter((id) => !set1.has(id));

  console.log('\n--- DIFF BETWEEN RUN 1 AND RUN 2 ---');
  console.log('Unique to Run 1:', onlyInRun1);
  console.log('Unique to Run 2:', onlyInRun2);

  const { count: totalDbCount } = await supabase
    .from('curated_videos')
    .select('*', { count: 'exact', head: true });

  console.log('\n--- DATABASE VERIFICATION ---');
  console.log('Total Rows in curated_videos Table:', totalDbCount);

  const curated = await getCuratedVideos();
  console.log('getCuratedVideos() fetched count:', curated.length);
  console.log(
    'Sample fetched videos (first 3):',
    curated.slice(0, 3).map((v) => ({ id: v.id, provider: v.provider, title: v.title }))
  );
}

testIngestion();
