// برش شکل‌های مقاله از صفحات رندرشده → public/images/alphabet/
import sharp from 'sharp';

const jobs = [
  // [src, out, left, top, width, height]
  ['.fig-pages/6-systematic-approach-ca-p03.png', 'public/images/alphabet/ch01-fig4-zones.png', 95, 55, 685, 540],
  ['.fig-pages/6-systematic-approach-ca-p03.png', 'public/images/alphabet/ch01-fig5-depth.png', 70, 585, 760, 480],
  ['.fig-pages/6-systematic-approach-ca-p04.png', 'public/images/alphabet/ch01-fig6-dye.png', 95, 50, 700, 560],
  ['.fig-pages/from-bounocore-s-pioneer-p03.png', 'public/images/alphabet/ch02-fig1-timeline.png', 60, 70, 760, 470],
  ['.fig-pages/from-bounocore-s-pioneer-p17.png', 'public/images/alphabet/ch02-fig-interfaces.png', 55, 55, 770, 1055],
  ['.fig-pages/IDS-Procedure-copy-4-pdf-p04.png', 'public/images/alphabet/ch03-fig2-sequence.png', 55, 140, 800, 900],
];

for (const [src, out, l, t, w, h] of jobs) {
  await sharp(src).extract({ left: l, top: t, width: w, height: h }).png({ quality: 90 }).toFile(out);
  console.log('✔', out);
}
