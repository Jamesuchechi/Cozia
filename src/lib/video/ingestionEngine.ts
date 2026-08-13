import { VideoSource } from '../../types/video';

interface ProviderQuotaState {
  isExceeded: boolean;
  exceededAt: number | null;
  failureCount: number;
}

const QUOTA_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown after quota failure

class IngestionEngine {
  private quotaStates: Map<VideoSource, ProviderQuotaState> = new Map();

  constructor() {
    const sources: VideoSource[] = ['youtube', 'vimeo', 'twitch', 'dailymotion', 'peertube', 'internetarchive'];
    for (const source of sources) {
      this.quotaStates.set(source, { isExceeded: false, exceededAt: null, failureCount: 0 });
    }
  }

  public reportQuotaFailure(source: VideoSource): void {
    const state = this.quotaStates.get(source) || { isExceeded: false, exceededAt: null, failureCount: 0 };
    state.failureCount += 1;
    if (state.failureCount >= 2) {
      state.isExceeded = true;
      state.exceededAt = Date.now();
      console.warn(`[IngestionEngine] Quota / Rate limit exceeded for provider: ${source}. Switching to fallback provider matrix.`);
    }
    this.quotaStates.set(source, state);
  }

  public isProviderHealthy(source: VideoSource): boolean {
    const state = this.quotaStates.get(source);
    if (!state || !state.isExceeded) return true;

    if (state.exceededAt && Date.now() - state.exceededAt > QUOTA_COOLDOWN_MS) {
      state.isExceeded = false;
      state.failureCount = 0;
      state.exceededAt = null;
      this.quotaStates.set(source, state);
      return true;
    }

    return false;
  }

  public getHealthyProviders(requestedSources: VideoSource[]): VideoSource[] {
    return requestedSources.filter((source) => this.isProviderHealthy(source));
  }
}

export const ingestionEngine = new IngestionEngine();
