import { Video } from '../../../types/video';
import { useUserStore } from '../../../stores/userStore';

export function getPersonalizedForYouFeed(pool: Video[]): Video[] {
  const approved = pool.filter((v) => v.safetyStatus === 'approved');
  const userAffinity = useUserStore.getState().categoryAffinity || {};

  return [...approved]
    .sort((a, b) => {
      const scoreA = userAffinity[a.category] || 0;
      const scoreB = userAffinity[b.category] || 0;
      return scoreB - scoreA;
    })
    .slice(0, 10);
}
