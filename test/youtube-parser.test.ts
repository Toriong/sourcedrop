import { describe, it, expect } from 'vitest';
import { parseYouTubeUrl } from '../src/lib/youtube-parser';

describe('YouTube Parser', () => {
  it('should parse standard video URL', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result).toEqual({
      videoId: 'dQw4w9WgXcQ',
      type: 'video'
    });
  });

  it('should parse shortened video URL', () => {
    const result = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result).toEqual({
      videoId: 'dQw4w9WgXcQ',
      type: 'video'
    });
  });

  it('should parse Shorts URL', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/shorts/abc123');
    expect(result).toEqual({
      videoId: 'abc123',
      type: 'shorts'
    });
  });

  it('should parse playlist URL', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/playlist?list=PLtest123');
    expect(result).toEqual({
      playlistId: 'PLtest123',
      type: 'playlist'
    });
  });

  it('should parse channel URL with @', () => {
    const result = parseYouTubeUrl('https://www.youtube.com/@channelname');
    expect(result).toEqual({
      channelId: '@channelname',
      type: 'channel'
    });
  });

  it('should return null for invalid URLs', () => {
    const result = parseYouTubeUrl('https://www.google.com');
    expect(result).toBeNull();
  });
});
