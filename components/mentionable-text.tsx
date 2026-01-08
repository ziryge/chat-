'use client';

import Link from 'next/link';
import { renderMentions } from '@/lib/mentions';

interface MentionableTextProps {
  text: string;
}

export function MentionableText({ text }: MentionableTextProps) {
  const parts = renderMentions(text);

  return (
    <span>
      {parts.map((part, index) => (
        <span key={index}>
          {part.type === 'mention' ? (
            <Link
              href={`/u/${part.content}`}
              className="text-primary hover:underline font-medium"
            >
              @{part.content}
            </Link>
          ) : (
            part.content
          )}
        </span>
      ))}
    </span>
  );
}
