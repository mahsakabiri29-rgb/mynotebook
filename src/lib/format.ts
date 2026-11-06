// ─────────────────────────────────────────────────────────────
//  ابزارهای نمایش تاریخ و اعداد فارسی
//  (از قابلیت‌های خود جاوااسکریپت استفاده می‌کنیم؛ کتابخانهٔ اضافه لازم نیست)
// ─────────────────────────────────────────────────────────────

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** تبدیل ارقام لاتین به ارقام فارسی: 7 → ۷ */
export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** نمایش تاریخ به شکل «۱۵ آبان ۱۴۰۵» — تقویم هجری شمسی، داخلی و بدون کتابخانه */
export function faDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** سال جاری به عدد فارسی، برای پاورقی «© ۱۴۰۵» */
export function faYear(date = new Date()): string {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(date);
}

/** تخمین زمان مطالعه بر حسب دقیقه (با فرض ~۱۹۰ کلمه در دقیقه برای متون فارسی) */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 190));
}
