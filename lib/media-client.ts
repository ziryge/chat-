'use client';

// Load Instagram embed script when needed
export const loadInstagramEmbed = () => {
  if (typeof window !== 'undefined' && !(window as any).instgrm) {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }
};

// Re-process Instagram embeds
export const reprocessInstagramEmbeds = () => {
  if (typeof window !== 'undefined' && (window as any).instgrm) {
    (window as any).instgrm.Embeds.process();
  }
};
