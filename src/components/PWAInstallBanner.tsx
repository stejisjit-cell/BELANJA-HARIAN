import React, { useState } from 'react';
import { Download, HelpCircle, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  variant?: 'banner' | 'button' | 'settings';
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ variant = 'banner' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'ios' | 'android' | 'desktop'>('android');
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running standalone, display small active badge if in settings
  if (isInstalled && variant !== 'settings') {
    return null;
  }

  const openGuide = (platform: 'ios' | 'android' | 'desktop') => {
    setGuidePlatform(platform);
    setShowGuide(true);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        openGuide('android');
      }
    } else if (isIOS) {
      openGuide('ios');
    } else {
      openGuide('android');
    }
  };

  if (variant === 'settings') {
    return (
      <div className="bg-[#FAF4ED] border border-[#EBE1D7] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F3D7D1] flex items-center justify-center text-[#55443B]">
            <Smartphone className="w-5 h-5 text-[#8F483D]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-[#55443B]">
              {isInstalled ? 'Aplikasi Terpasang di HP' : 'Pasang di Layar Utama HP'}
            </h4>
            <p className="text-xs text-[#78665D]">
              {isInstalled
                ? 'Bunda sudah menjalankan versi PWA mandiri (standalone).'
                : 'Buka lebih cepat tanpa browser & bisa dipakai offline!'}
            </p>
          </div>
          {!isInstalled ? (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Pasang
            </button>
          ) : (
            <span className="text-xs px-2.5 py-1 bg-[#EDF0E9] text-[#5A634E] font-medium rounded-lg">
              Aktif
            </span>
          )}
        </div>

        {/* Manual guide buttons */}
        <div className="mt-3 pt-3 border-t border-[#EFE8E1] flex items-center gap-2 text-xs">
          <span className="text-[#8C7A70]">Panduan:</span>
          <button
            onClick={() => openGuide('android')}
            className="text-[#9E5D54] hover:underline font-medium"
          >
            Android (Chrome)
          </button>
          <span className="text-[#C5B8AF]">•</span>
          <button
            onClick={() => openGuide('ios')}
            className="text-[#9E5D54] hover:underline font-medium"
          >
            iPhone (Safari)
          </button>
        </div>

        {/* Guide Modal */}
        {renderGuideModal()}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FAF1E8] hover:bg-[#F5E6D8] text-[#6A473F] border border-[#E8DACB] text-xs font-semibold rounded-xl transition-all shadow-xs"
          title="Pasang BundaBudget di HP"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#A05B54]" />
          <span>Pasang di HP</span>
        </button>
        {renderGuideModal()}
      </>
    );
  }

  // Variant: 'banner'
  if (isDismissed) return null;

  return (
    <>
      <div className="relative bg-gradient-to-r from-[#FAF2EC] via-[#FDF5F0] to-[#FAF2EC] border border-[#EFE3D8] rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3D7D1] border border-[#E8C2BB] flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5 text-[#8F483D]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[#55443B]">
                Ingin buka BundaBudget lebih cepat layaknya aplikasi HP?
              </p>
              <p className="text-[11px] sm:text-xs text-[#78665D]">
                Pasang di layar utama HP Bunda, tanpa kuota setelah tersimpan!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#DDA29B] hover:bg-[#CE8F87] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pasang Sekarang</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-[#9C8C84] hover:text-[#55443B] rounded-lg transition-colors"
              title="Tutup banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {renderGuideModal()}
    </>
  );

  function renderGuideModal() {
    if (!showGuide) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <div className="w-full max-w-md bg-[#FFFDFB] rounded-3xl p-6 shadow-2xl border border-[#EFE4DA] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-[#EFE8E1]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F3D7D1] flex items-center justify-center text-[#8F483D]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#55443B] text-base">
                  Petunjuk Pemasangan di HP
                </h3>
                <p className="text-xs text-[#8C7A70]">
                  Progressive Web App (PWA)
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 rounded-lg text-[#9C8C84] hover:text-[#55443B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Platform Tab Buttons */}
          <div className="flex gap-2 my-4 p-1 bg-[#F5ECE4] rounded-xl">
            <button
              onClick={() => setGuidePlatform('android')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                guidePlatform === 'android'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#7D6B63] hover:text-[#55443B]'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              onClick={() => setGuidePlatform('ios')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                guidePlatform === 'ios'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#7D6B63] hover:text-[#55443B]'
              }`}
            >
              iPhone (Safari)
            </button>
            <button
              onClick={() => setGuidePlatform('desktop')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                guidePlatform === 'desktop'
                  ? 'bg-white text-[#55443B] shadow-xs'
                  : 'text-[#7D6B63] hover:text-[#55443B]'
              }`}
            >
              Laptop / PC
            </button>
          </div>

          {/* Guide Steps */}
          <div className="space-y-3 text-xs sm:text-sm text-[#55443B] bg-[#FAF5F0] p-4 rounded-2xl border border-[#EFE5DB]">
            {guidePlatform === 'android' && (
              <>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#A7AB98] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Buka <strong>BundaBudget</strong> di browser <strong>Google Chrome</strong> HP Android Bunda.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#A7AB98] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Tekan tombol titik tiga (<strong>⋮</strong>) di pojok kanan atas layar browser.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#A7AB98] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Pilih menu <strong>“Instal aplikasi”</strong> atau <strong>“Tambahkan ke Layar Utama”</strong>.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#A7AB98] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </span>
                  <p>
                    Selesai! Ikon BundaBudget akan muncul di menu HP Bunda dan bisa langsung dibuka tanpa browser.
                  </p>
                </div>
              </>
            )}

            {guidePlatform === 'ios' && (
              <>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#DDA29B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Buka link aplikasi di browser <strong>Safari</strong> (bukan Chrome di iOS).
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#DDA29B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Tekan tombol <strong>Bagikan (Share / kotak panah ke atas)</strong> di bagian bawah layar.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#DDA29B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Geser ke bawah dan pilih <strong>“Add to Home Screen”</strong> (Tambahkan ke Layar Utama).
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#DDA29B] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </span>
                  <p>
                    Tekan <strong>“Add”</strong> di pojok kanan atas. Aplikasi siap digunakan seperti aplikasi App Store!
                  </p>
                </div>
              </>
            )}

            {guidePlatform === 'desktop' && (
              <>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EFD7A8] text-[#55443B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Di Chrome atau Edge, lihat ikon komputer/tanda panah kecil di ujung kanan kolom alamat URL (address bar).
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EFD7A8] text-[#55443B] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Klik <strong>“Instal BundaBudget”</strong> untuk membukanya di jendela aplikasi mandiri.
                  </p>
                </div>
              </>
            )}
          </div>

          <p className="mt-3 text-[11px] text-[#8C7A70] text-center">
            💡 PWA bekerja offline dan menyimpan data secara aman di HP Bunda tanpa biaya langganan.
          </p>

          <button
            onClick={() => setShowGuide(false)}
            className="mt-4 w-full py-2.5 bg-[#55443B] hover:bg-[#43352E] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
          >
            Mengerti, Terima Kasih Bunda
          </button>
        </div>
      </div>
    );
  }
};
