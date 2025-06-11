import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Droplets, Users, MapPin, Award, ChevronDown, Lock, Camera, Calendar, MessageCircle, Heart } from 'lucide-react'; // Tambah Heart jika dipakai
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 sm:w-64 sm:h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Header />

      <main className="relative z-10">

        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative">
          <div 
            className="text-center max-w-6xl mx-auto w-full"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >

            <div 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-cyan-500/30 rounded-full px-4 sm:px-6 py-2 mb-4 mt-16 sm:mt-20 animate-pulse"
          >
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-xs sm:text-sm font-medium text-cyan-300">Revolusi Pelestarian Sungai Indonesia</span>
          </div>


            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 leading-tight px-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                River
              </span>
              <span className="text-white">Clean</span>
            </h1>


            <p className="text-base sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Platform <span className="text-cyan-400 font-semibold">berbasis komunitas</span> yang memberdayakan masyarakat 
              untuk melawan pencemaran sungai melalui teknologi cerdas dan aksi nyata
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button 
                onClick={() => navigate('/register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
              >
                <span className="relative z-10">🚀 Mulai Sekarang</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button 
                onClick={() => navigate('/login')} 
                className="group px-8 py-4 bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-slate-700/50 hover:border-cyan-500/50"
              >
                <span className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Login</span>
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { number: "Aktif", label: "Pengguna", icon: Users },
                { number: "Pantau", label: "Lokasi", icon: MapPin },
                { number: "Bersih", label: "Sungai", icon: Droplets },
                { number: "Terlibat", label: "Komunitas", icon: Award }
              ].map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl mb-3 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

  
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 px-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Fitur Revolusioner
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto px-4">
                Teknologi canggih yang mengubah cara kita menyelamatkan sungai Indonesia
              </p>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
  {[
    {
      title: "📸 Pelaporan Pencemaran",
      desc: "Unggah foto, deskripsi, dan lokasi limbah. Laporan diverifikasi oleh admin untuk tindak lanjut.",
      icon: Camera,
      gradient: "from-red-500/20 to-orange-500/20",
      gridPlacement: "" 
    },
    {
      title: "🗺️ Peta Sungai Interaktif",
      desc: "Visualisasi kondisi sungai dengan kode warna dan heatmap polusi.",
      icon: MapPin,
      gradient: "from-blue-500/20 to-cyan-500/20",
      gridPlacement: "" 
    },
    {
      title: "📅 Koordinasi Event",
      desc: "Kalender acara pembersihan. Daftar sebagai relawan dan dapatkan notifikasi kegiatan lokal.",
      icon: Calendar,
      gradient: "from-emerald-500/20 to-green-500/20",
      gridPlacement: "" 
    },
    {
      title: "💖 River Companion",
      desc: "Peliharaan virtual yang tumbuh seiring kontribusi Anda melaporkan dan merawat sungai.",
      icon: Heart,
      gradient: "from-pink-500/20 to-rose-500/20",
      gridPlacement: "sm:col-span-2 lg:col-span-1 lg:col-start-1 lg:col-end-4 lg:flex lg:justify-center"
    },
    {
      title: "💬 Komunitas Digital",
      desc: "Kirim pesan dan berdiskusi tentang sungai, membangun rasa komunitas dan kolaborasi.",
      icon: MessageCircle,
      gradient: "from-purple-500/20 to-indigo-500/20",
      gridPlacement: "" 
    }
  ].map((feature, index) => {
    if (feature.title === "💖 River Companion") {
      return (
        <div key={index} className="sm:col-span-2 lg:col-span-3 flex flex-col lg:flex-row justify-center gap-6 sm:gap-8">
          <div
            className={`group p-6 sm:p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-md border border-gray-800/50 rounded-2xl sm:rounded-3xl hover:scale-105 transition-all duration-300 hover:border-cyan-500/30 w-full lg:w-1/3`}
          >
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl mb-3 sm:mb-4 group-hover:bg-white/20 transition-all duration-300">
              <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{feature.title}</h3>
            <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
          </div>
          
          {
            [
              {
                title: "💬 Komunitas Digital",
                desc: "Kirim pesan dan berdiskusi tentang sungai, membangun rasa komunitas dan kolaborasi.",
                icon: MessageCircle,
                gradient: "from-purple-500/20 to-indigo-500/20"
              }
            ].map((komunitasFeature, komunitasIndex) => (
              <div
                key={komunitasIndex}
                className={`group p-6 sm:p-8 bg-gradient-to-br ${komunitasFeature.gradient} backdrop-blur-md border border-gray-800/50 rounded-2xl sm:rounded-3xl hover:scale-105 transition-all duration-300 hover:border-cyan-500/30 w-full lg:w-1/3`}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl mb-3 sm:mb-4 group-hover:bg-white/20 transition-all duration-300">
                  <komunitasFeature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{komunitasFeature.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{komunitasFeature.desc}</p>
              </div>
            ))
          }
        </div>
      );
    } else if (feature.title === "💬 Komunitas Digital") {
      // Jangan render Komunitas Digital di sini karena sudah dirender bersama River Companion
      return null;
    } else {
      // Render card lainnya seperti biasa
      return (
        <div
          key={index}
          className={`group p-6 sm:p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-md border border-gray-800/50 rounded-2xl sm:rounded-3xl hover:scale-105 transition-all duration-300 hover:border-cyan-500/30 ${feature.gridPlacement}`}
        >
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl mb-3 sm:mb-4 group-hover:bg-white/20 transition-all duration-300">
            <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{feature.title}</h3>
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
        </div>
      );
    }
  })}
</div>
          </div>
        </section>

        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                Siap Jadi <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Pahlawan Sungai</span>?
              </h2>
              <p className="text-base sm:text-xl text-slate-300 mb-6 sm:mb-8 leading-relaxed px-2">
                Bergabunglah dengan ribuan *changemaker* yang sudah berkomitmen menyelamatkan sungai Indonesia. 
                Mulai perjalanan Anda hari ini!
              </p>
              <div className="flex flex-col gap-4 justify-center px-2">
                <button 
                  onClick={() => navigate('/register')} 
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
                >
                  🌊 Daftar Gratis
                </button>
                <button 
                  onClick={() => navigate('/login')} 
                  className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-slate-800/50 backdrop-blur-md border border-slate-600 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-slate-700/50"
                >
                  Masuk Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}