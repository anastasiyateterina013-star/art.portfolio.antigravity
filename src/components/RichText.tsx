/**
 * RichText component - lightweight markdown-style renderer.
 *
 * Supported in the Admin text content:
 *   ## Section Heading   → blue bold heading (h2)
 *   ### Sub-heading      → smaller blue heading (h3)
 *   **bold text**        → bold inline text
 *   *italic text*        → italic inline text
 *   [text](url)          → clickable link
 *   https://...          → auto-link raw URLs
 *   Blank line           → paragraph break
 *   Any other line       → normal body text
 */

import styles from "./RichText.module.css";

// Words that must NOT appear at the end of a line
const SHORT = new Set([
  'a','an','the','and','or','but','in','on','at','to','of','as',
  'if','my','by','up','is','it','be','we','he','she','i','for',
  'nor','so','yet','from','with','this','that'
]);

/**
 * Replaces the space after every short word with a non-breaking space,
 * guaranteeing no short word can ever be the last word on a line.
 * Processes word-by-word to avoid double-chaining bugs.
 */
function noOrphans(text: string): string {
  const words = text.split(' ');
  let out = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const isLast = i === words.length - 1;
    const clean = word.toLowerCase().replace(/[^a-z']/g, '');
    if (!isLast && SHORT.has(clean)) {
      out += word + '\u00A0'; // non-breaking space: short word sticks to next word
    } else {
      out += word + (isLast ? '' : ' ');
    }
  }
  return out;
}


function parseInline(text: string): React.ReactNode[] {
  const processed = noOrphans(text);
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)|(https?:\/\/[^\s]+))/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(processed)) !== null) {
    if (match.index > lastIndex) {
      parts.push(processed.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      parts.push(<a key={key++} href={match[5]} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>{match[4]}</a>);
    } else if (match[6]) {
      parts.push(<a key={key++} href={match[6]} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>{match[6]}</a>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < processed.length) {
    parts.push(processed.slice(lastIndex));
  }
  return parts;
}

export default function RichText({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className={styles.heading2}>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className={styles.heading3}>
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed === "") {
      elements.push(<div key={key++} className={styles.spacer} />);
    } else {
      elements.push(
        <p key={key++} className={styles.body}>
          {parseInline(trimmed)}
        </p>
      );
    }
  }

  return <div className={styles.richText}>{elements}</div>;
}
