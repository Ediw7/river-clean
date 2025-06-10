import { Droplets } from 'lucide-react'; // Import Droplets icon for the logo

export default function Footer() {
  return (
    <footer className="bg-slate-900/50 backdrop-blur-md border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">RiverClean</span>
            </div>
            <p className="text-slate-400 text-sm">Revolusi pelestarian sungai berbasis komunitas untuk Indonesia yang lebih bersih.</p>
          </div>

          {/* Navigasi Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/laporan" className="hover:text-cyan-400 transition-colors">Pelaporan</a></li> {/* Menggunakan link rute aktual */}
              <li><a href="/peta" className="hover:text-cyan-400 transition-colors">Peta Interaktif</a></li> {/* Menggunakan link rute aktual */}
              <li><a href="/pesandigital" className="hover:text-cyan-400 transition-colors">Komunitas</a></li> {/* Menggunakan link rute aktual */}
              {/* Tambah link lain jika ada: /acara, /companion */}
            </ul>
          </div>

          {/* Navigasi Dukungan */}
          <div>
            <h4 className="font-semibold mb-4">Dukungan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Bantuan</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Kontak</a></li>
            </ul>
          </div>

          {/* Ikuti Kami */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              {/* Contoh icon media sosial (bisa diganti dengan icon dari Lucide jika ada) */}
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 transition-colors cursor-pointer">
                  <span className="text-xs">IG</span>
                </div>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-cyan-500/20 transition-colors cursor-pointer">
                  <span className="text-xs">TW</span>
                </div>
              </a>
              {/* Tambahkan lebih banyak link media sosial di sini */}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
          © 2025 RiverClean. Dibuat dengan 💙 untuk Indonesia.
        </div>
      </div>
    </footer>
  );
}