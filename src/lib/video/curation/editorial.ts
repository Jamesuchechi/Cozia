import { Video } from '../../../types/video';

export interface EditorialTopicCollections {
  techAndCoding: Video[];
  indieCinema: Video[];
  gamingHighlights: Video[];
  familyAdventures: Video[];
}

export function getEditorialTopicCollections(pool: Video[]): EditorialTopicCollections {
  const approved = pool.filter((v) => v.safetyStatus === 'approved');

  return {
    techAndCoding: approved.filter(
      (v) =>
        v.category.toLowerCase().includes('tech') ||
        v.category.toLowerCase().includes('education') ||
        v.tags.some((t) => ['tech', 'coding', 'react', 'code', 'science'].includes(t.toLowerCase()))
    ),
    indieCinema: approved.filter(
      (v) =>
        v.category.toLowerCase().includes('film') ||
        v.category.toLowerCase().includes('cinema') ||
        v.tags.some((t) => ['film', 'cinema', 'indie', 'trailer'].includes(t.toLowerCase()))
    ),
    gamingHighlights: approved.filter(
      (v) =>
        v.category.toLowerCase().includes('gaming') ||
        v.tags.some((t) => ['gaming', 'esports', 'twitch', 'game'].includes(t.toLowerCase()))
    ),
    familyAdventures: approved.filter(
      (v) =>
        v.category.toLowerCase().includes('kids') ||
        v.category.toLowerCase().includes('family') ||
        v.tags.some((t) => ['kids', 'family', 'animation', 'asmr'].includes(t.toLowerCase()))
    ),
  };
}
