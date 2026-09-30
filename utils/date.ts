// Helper tanggal berbasis waktu lokal perangkat.
// Jangan pakai toISOString() untuk tanggal: hasilnya UTC, sehingga di WIB (UTC+7)
// tanggal belum berganti sebelum pukul 07:00.

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// Date -> "YYYY-MM-DD" (lokal)
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// "YYYY-MM-DD" -> Date pada tengah malam lokal
// (new Date("YYYY-MM-DD") diparse sebagai UTC, bukan lokal)
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}
