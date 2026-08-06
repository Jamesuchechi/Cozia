export interface RouteSeoOptions {
  title: string;
  description: string;
  ogType?: 'website' | 'article' | 'video.other';
  ogImage?: string;
  ogUrl?: string;
}

/**
 * Dynamically updates document title and OpenGraph meta tags per route.
 */
export function updateRouteSeo({ title, description, ogType = 'website', ogImage, ogUrl }: RouteSeoOptions) {
  const fullTitle = `${title} | Cozia - Family-Safe Video Curation`;
  document.title = fullTitle;

  const setMetaTag = (propertyOrName: string, content: string) => {
    let element =
      document.querySelector(`meta[property="${propertyOrName}"]`) ||
      document.querySelector(`meta[name="${propertyOrName}"]`);

    if (!element) {
      element = document.createElement('meta');
      if (propertyOrName.startsWith('og:')) {
        element.setAttribute('property', propertyOrName);
      } else {
        element.setAttribute('name', propertyOrName);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  setMetaTag('description', description);
  setMetaTag('og:title', fullTitle);
  setMetaTag('og:description', description);
  setMetaTag('og:type', ogType);
  if (ogImage) setMetaTag('og:image', ogImage);
  if (ogUrl || typeof window !== 'undefined') {
    setMetaTag('og:url', ogUrl || window.location.href);
  }
}
