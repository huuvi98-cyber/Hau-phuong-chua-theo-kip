export interface TextPreset {
  id: string;
  title: string;
  line1: string;
  line2: string;
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'original-ref',
    title: 'Bản Mẫu Gốc (Hậu Phương)',
    line1: '“HẬU PHƯƠNG”',
    line2: 'CHƯA THEO KỊP',
  },
  {
    id: 'sea-drift',
    title: 'Sóng Biển Mênh Mông',
    line1: 'SÓNG BIỂN',
    line2: 'NGHÌN TRÙNG XÔ DẠT',
  },
  {
    id: 'ocean-whisper',
    title: 'Tiếng Sóng Vỗ',
    line1: 'TIẾNG SÓNG VỖ',
    line2: 'LÒNG DẠ XÔ NGHIÊNG',
  },
  {
    id: 'deep-voyage',
    title: 'Thuyền & Đại Dương',
    line1: 'VƯỢT TRÙNG DƯƠNG',
    line2: 'ĐÓN GIÓ ĐẦU NGỌN',
  },
];
