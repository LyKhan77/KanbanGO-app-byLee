export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // 1. Normalize line endings (CRLF to LF)
  let escaped = markdown.replace(/\r\n/g, '\n');

  // 2. Escape HTML special characters
  escaped = escaped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 3. Headings (# Heading)
  escaped = escaped.replace(/^### (.*$)/gim, '<h4 class="font-serif font-semibold text-boho-espresso mt-3 mb-1 text-sm">$1</h4>');
  escaped = escaped.replace(/^## (.*$)/gim, '<h3 class="font-serif font-bold text-boho-espresso mt-3 mb-1 text-base">$1</h3>');
  escaped = escaped.replace(/^# (.*$)/gim, '<h2 class="font-serif font-bold text-boho-espresso mt-4 mb-2 text-lg">$1</h2>');

  // 4. Inline code placeholders (`code`) - protected from bold/italic/strikethrough formatting
  const codeBlocks: string[] = [];
  escaped = escaped.replace(/`([^`]+)`/g, (_match, codeContent) => {
    const placeholder = `%%CODE_PLACEHOLDER_${codeBlocks.length}%%`;
    codeBlocks.push(
      `<code class="px-1.5 py-0.5 rounded bg-boho-canvas text-xs font-mono text-terracotta border border-boho-canvas/80">${codeContent}</code>`
    );
    return placeholder;
  });

  // 5. Bold, Italic, Strikethrough
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/~~(.*?)~~/g, '<del class="opacity-60">$1</del>');

  // Restore inline code blocks
  codeBlocks.forEach((codeHtml, index) => {
    escaped = escaped.replace(`%%CODE_PLACEHOLDER_${index}%%`, () => codeHtml);
  });

  // 6. Checklist items (- [ ] and - [x])
  escaped = escaped.replace(
    /^\s*-\s*\[[xX]\]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut line-through opacity-70"><input type="checkbox" checked disabled class="rounded border-terracotta text-terracotta pointer-events-none" /><span>$1</span></div>'
  );
  escaped = escaped.replace(
    /^\s*-\s*\[ \]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut"><input type="checkbox" disabled class="rounded border-boho-clay pointer-events-none" /><span>$1</span></div>'
  );

  // 7. Regular bullet points (- item)
  escaped = escaped.replace(/^\s*-\s+(.*$)/gim, '<li class="text-xs text-boho-walnut">$1</li>');

  // 8. Wrap contiguous <li> elements in <ul>
  escaped = escaped.replace(
    /(<li\b[^>]*>.*?<\/li>(?:[^\S\r\n]*\n[^\S\r\n]*<li\b[^>]*>.*?<\/li>)*)/g,
    (_match, items) => {
      const listContent = items.replace(/[^\S\r\n]*\n[^\S\r\n]*/g, '');
      return `<ul class="list-disc pl-4 my-1 space-y-0.5">${listContent}</ul>`;
    }
  );

  // 9. Avoid injecting <br /> immediately after block closing tags like </h2>, </h3>, </h4>, </div>, </ul>
  escaped = escaped.replace(/(<\/(?:h[1-6]|div|ul)>)[^\S\r\n]*\n/gi, '$1');

  // 10. Line breaks
  escaped = escaped.replace(/\n/g, '<br />');

  return escaped;
}
