import { describe, it, expect } from 'vitest';
import { getCardCoverStyle, CARD_COVER_COLORS } from '../src/renderer/src/utils/colors';
import { renderMarkdownToHtml } from '../src/renderer/src/utils/markdown';
import { CardCoverColor } from '../src/shared/types';

describe('Color Palette Utilities', () => {
  it('returns valid cover styles for all predefined bohemian colors', () => {
    expect(CARD_COVER_COLORS.length).toBe(7);

    const expectedKeys: CardCoverColor[] = [
      'none',
      'terracotta',
      'sage',
      'ochre',
      'rose',
      'walnut',
      'slate'
    ];

    expectedKeys.forEach((key) => {
      const style = getCardCoverStyle(key);
      expect(style).toBeDefined();
      expect(style.key).toBe(key);
      expect(style.label).toBeTruthy();
      expect(style.accent).toBeTruthy();
      expect(style.bgTint).toBeTruthy();
      expect(style.border).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    const terracotta = getCardCoverStyle('terracotta');
    expect(terracotta.accent).toBe('#c86d51');
    expect(terracotta.bgTint).toContain('rgba(200, 109, 81');

    const none = getCardCoverStyle('none');
    expect(none.accent).toBe('transparent');
    expect(none.border).toBe('#e0d2bf');
  });

  it('ensures all cover color border values match 6-digit hex format', () => {
    CARD_COVER_COLORS.forEach((style) => {
      expect(style.border).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('falls back to none style for undefined or unknown color', () => {
    const fallbackUndefined = getCardCoverStyle(undefined);
    expect(fallbackUndefined.key).toBe('none');
    expect(fallbackUndefined.accent).toBe('transparent');

    // @ts-expect-error test unknown color fallback
    const fallbackUnknown = getCardCoverStyle('invalid-color');
    expect(fallbackUnknown.key).toBe('none');
    expect(fallbackUnknown.accent).toBe('transparent');
  });
});

describe('Markdown Parser Utility', () => {
  it('correctly parses bold, italic, and strikethrough text', () => {
    const input = 'Ini **tebal** dan *miring* serta ~~coret~~.';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<strong>tebal</strong>');
    expect(output).toContain('<em>miring</em>');
    expect(output).toContain('<del');
    expect(output).toContain('coret</del>');
  });

  it('protects inline code containing asterisks from markdown italic/bold parsing', () => {
    const input = 'Hitung rumus: `const x = a * b * c;` dan `y = d * e`.';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<code');
    expect(output).toContain('const x = a * b * c;</code>');
    expect(output).toContain('y = d * e</code>');
    expect(output).not.toContain('<em>');
    expect(output).not.toContain('<strong>');
  });

  it('correctly parses task list checkboxes and avoids trailing br', () => {
    const input = '- [ ] Task pending\n- [x] Task selesai';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('type="checkbox"');
    expect(output).toContain('checked');
    expect(output).toContain('Task selesai');
    expect(output).toContain('Task pending');
    expect(output).not.toContain('</div><br />');
  });

  it('correctly parses bullet points, wraps in ul, and handles code blocks', () => {
    const input = '- Poin satu\n- Poin dua\n`const x = 10;`';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<ul class="list-disc pl-4 my-1 space-y-0.5">');
    expect(output).toContain('<li');
    expect(output).toContain('Poin satu</li>');
    expect(output).toContain('Poin dua</li>');
    expect(output).toContain('<code');
    expect(output).toContain('const x = 10;</code>');
    expect(output).not.toContain('</ul><br />');
  });

  it('normalizes CRLF line endings to LF correctly', () => {
    const input = '# Header CRLF\r\n- Item 1\r\n- Item 2\r\nBaris 1\r\nBaris 2';
    const output = renderMarkdownToHtml(input);
    expect(output).toContain('<h2');
    expect(output).toContain('Header CRLF</h2>');
    expect(output).toContain('<ul class="list-disc pl-4 my-1 space-y-0.5">');
    expect(output).toContain('Item 1</li><li class="text-xs text-boho-walnut">Item 2</li></ul>');
    expect(output).toContain('Baris 1<br />Baris 2');
    expect(output).not.toContain('\r');
  });

  it('escapes raw HTML to prevent XSS injection', () => {
    const malicious = '<script>alert("hack")</script>';
    const output = renderMarkdownToHtml(malicious);
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
  });

  it('handles empty input and headers without extra br', () => {
    expect(renderMarkdownToHtml('')).toBe('');
    const headers = '# Judul 1\n## Judul 2\n### Judul 3';
    const output = renderMarkdownToHtml(headers);
    expect(output).toContain('<h2');
    expect(output).toContain('Judul 1</h2>');
    expect(output).toContain('<h3');
    expect(output).toContain('Judul 2</h3>');
    expect(output).toContain('<h4');
    expect(output).toContain('Judul 3</h4>');
    expect(output).not.toContain('</h2><br />');
    expect(output).not.toContain('</h3><br />');
  });
});
