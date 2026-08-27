/**
 * Keep missing legacy blog URLs out of search results while preserving links
 * that help crawlers discover their current destinations.
 */
export const blogRobotsContent = (hasPost: boolean): string =>
  hasPost ? "index, follow" : "noindex, follow";
