import { useEffect, useState } from "react";
import { AlertCircle, Banknote, CheckCircle, FileUp, Loader2, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { deleteSetting, getSetting, isSupabaseSettingsAvailable, saveSetting } from "../service";

const SettingsPage = () => {
  const [cashActive, setCashActive] = useState<boolean>(true);
  const [qrisActive, setQrisActive] = useState<boolean>(true);
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"checking" | "supabase" | "local">("checking");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const isDbOk = await isSupabaseSettingsAvailable();
      setDbStatus(isDbOk ? "supabase" : "local");
      
      const savedCash = await getSetting("payment_cash_active");
      const savedQrisActive = await getSetting("payment_qris_active");
      const savedQrisImage = await getSetting("qris_image");
      
      setCashActive(savedCash === null ? true : savedCash === "true");
      setQrisActive(savedQrisActive === null ? true : savedQrisActive === "true");
      setQrisImage(savedQrisImage);
    } catch (err) {
      setErrorMessage("Gagal memuat pengaturan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleCash = async () => {
    const nextState = !cashActive;
    if (!nextState && !qrisActive) {
      setErrorMessage("Minimal harus ada satu metode pembayaran yang aktif.");
      return;
    }
    setErrorMessage(null);
    setCashActive(nextState);
    try {
      await saveSetting("payment_cash_active", nextState ? "true" : "false");
      showSuccess(`Metode Tunai ${nextState ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      setErrorMessage("Gagal menyimpan perubahan.");
    }
  };

  const handleToggleQris = async () => {
    const nextState = !qrisActive;
    if (!nextState && !cashActive) {
      setErrorMessage("Minimal harus ada satu metode pembayaran yang aktif.");
      return;
    }
    setErrorMessage(null);
    setQrisActive(nextState);
    try {
      await saveSetting("payment_qris_active", nextState ? "true" : "false");
      showSuccess(`Metode QRIS ${nextState ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      setErrorMessage("Gagal menyimpan perubahan.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File harus berupa gambar.");
      return;
    }

    if (file.size > 1.2 * 1024 * 1024) {
      setErrorMessage("Ukuran file gambar maksimal 1.2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setLoading(true);
      setErrorMessage(null);
      try {
        await saveSetting("qris_image", base64);
        setQrisImage(base64);
        showSuccess("QRIS berhasil disimpan!");
      } catch (err) {
        setErrorMessage("Gagal menyimpan gambar.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetQris = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus QRIS kustom?")) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await deleteSetting("qris_image");
      setQrisImage(null);
      showSuccess("QRIS kustom dihapus, kembali menggunakan default.");
    } catch (err) {
      setErrorMessage("Gagal menghapus.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <section className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-xl text-zinc-950 dark:text-zinc-50">Pengaturan Pembayaran</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Kelola dan kustomisasi metode pembayaran kasir</p>
        </div>
        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850 px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/50">
          <CheckCircle size={15} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 text-xs text-red-750 bg-red-50 dark:bg-red-950/20 p-3.5 rounded-xl border border-red-200/50">
          <AlertCircle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        
        {/* Payment Methods Toggle List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Daftar Metode Pembayaran</h3>
            {dbStatus === "supabase" ? (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-200/30">
                Supabase
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-200/30">
                Lokal
              </span>
            )}
          </div>

          {/* Toggle: Cash */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-450 rounded-xl">
                <Banknote size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-150">Tunai / Cash</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Menerima pembayaran uang fisik tunai di kasir</p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              onClick={handleToggleCash}
              type="button"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                cashActive ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-850"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  cashActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle: QRIS */}
          <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-650 dark:text-blue-455 rounded-xl">
                <QrCode size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-150">QRIS Barcode</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Menerima scan barcode e-wallet & m-banking</p>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              onClick={handleToggleQris}
              type="button"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                qrisActive ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-850"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  qrisActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* QRIS Upload Card (Only visible when QRIS is active) */}
        {qrisActive && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs animate-fade-in space-y-4">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                Unggah Barcode QRIS Toko
              </h4>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Unggah gambar barcode QRIS Anda untuk menggantikan barcode simulasi bawaan POS
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Preview Container */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 min-h-[170px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={24} />
                    <span className="text-[10px] text-zinc-500 font-semibold">Mengunggah...</span>
                  </div>
                ) : qrisImage ? (
                  <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-xs flex flex-col items-center">
                    <img src={qrisImage} alt="Custom QRIS" className="w-[120px] h-[120px] object-contain" />
                    <span className="text-[9px] text-emerald-600 font-bold mt-1.5 uppercase">QRIS Aktif</span>
                  </div>
                ) : (
                  <div className="bg-white p-2 rounded-xl border border-zinc-200 shadow-xs flex flex-col items-center opacity-70">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd943YrkK94lisw9XwLMr53tJFcGnd7OBP1cZO3z3Llg&s=10"
                      alt="QRIS Dummy"
                      className="w-[120px] h-[120px] object-contain rounded-lg"
                    />
                    <span className="text-[9px] text-red-500 font-extrabold mt-1.5 uppercase tracking-wide">
                      (QRIS Palsu / Simulasi)
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Actions */}
              <div className="space-y-3">
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Format gambar yang disarankan: JPG/PNG dengan resolusi persegi dan ukuran file kurang dari 1.2MB.
                </p>
                <div className="flex flex-col gap-2">
                  <label className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-xl text-xs font-semibold transition ${
                    loading
                      ? "border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed"
                      : "border-zinc-250 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  }`}>
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileUp size={14} />
                    )}
                    <span>{loading ? "Mengunggah..." : "Unggah Gambar Baru"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>

                  {qrisImage && (
                    <button
                      onClick={handleResetQris}
                      disabled={loading}
                      className="w-full py-2 px-3 border border-red-200 hover:bg-red-50 dark:border-red-950/20 text-red-650 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Hapus QRIS Kustom
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default SettingsPage;
