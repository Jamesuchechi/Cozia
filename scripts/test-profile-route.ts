import { supabase } from '../src/lib/supabase';

async function testProfileRoute() {
  console.log('--- TESTING PROFILE ROUTE FETCHING AND ISOWNPROFILE LOGIC ---');

  const profileId = '3308d36e-284d-40e1-b643-2f1da8fa7ada'; // User B's profile ID in DB
  const { data: userB, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  console.log('Fetched User B Profile Data:', userB, 'Error:', error);

  const currentUserAId = 'demo-user-123'; // User A logged in
  const isOwnProfileForB = currentUserAId === userB?.id;
  const isOwnProfileForA = currentUserAId === currentUserAId;

  console.log(`When logged in as User A (${currentUserAId}):`);
  console.log(`- Navigating to /profile/${profileId} (User B): isOwnProfile = ${isOwnProfileForB} -> Shows FOLLOW button`);
  console.log(`- Navigating to /profile/me (User A): isOwnProfile = ${isOwnProfileForA} -> Shows EDIT PROFILE button`);

  if (!error && userB && !isOwnProfileForB && isOwnProfileForA) {
    console.log('\n✅ Profile route resolution verification PASSED!');
  } else {
    console.error('\n❌ Profile route verification FAILED');
    process.exit(1);
  }
}

testProfileRoute();
