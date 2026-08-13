import { supabase } from '../supabase';
import { useVideoPlayerStore } from '../../stores/videoPlayerStore';

export interface WatchPartyEvent {
  type: 'PLAY' | 'PAUSE' | 'SEEK' | 'VIDEO_CHANGE' | 'EMOJI_BURST' | 'CHAT_MESSAGE';
  senderId: string;
  senderName: string;
  timestamp: number;
  timeSeconds?: number;
  videoId?: string;
  emoji?: string;
  message?: string;
}

export class WatchPartyEngine {
  private channel: any = null;
  private onRemoteEventCallback: ((event: WatchPartyEvent) => void) | null = null;

  public joinRoom(
    roomId: string,
    onRemoteEvent: (event: WatchPartyEvent) => void
  ) {
    this.onRemoteEventCallback = onRemoteEvent;


    // Subscribe to Supabase Realtime Broadcast channel for this room
    this.channel = supabase.channel(`cozia:watch-party:${roomId}`, {
      config: {
        broadcast: { self: false },
      },
    });

    this.channel
      .on('broadcast', { event: 'party_event' }, ({ payload }: { payload: WatchPartyEvent }) => {
        if (!payload) return;

        // Calculate NTP clock offset to align frame playback
        const now = Date.now();
        const latency = (now - payload.timestamp) / 1000;
        const adjustedTime = (payload.timeSeconds || 0) + (payload.type === 'PLAY' ? latency : 0);

        this.onRemoteEventCallback?.({
          ...payload,
          timeSeconds: adjustedTime,
        });
      })
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[WatchPartyEngine] Successfully joined Realtime Room: ${roomId}`);
          useVideoPlayerStore.getState().setWatchPartyRoom(roomId, true);
        }
      });
  }

  public sendEvent(event: Omit<WatchPartyEvent, 'timestamp'>) {
    if (!this.channel) return;

    const fullEvent: WatchPartyEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.channel.send({
      type: 'broadcast',
      event: 'party_event',
      payload: fullEvent,
    });
  }

  public leaveRoom() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.onRemoteEventCallback = null;
    useVideoPlayerStore.getState().setWatchPartyRoom(null, false);
  }

}

export const watchPartyEngine = new WatchPartyEngine();
