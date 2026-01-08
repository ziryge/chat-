'use client';

import { EmbedData, getEmbedUrl } from '@/lib/media';

interface MediaEmbedProps {
  embed: EmbedData;
}

export function MediaEmbed({ embed }: MediaEmbedProps) {
  switch (embed.type) {
    case 'youtube':
      return (
        <div className="my-4 w-full">
          <div className="relative rounded overflow-hidden bg-black">
            <div
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
              }}
            >
              <iframe
                src={getEmbedUrl(embed)}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      );

    case 'tiktok':
      return (
        <div className="my-4 w-full">
          <div
            style={{
              position: 'relative',
              paddingBottom: '180%',
              height: 0,
            }}
          >
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
          <script async src="https://www.instagram.com/embed.js"></script>
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
            className="border border-border rounded bg-white dark:bg-black"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      );

    case 'vimeo':
      return (
        <div className="my-4 w-full">
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              height: 0,
              overflow: 'hidden',
            }}
          >
            <iframe
              src={getEmbedUrl(embed)}
              title="Vimeo video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0 rounded"
            />
          </div>
        </div>
      );

    case 'spotify':
      return (
        <div className="my-4 w-full">
          <iframe
            style={{ borderRadius: '12px' }}
            src={`https://open.spotify.com/embed${embed.url.replace('https://open.spotify.com', '')}`}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="bg-black rounded"
          />
        </div>
      );

    default:
      return null;
  }
}
