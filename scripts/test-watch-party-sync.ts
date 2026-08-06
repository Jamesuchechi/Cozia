import WebSocket from 'ws';

class CustomWebSocket extends WebSocket {
  constructor(url: string, protocols?: string | string[]) {
    super(url, protocols, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
      },
    });
  }
}

import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : typeof process !== 'undefined' ? process.env : {};
const supabaseUrl = (env.VITE_SUPABASE_URL as string) || 'https://tjgbbqhoxsgrwvtftauf.supabase.co';
const supabaseAnonKey = (env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ2JicWhveHNncnd2dGZ0YXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NDMxMTUsImV4cCI6MjEwMTUxOTExNX0.XAqHuCivjEtuWgWd_OubZ23ALPWX_tSsTHoyhpaNu_8';

async function testWatchPartySync() {
  console.log('--- TESTING WATCH PARTY REALTIME PLAYBACK SYNC ---');

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      transport: CustomWebSocket as any,
    },
  });

  const roomId = 'lounge-test-' + Date.now();
  const tabAId = 'tab-A-' + Math.random().toString(36).slice(2, 6);

  const channel = client.channel(`watch_party_${roomId}`, {
    config: {
      broadcast: { self: true },
    },
  });

  let receivedPayload: any = null;
  const startTime = Date.now();

  await new Promise<void>((resolve) => {
    channel
      .on('broadcast', { event: 'playback' }, (payload) => {
        console.log('Broadcast event received:', payload);
        if (payload.payload?.senderId === tabAId) {
          receivedPayload = payload.payload;
          const latencyMs = Date.now() - startTime;
          console.log(`✅ Received broadcast playback event in ${latencyMs}ms:`, receivedPayload);
          resolve();
        }
      })
      .subscribe((status, err) => {
        console.log('Channel subscription status:', status, err || '');
        if (status === 'SUBSCRIBED') {
          console.log('Channel SUBSCRIBED successfully. Sending playback seek event...');
          setTimeout(async () => {
            const sendRes = await channel.send({
              type: 'broadcast',
              event: 'playback',
              payload: {
                type: 'seek',
                time: 45,
                senderId: tabAId,
                timestamp: Date.now(),
              },
            });
            console.log('Send broadcast result status:', sendRes);
          }, 200);
        }
      });

    setTimeout(() => {
      if (!receivedPayload) {
        console.warn('Timeout waiting for broadcast payload');
        resolve();
      }
    }, 4000);
  });

  await client.removeChannel(channel);

  console.log('\nWatch Party Sync Test Result:', receivedPayload ? 'PASSED' : 'FAILED');
  process.exit(receivedPayload ? 0 : 1);
}

testWatchPartySync();
