export interface EmbedData {
  type: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'vimeo' | 'spotify' | 'giphy';
  url: string;
  id: string;
}

export const parseMediaLinks = (content: string): EmbedData[] => {
  const embeds: EmbedData[] = [];
  
  // YouTube regex
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  let match;
  
  while ((match = youtubeRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'youtube' && e.id === match[1])) {
      embeds.push({
        type: 'youtube',
        url: match[0],
        id: match[1],
      });
    }
  }

  // TikTok regex
  const tiktokRegex = /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/g;
  while ((match = tiktokRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'tiktok' && e.id === match[1])) {
      embeds.push({
        type: 'tiktok',
        url: match[0],
        id: match[1],
      });
    }
  }

  // Instagram regex
  const instagramRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)(?:\/\?.*)?/g;
  while ((match = instagramRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'instagram' && e.id === match[1])) {
      embeds.push({
        type: 'instagram',
        url: match[0],
        id: match[1],
      });
    }
  }

  // Twitter/X regex
  const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/(\d+)/g;
  while ((match = twitterRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'twitter' && e.id === match[1])) {
      embeds.push({
        type: 'twitter',
        url: match[0],
        id: match[1],
      });
    }
  }

  // Vimeo regex
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g;
  while ((match = vimeoRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'vimeo' && e.id === match[1])) {
      embeds.push({
        type: 'vimeo',
        url: match[0],
        id: match[1],
      });
    }
  }

  // Spotify (tracks, playlists, albums)
  const spotifyRegex = /(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:track|playlist|album)\/([a-zA-Z0-9]+)/g;
  while ((match = spotifyRegex.exec(content)) !== null) {
    if (!embeds.find(e => e.type === 'spotify' && e.id === match[1])) {
      embeds.push({
        type: 'spotify',
        url: match[0],
        id: match[1],
      });
    }
  }

  return embeds;
};

export const getEmbedUrl = (embed: EmbedData): string => {
  switch (embed.type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${embed.id}`;
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${embed.id}`;
    case 'instagram':
      return `https://www.instagram.com/p/${embed.id}/embed`;
    case 'twitter':
      return `https://twitframe.com/show?url=${encodeURIComponent(embed.url)}`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${embed.id}`;
    case 'spotify':
      return embed.url;
    default:
      return embed.url;
  }
};

export const stripMediaLinks = (content: string): string => {
  let cleanContent = content;
  
  // Remove YouTube links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g, '');
  
  // Remove TikTok links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/g, '');
  
  // Remove Instagram links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)(?:\/\?.*)?/g, '');
  
  // Remove Twitter links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/\w+\/status\/(\d+)/g, '');
  
  // Remove Vimeo links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/g, '');
  
  // Remove Spotify links
  cleanContent = cleanContent.replace(/(?:https?:\/\/)?(?:open\.)?spotify\.com\/(?:track|playlist|album)\/([a-zA-Z0-9]+)/g, '');
  
  return cleanContent.trim();
};
