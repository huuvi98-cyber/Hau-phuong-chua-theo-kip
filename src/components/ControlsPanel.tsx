import React from 'react';
import { WaveTheme, WaveConfig, WaveInteractionMode } from '../types';
import { THEMES } from '../data/themes';
import { TEXT_PRESETS } from '../data/presets';
import { 
  Sliders, 
  Type, 
  Palette, 
  Waves, 
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ControlsPanelProps {
  theme: WaveTheme;
  setTheme: (t: WaveTheme) => void;
  config: WaveConfig;
  setConfig: React.Dispatch<React.SetStateAction<WaveConfig>>;
  mode: WaveInteractionMode;
  setMode: (m: WaveInteractionMode) => void;
  line1: string;
  setLine1: (s: string) => void;
  line2: string;
  setLine2: (s: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  letterSpacing: number;
  setLetterSpacing: (n: number) => void;
  showDecorations: boolean;
  setShowDecorations: (b: boolean) => void;
  onReset: () => void;
  isAudioPlaying: boolean;
  toggleAudio: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  theme,
  setTheme,
  config,
  setConfig,
  mode,
  setMode,
  line1,
  setLine1,
  line2,
  setLine2,
  fontSize,
  setFontSize,
  letterSpacing,
  setLetterSpacing,
  showDecorations,
  setShowDecorations,
  onReset,
  isAudioPlaying,
  toggleAudio,
}) => {
  const [activeTab, setActiveTab] = React.useState<'text' | 'wave' | 'theme'>('text');

  return (
    <div 
      id="wave-controls-panel"
      className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-sky-100 p-5 w-full flex flex-col gap-4 text-slate-800"
    >
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-sky-50 rounded-xl">
          <button
            id="tab-btn-text"
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeTab === 'text'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
            }`}
          >
            <Type size={15} />
            <span>Chữ & Nội dung</span>
          </button>

          <button
            id="tab-btn-wave"
            onClick={() => setActiveTab('wave')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeTab === 'wave'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
            }`}
          >
            <Waves size={15} />
            <span>Chuyển động Sóng</span>
          </button>

          <button
            id="tab-btn-theme"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeTab === 'theme'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
            }`}
          >
            <Palette size={15} />
            <span>Màu sắc & Phối cảnh</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sound-toggle"
            onClick={toggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isAudioPlaying 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Bật/tắt âm thanh sóng biển rì rào"
          >
            {isAudioPlaying ? <Volume2 size={14} className="animate-pulse" /> : <VolumeX size={14} />}
            <span>{isAudioPlaying ? 'Đang phát sóng' : 'Âm thanh biển'}</span>
          </button>

          <button
            id="btn-reset-defaults"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Khôi phục thông số mặc định"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Mặc định</span>
          </button>
        </div>
      </div>

      {/* Tab: Text & Typography */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
          {/* Presets */}
          <div className="md:col-span-4 flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              Mẫu câu chuẩn
            </span>
            <div className="flex flex-col gap-2">
              {TEXT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  onClick={() => {
                    setLine1(preset.line1);
                    setLine2(preset.line2);
                  }}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    line1 === preset.line1 && line2 === preset.line2
                      ? 'border-sky-500 bg-sky-50/80 font-bold text-sky-900 shadow-sm'
                      : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">{preset.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {preset.line1} {preset.line2}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Inputs and Sizing */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-line-1" className="block text-xs font-bold text-slate-700 mb-1">
                  Dòng 1 (Ví dụ: “HẬU PHƯƠNG”)
                </label>
                <input
                  id="input-line-1"
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Nhập dòng 1..."
                />
              </div>

              <div>
                <label htmlFor="input-line-2" className="block text-xs font-bold text-slate-700 mb-1">
                  Dòng 2 (Ví dụ: CHƯA THEO KỊP)
                </label>
                <input
                  id="input-line-2"
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Nhập dòng 2..."
                />
              </div>
            </div>

            {/* Interaction Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Kiểu xô theo sóng (Chuyển động của chữ):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="mode-buoy"
                  onClick={() => setMode('floating-buoy')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    mode === 'floating-buoy'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-sky-300 text-slate-600'
                  }`}
                >
                  <div className="font-semibold text-slate-900">🌊 Xô dạt tự do</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Chữ nhấp nhô, nghiêng & xô theo từng đợt dập dềnh</div>
                </button>

                <button
                  id="mode-curve"
                  onClick={() => setMode('wave-curve')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    mode === 'wave-curve'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-sky-300 text-slate-600'
                  }`}
                >
                  <div className="font-semibold text-slate-900">〰️ Uốn lượn theo mép sóng</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Chữ uốn cong mềm mại theo quỹ đạo đỉnh sóng</div>
                </button>

                <button
                  id="mode-deep"
                  onClick={() => setMode('deep-current')}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    mode === 'deep-current'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-sky-300 text-slate-600'
                  }`}
                >
                  <div className="font-semibold text-slate-900">🫧 Sóng ngầm đáy biển</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Lững lờ trôi dạt êm đềm dưới tầng nước sâu</div>
                </button>
              </div>
            </div>

            {/* Sliders for typography */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cỡ chữ hiển thị</span>
                  <span className="text-sky-600 font-bold">{fontSize}px</span>
                </div>
                <input
                  id="slider-font-size"
                  type="range"
                  min="28"
                  max="90"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Khoảng cách chữ (Tracking)</span>
                  <span className="text-sky-600 font-bold">{letterSpacing}px</span>
                </div>
                <input
                  id="slider-letter-spacing"
                  type="range"
                  min="0"
                  max="24"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Wave Physics */}
      {activeTab === 'wave' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-1">
          {/* Amplitude */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Biên độ sóng (Chiều cao)</span>
              <span className="text-sky-600">{config.amplitude}px</span>
            </div>
            <input
              id="slider-amplitude"
              type="range"
              min="10"
              max="75"
              value={config.amplitude}
              onChange={(e) => setConfig((c) => ({ ...c, amplitude: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Độ cao nhấp nhô của ngọn sóng</span>
          </div>

          {/* Speed */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Tốc độ sóng vỗ</span>
              <span className="text-sky-600">{config.speed.toFixed(1)}x</span>
            </div>
            <input
              id="slider-speed"
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={config.speed}
              onChange={(e) => setConfig((c) => ({ ...c, speed: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Tốc độ cuộn trào của dòng hải lưu</span>
          </div>

          {/* Surge Power */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Lực xô ngang chữ (Surge)</span>
              <span className="text-sky-600">{config.surgePower.toFixed(1)}x</span>
            </div>
            <input
              id="slider-surge"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.surgePower}
              onChange={(e) => setConfig((c) => ({ ...c, surgePower: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Mức độ dòng nước xô dạt các ký tự</span>
          </div>

          {/* Water Level */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Mực nước biển (Độ cao mặt nước)</span>
              <span className="text-sky-600">{Math.round(config.waterLevel * 100)}%</span>
            </div>
            <input
              id="slider-water-level"
              type="range"
              min="0.30"
              max="0.65"
              step="0.02"
              value={config.waterLevel}
              onChange={(e) => setConfig((c) => ({ ...c, waterLevel: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Đường chân sóng ngăn cách bầu trời và đại dương</span>
          </div>

          {/* Wave Frequency */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Tần số sóng (Số ngọn sóng)</span>
              <span className="text-sky-600">{config.frequency.toFixed(1)}</span>
            </div>
            <input
              id="slider-frequency"
              type="range"
              min="0.8"
              max="3.2"
              step="0.1"
              value={config.frequency}
              onChange={(e) => setConfig((c) => ({ ...c, frequency: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Khoảng cách giữa các đợt sóng vỗ</span>
          </div>

          {/* Foam & Splash Intensity */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Mật độ bọt nước & tia nước</span>
              <span className="text-sky-600">{config.foamIntensity.toFixed(1)}x</span>
            </div>
            <input
              id="slider-foam"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.foamIntensity}
              onChange={(e) => setConfig((c) => ({ ...c, foamIntensity: Number(e.target.value) }))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">Tia bọt trắng bắn ra khi sóng xô chữ</span>
          </div>
        </div>
      )}

      {/* Tab: Theme & Visuals */}
      {activeTab === 'theme' && (
        <div className="flex flex-col gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Bảng màu biển & Bầu trời:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {THEMES.map((th) => (
                <button
                  key={th.id}
                  id={`theme-btn-${th.id}`}
                  onClick={() => setTheme(th)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                    theme.id === th.id
                      ? 'border-sky-500 ring-2 ring-sky-300/60 bg-sky-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-sky-300 bg-white'
                  }`}
                >
                  <div className="h-10 w-full rounded-lg overflow-hidden flex flex-col shadow-inner">
                    <div className="h-1/2 w-full" style={{ background: th.skyColorBottom }} />
                    <div className="h-1/2 w-full" style={{ background: th.waveLayer2 }} />
                  </div>
                  <div className="font-bold text-xs text-slate-800 truncate">{th.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle decorative motif */}
          <div className="pt-2 border-t border-sky-100 flex items-center justify-between">
            <label htmlFor="toggle-decorations" className="text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
              <input
                id="toggle-decorations"
                type="checkbox"
                checked={showDecorations}
                onChange={(e) => setShowDecorations(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 cursor-pointer"
              />
              <span>Hiển thị họa tiết 3 lượn sóng trang trí góc phải (như bản mẫu gốc)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
