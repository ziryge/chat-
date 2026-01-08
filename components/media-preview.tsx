'use client';

import { parseMediaLinks, getEmbedUrl, EmbedData } from '@/lib/media';

interface MediaPreviewProps {
  content: string;
}

export function MediaPreview({ content }: MediaPreviewProps) {
  const embeds = parseMediaLinks(content);

  if (embeds.length === 0) return null;

  return (
    <div className="mt-4 space-y-4">
      <div className="text-sm text-muted-foreground">
        {embeds.length} media link{embeds.length > 1 ? 's' : ''} detected
      </div>
      {embeds.map((embed, index) => (
        <div key={`${embed.type}-${embed.id}-${index}`} className="border border-border rounded p-3">
          <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            {embed.type} URL detected:
          </div>
          <div className="text-xs text-foreground/70 break-all bg-background p-2 rounded font-mono">
            {embed.url}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MediaEmbedCompactProps {
  embed: EmbedData;
}

export function MediaEmbedCompact({ embed }: MediaEmbedCompactProps) {
  switch (embed.type) {
    case 'youtube':
      return (
        <div className="my-4 w-full">
          <div className="relative rounded overflow-hidden bg-black">
            <iframe
              src={getEmbedUrl(embed)}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video border-0"
            />
          </div>
        </div>
      );

    case 'tiktok':
      return (
        <div className="my-4 w-full">
          <div style={{ position: 'relative', paddingBottom: '177%' }}>
            <iframe
              src={getEmbedUrl(embed)}
              title="TikTok video"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0 rounded"
            />
          </div>
        </div>
      );

    case 'instagram':
      return (
        <div className="my-4 w-full">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={embed.url}
            data-instgrm-version="14"
          />
        </div>
      );

    case 'twitter':
      return (
        <div className="my-4 w-full">
          <iframe
            src={getEmbedUrl(embed)}
            title="Twitter post"
            width="100%"
            height="300"
            className="border border-border rounded"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      );

    case 'vimeo':
      return (
        <div className="my-4 w-full">
          <iframe
            src={getEmbedUrl(embed)}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video rounded"
          />
        </div>
      );

    case 'spotify':
      return (
        <div className="my-4 w-full">
          <iframe
            style={{ borderRadius: '8px' }}
            src={`https://open.spotify.com/embed${embed.url.replace('https://open.spotify.com', '')}`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="bg-black"
          />
        </div>
      );

    default:
      return null;
  }
}
