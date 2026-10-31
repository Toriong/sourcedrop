/**
 * YouTube URL parsing and video extraction utilities
 */

import { YouTubeData } from '../types';

export function parseYouTubeUrl(url: string): YouTubeData | null {
  try {
    const urlObj = new URL(url);
    
    // Video or Shorts
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
      // Standard video: youtube.com/watch?v=VIDEO_ID
      if (urlObj.pathname === '/watch' && urlObj.searchParams.has('v')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return {
            videoId,
            type: 'video'
          };
        }
      }
      
      // Shorts: youtube.com/shorts/VIDEO_ID
      if (urlObj.pathname.startsWith('/shorts/')) {
        const videoId = urlObj.pathname.split('/shorts/')[1]?.split('/')[0];
        if (videoId) {
          return {
            videoId,
            type: 'shorts'
          };
        }
      }
      
      // Channel: youtube.com/@CHANNEL or /channel/CHANNEL_ID
      if (urlObj.pathname.startsWith('/@') || urlObj.pathname.startsWith('/channel/')) {
        const channelId = urlObj.pathname.split('/')[1];
        if (channelId) {
          return {
            channelId,
            type: 'channel'
          };
        }
      }
      
      // Playlist: youtube.com/playlist?list=PLAYLIST_ID
      if (urlObj.pathname === '/playlist' && urlObj.searchParams.has('list')) {
        const playlistId = urlObj.searchParams.get('list');
        if (playlistId) {
          return {
            playlistId,
            type: 'playlist'
          };
        }
      }
      
      // Short URL: youtu.be/VIDEO_ID
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.substring(1);
        if (videoId) {
          return {
            videoId,
            type: 'video'
          };
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export function getCurrentYouTubeData(): YouTubeData | null {
  const url = window.location.href;
  return parseYouTubeUrl(url);
}

export async function getChannelVideos(_channelId: string): Promise<string[]> {
  // This would need to scrape the channel page or use YouTube's internal API
  // For now, return a placeholder
  return [];
}

export async function getPlaylistVideos(_playlistId: string): Promise<string[]> {
  // This would need to scrape the playlist page or use YouTube's internal API
  // For now, return a placeholder
  return [];
}

export function extractVideoIdFromElement(element: HTMLElement): string | null {
  // Try to find video ID in various YouTube DOM structures
  const link = element.querySelector('a[href*="/watch?v="]') as HTMLAnchorElement;
  if (link) {
    const url = new URL(link.href);
    return url.searchParams.get('v');
  }
  return null;
}
