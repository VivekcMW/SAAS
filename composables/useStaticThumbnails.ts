export const useStaticThumbnails = () => {
  // Static thumbnail mapping for all blog posts
  const thumbnailMap = new Map([
    // Core comparison posts
    ['10-ai-tools-small-business-2025', '/assets/images/blog/thumbnails/10-ai-tools-small-business-2025.svg'],
    ['slack-vs-teams-vs-discord-2025-guide', '/assets/images/blog/thumbnails/slack-vs-teams-vs-discord-2025-guide.svg'],
    ['best-software-remote-teams-2025-stack', '/assets/images/blog/thumbnails/best-software-remote-teams-2025-stack.svg'],
    ['free-vs-paid-business-software-when-upgrade', '/assets/images/blog/thumbnails/free-vs-paid-business-software-when-upgrade.svg'],
    ['hubspot-vs-salesforce-vs-pipedrive-crm-comparison', '/assets/images/blog/thumbnails/hubspot-vs-salesforce-vs-pipedrive-crm-comparison.svg'],
    ['notion-vs-monday-vs-asana-project-management', '/assets/images/blog/thumbnails/notion-vs-monday-vs-asana-project-management.svg'],
    ['cybersecurity-software-stack-small-business-2025', '/assets/images/blog/thumbnails/cybersecurity-software-stack-small-business-2025.svg'],
    ['software-buying-guide-20-questions-before-purchase', '/assets/images/blog/thumbnails/software-buying-guide-20-questions-before-purchase.svg'],
    
    // Additional comparison posts
    ['zoom-vs-google-meet-vs-skype-video-conferencing', '/assets/images/blog/thumbnails/zoom-vs-google-meet-vs-skype-video-conferencing.svg'],
    ['shopify-vs-woocommerce-vs-bigcommerce-ecommerce', '/assets/images/blog/thumbnails/shopify-vs-woocommerce-vs-bigcommerce-ecommerce.svg'],
    
    // Industry-specific guides
    ['best-software-real-estate-agents-2025-toolkit', '/assets/images/blog/thumbnails/best-software-real-estate-agents-2025-toolkit.svg'],
    ['essential-software-digital-marketing-agencies-2025', '/assets/images/blog/thumbnails/essential-software-digital-marketing-agencies-2025.svg'],
    ['ecommerce-success-software-stack-2025-guide', '/assets/images/blog/thumbnails/ecommerce-success-software-stack-2025-guide.svg'],
    ['healthcare-practice-management-software-2025', '/assets/images/blog/thumbnails/healthcare-practice-management-software-2025.svg']
  ]);

  /**
   * Get thumbnail URL for a blog post
   * @param slug - Blog post slug
   * @returns Thumbnail URL or fallback image
   */
  const getThumbnail = (slug: string): string => {
    return thumbnailMap.get(slug) || '/assets/images/hero-dashboard.png';
  };

  /**
   * Check if a static thumbnail exists for a post
   * @param slug - Blog post slug
   * @returns boolean
   */
  const hasThumbnail = (slug: string): boolean => {
    return thumbnailMap.has(slug);
  };

  /**
   * Get all available thumbnails
   * @returns Map of all thumbnail mappings
   */
  const getAllThumbnails = (): Map<string, string> => {
    return new Map(thumbnailMap);
  };

  /**
   * Add a new thumbnail mapping (for dynamic posts)
   * @param slug - Blog post slug
   * @param thumbnailUrl - Thumbnail URL
   */
  const addThumbnail = (slug: string, thumbnailUrl: string): void => {
    thumbnailMap.set(slug, thumbnailUrl);
  };

  return {
    getThumbnail,
    hasThumbnail,
    getAllThumbnails,
    addThumbnail
  };
};
