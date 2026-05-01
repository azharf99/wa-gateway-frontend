/**
 * Menormalkan nomor WhatsApp agar konsisten (format 628xxx)
 * @param {string} number - Nomor telepon mentah (misal: 0812..., +62 812..., 62-812...)
 * @param {boolean} isGroup - Apakah target adalah grup
 * @returns {string} - Nomor yang sudah bersih
 */
export const formatWhatsAppNumber = (number, isGroup = false) => {
    if (!number) return '';

    const trimmed = number.trim();
    
    // Jika sudah ada suffix grup, biarkan apa adanya
    if (trimmed.endsWith('@g.us')) return trimmed;
    
    // Jika ditandai sebagai grup tapi belum ada suffix, tambahkan nanti di komponen masing-masing 
    // atau di sini jika kita ingin konsisten.
    // Namun biasanya @g.us ditambahkan saat submit di komponen.
    // Jadi di sini kita fokus membersihkan karakter irregular saja.
    if (isGroup) return trimmed;

    // Hapus semua karakter non-digit
    let cleaned = trimmed.replace(/\D/g, '');

    // 1. Jika mulai dengan 0, ganti dengan 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    // 2. Jika mulai dengan 8 (langsung nomor tanpa 0 atau 62), tambahkan 62
    if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    }

    return cleaned;
};
