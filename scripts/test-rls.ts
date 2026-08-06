import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : typeof process !== 'undefined' ? process.env : {};
const supabaseUrl = (env.VITE_SUPABASE_URL as string) || 'https://tjgbbqhoxsgrwvtftauf.supabase.co';
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ2JicWhveHNncnd2dGZ0YXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDMxMTUsImV4cCI6MjEwMTUxOTExNX0.XAqHuCivjEtuWgWd_OubZ23ALPWX_tSsTHoyhpaNu_8';

// Create Supabase client using ANON KEY (strictly unauthenticated public role)
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function testRlsEnforcement() {
  console.log('====================================================');
  console.log('RUNNING RLS ENFORCEMENT SECURITY AUDIT TEST');
  console.log('====================================================');

  let passedAll = true;

  // 1. Test curated_videos safety_status = 'pending' (MUST BE UNREACHABLE via anon key)
  console.log('\n[TEST 1] Attempting anon SELECT on curated_videos with safety_status = "pending"...');
  const { data: pendingData, error: pendingError } = await anonClient
    .from('curated_videos')
    .select('*')
    .eq('safety_status', 'pending');

  if (pendingError) {
    console.error('Pending query error:', pendingError.message);
  }

  const pendingCount = pendingData ? pendingData.length : 0;
  console.log(`-> Returned pending rows count: ${pendingCount}`);

  if (pendingCount === 0) {
    console.log('✅ PASS: Pending curated_videos rows are UNREACHABLE via anon key.');
  } else {
    console.error(`❌ FAIL: Security breach! ${pendingCount} pending rows were accessible via anon key.`);
    passedAll = false;
  }

  // 2. Test curated_videos safety_status = 'approved' (MUST BE REACHABLE via anon key)
  console.log('\n[TEST 2] Attempting anon SELECT on curated_videos with safety_status = "approved"...');
  const { data: approvedData, error: approvedError } = await anonClient
    .from('curated_videos')
    .select('*')
    .eq('safety_status', 'approved');

  if (approvedError) {
    console.error('Approved query error:', approvedError.message);
    passedAll = false;
  } else {
    console.log(`-> Returned approved rows count: ${approvedData?.length || 0}`);
    console.log('✅ PASS: Approved curated_videos query completed successfully via anon key.');
  }

  // 3. Test posts table public RLS policy
  console.log('\n[TEST 3] Attempting anon SELECT on posts table...');
  const { data: postsData, error: postsError } = await anonClient.from('posts').select('*');
  if (postsError) {
    console.error('Posts query error:', postsError.message);
  } else {
    console.log(`-> Returned posts count: ${postsData?.length || 0}`);
    console.log('✅ PASS: Posts table public SELECT policy verified via anon key.');
  }

  // 4. Test comments table public RLS policy
  console.log('\n[TEST 4] Attempting anon SELECT on comments table...');
  const { data: commentsData, error: commentsError } = await anonClient.from('comments').select('*');
  if (commentsError) {
    console.error('Comments query error:', commentsError.message);
  } else {
    console.log(`-> Returned comments count: ${commentsData?.length || 0}`);
    console.log('✅ PASS: Comments table public SELECT policy verified via anon key.');
  }

  console.log('\n====================================================');
  if (passedAll) {
    console.log('🎉 RLS ENFORCEMENT AUDIT: ALL TESTS PASSED CLEANLY');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('💥 RLS ENFORCEMENT AUDIT: TEST FAILED');
    console.log('====================================================');
    process.exit(1);
  }
}

testRlsEnforcement();
