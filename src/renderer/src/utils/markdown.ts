export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // 1. Escape HTML special characters
  let escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Headings (# Heading)
  escaped = escaped.replace(/^### (.*$)/gim, '<h4 class="font-serif font-semibold text-boho-espresso mt-3 mb-1 text-sm">$1</h4>');
  escaped = escaped.replace(/^## (.*$)/gim, '<h3 class="font-serif font-bold text-boho-espresso mt-3 mb-1 text-base">$1</h3>');
  escaped = escaped.replace(/^# (.*$)/gim, '<h2 class="font-serif font-bold text-boho-espresso mt-4 mb-2 text-lg">$1</h2>');

  // 3. Inline code (`code`)
  escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-boho-canvas text-xs font-mono text-terracotta border border-boho-canvas/80">$1</code>');

  // 4. Bold, Italic, Strikethrough
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
  escaped = escaped.replace(/~~(.*?)~~/g, '<del class="opacity-60">$1</del>');

  // 5. Checklist items (- [ ] and - [x])
  escaped = escaped.replace(
    /^\s*-\s*\[[xX]\]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut line-through opacity-70"><input type="checkbox" checked disabled class="rounded border-terracotta text-terracotta pointer-events-none" /><span>$1</span></div>'
  );
  escaped = escaped.replace(
    /^\s*-\s*\[ \]\s+(.*$)/gim,
    '<div class="flex items-center gap-2 my-1 text-xs text-boho-walnut"><input type="checkbox" disabled class="rounded border-boho-clay pointer-events-none" /><span>$1</span></div>'
  );

  // 6. Regular bullet points (- item)
  escaped = escaped.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-xs text-boho-walnut my-0.5">$1</li>');

  // 7. Line breaks
  escaped = escaped.replace(/\n/g, '<br />');

  return escaped;
}
