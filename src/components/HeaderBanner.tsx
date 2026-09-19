import React from 'react';
import { Download, Waves, Sparkles, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';

interface HeaderBannerProps {
  onTriggerSurge: () => void;
  onExport: () => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
  isControlsOpen: boolean;
  toggleControls: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onTriggerSurge,
  onExport,
  isAudioPlaying,
  toggleAudio,
  isControlsOpen,
  toggleControls,
}) => {
  return (
    <header className="w-full flex items-center justify-between py-2 px-1 flex-wrap gap-3">
      {/* App branding & title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-200">
          <Waves size={22} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>SÓNG BIỂN & CHỮ XÔ SÓNG</span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
              Interactive Wave Art
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Đồ họa hải lưu nghệ thuật — chữ nhấp nhô & dạt trôi theo ngọn sóng
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Big Surge Button */}
        <button
          id="btn-big-surge"
          onClick={onTriggerSurge}
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-sky-300/40 transition-all cursor-pointer"
          title="Tạo một đợt sóng xô mạnh qua màn hình"
        >
          <Sparkles size={16} />
          <span>Tạo Đợt Sóng Xô!</span>
        </button>

        {/* Ocean Sound Audio Button */}
        <button
          id="btn-quick-sound"
          onClick={toggleAudio}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
            isAudioPlaying
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
          }`}
          title="Âm thanh tiếng sóng vỗ rì rào (Web Audio)"
        >
          {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          <span className="hidden md:inline">{isAudioPlaying ? 'Tắt sóng' : 'Âm sóng'}</span>
        </button>

        {/* Download Canvas Image Button */}
        <button
          id="btn-download-image"
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
          title="Tải ảnh đồ họa sóng biển chất lượng cao (PNG)"
        >
          <Download size={16} className="text-sky-600" />
          <span className="hidden sm:inline">Tải ảnh HD</span>
        </button>

        {/* Toggle Settings Panel */}
        <button
          id="btn-toggle-controls"
          onClick={toggleControls}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
            isControlsOpen
              ? 'bg-sky-50 text-sky-700 border-sky-300'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Mở bảng điều khiển thông số"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Tùy chỉnh</span>
        </button>
      </div>
    </header>
  );
};
