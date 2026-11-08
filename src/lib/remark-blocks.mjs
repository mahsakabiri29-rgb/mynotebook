// ─────────────────────────────────────────────────────────────
//  پلاگین کوچک remark: بلوک‌های «صداقت» را به div کلاس‌دار تبدیل می‌کند.
//  در مارک‌داون این‌طوری نوشته می‌شود:
//
//  :::evidence
//  یافتهٔ مستند از مقالهٔ منتشرشده.
//  :::
//
//  :::interpretation → برداشت و تفسیر شخصی من
//  :::experience     → تجربهٔ بالینی خودم
//  :::hypothesis     → فرضیهٔ بررسی‌نشده
// ─────────────────────────────────────────────────────────────

import { visit } from 'unist-util-visit';

const BLOCKS = new Set(['evidence', 'interpretation', 'experience', 'hypothesis']);

export default function remarkBlocks() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      if (!BLOCKS.has(node.name)) return;
      node.data ??= {};
      node.data.hName = 'div';
      node.data.hProperties = { class: `md-block md-block-${node.name}` };
    });
  };
}
