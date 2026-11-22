// ساخت junction با نام انگلیسی + فایل اجرایی دسکتاپ (همه از Node، بدون مشکل کدگذاری)
import { existsSync, rmSync, copyFileSync, unlinkSync, writeFileSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const proj = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JUNCTION = 'C:\\daftarche';
const probe = path.join(JUNCTION, 'package.json');

// ۱) junction با Node خالص — اگر سالم است دست نمی‌زنیم، وگرنه پاک و از نو
if (existsSync(probe)) {
  console.log('junction already ok');
} else {
  try {
    rmSync(JUNCTION, { recursive: true, force: true });
  } catch {
    /* وجود نداشت */
  }
  symlinkSync(proj, JUNCTION, 'junction');
  console.log('junction ok:', existsSync(probe));
}

// ۲) بات راه‌انداز (محتوای کاملاً ASCII)
const batPath = path.join(proj, 'scripts', 'open-site.bat');
writeFileSync(batPath, '@echo off\r\nstart "" wscript.exe "C:\\daftarche\\scripts\\site-desktop.vbs"\r\n');

// ۳) کپی روی دسکتاپ با نام فارسی + حذف لینک قدیمی
const desktop = path.join(process.env.USERPROFILE, 'Desktop');
const finalName = String.fromCharCode(
  0x062f, 0x0641, 0x062a, 0x0631, 0x0686, 0x0647, 0x0020,
  0x0639, 0x0644, 0x0645, 0x06cc, 0x0020,
  0x0645, 0x0646
); // «دفترچه علمی من»

const dstBat = path.join(desktop, finalName + '.bat');
copyFileSync(batPath, dstBat);

const oldLnk = path.join(desktop, finalName + '.lnk');
try {
  unlinkSync(oldLnk);
  console.log('old .lnk removed');
} catch {
  console.log('no old .lnk');
}

console.log('desktop bat exists:', existsSync(dstBat));
