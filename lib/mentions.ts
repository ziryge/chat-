// Parse @mentions from text
export const parseMentions = (text: string): { username: string; fullMatch: string }[] => {
  const mentionRegex = /@(\w{1,30})/g;
  const mentions: { username: string; fullMatch: string }[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      fullMatch: match[0],
    });
  }

  return mentions;
};

// Replace @mentions with links
export const renderMentions = (text: string): { parts: { type: 'text' | 'mention'; content: string }[] } => {
  const mentions = parseMentions(text);
  if (mentions.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const parts: { type: 'text' | 'mention'; content: string }[] = [];
  let lastIndex = 0;

  mentions.forEach((mention) => {
    const index = text.indexOf(mention.fullMatch, lastIndex);
    
    // Add text before mention
    if (index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, index),
      });
    }

    // Add mention
    parts.push({
      type: 'mention',
      content: mention.username,
    });

    lastIndex = index + mention.fullMatch.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts;
};

// Get mentioned usernames from text
export const getMentionedUsernames = (text: string): string[] => {
  return parseMentions(text).map(m => m.username);
};
