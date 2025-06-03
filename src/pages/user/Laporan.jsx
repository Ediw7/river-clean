import { useState, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Droplets,
  Clock,
  User,
  Bell,
  Settings,
  ArrowLeft,
  Send,
  FileImage,
  Zap,
  Lightbulb,
  Globe,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit3,
  Trash2
} from 'lucide-react';
import NavbarUser from '../../components/NavbarUser';


export default function UserLaporan() {
  const [activeTab, setActiveTab] = useState('buat-laporan');
  const [selectedImages, setSelectedImages] = useState([]);
  const [reportType, setReportType] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef(null);

  // Data dummy untuk laporan yang sudah dibuat
  const myReports = [
    {
      id: 1,
      title: "Pencemaran Plastik di Sungai Citarum",
      location: "Jl. Raya Dayeuhkolot, Bandung",
      type: "Plastik",
      status: "Under Review",
      date: "2025-06-01",
      description: "Banyak sampah plastik menumpuk di bantaran sungai",
      image: "/api/placeholder/300/200",
      suggestions: ["Bawa sampah plastik ke bank sampah terdekat", "Koordinasi dengan RT/RW setempat"]
    },
    {
      id: 2,
      title: "Limbah Minyak di Sungai Ciliwung",
      location: "Depok, Jawa Barat",
      type: "Minyak",
      status: "Processed",
      date: "2025-05-28",
      description: "Terlihat lapisan minyak di permukaan air sungai",
      image: "/api/placeholder/300/200",
      suggestions: ["Laporkan ke Dinas Lingkungan Hidup", "Dokumentasi sebagai bukti"]
    },
    {
      id: 3,
      title: "Sampah Organik Menumpuk",
      location: "Sungai Brantas, Malang",
      type: "Organik",
      status: "Verified",
      date: "2025-05-25",
      description: "Sampah daun dan ranting menumpuk hingga menyumbat aliran",
      image: "/api/placeholder/300/200",
      suggestions: ["Buat kompos dari sampah organik", "Gotong royong pembersihan"]
    }
  ];

  const pollutionTypes = [
    { value: 'plastik', label: '🛍️ Sampah Plastik', color: 'red' },
    { value: 'minyak', label: '🛢️ Limbah Minyak', color: 'orange' },
    { value: 'kimia', label: '🧪 Limbah Kimia', color: 'purple' },
    { value: 'organik', label: '🍃 Sampah Organik', color: 'green' },
    { value: 'logam', label: '⚙️ Sampah Logam', color: 'gray' },
    { value: 'tekstil', label: '👕 Limbah Tekstil', color: 'blue' }
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleTypeChange = (type) => {
    setReportType(type);
    
    // Generate suggestions based on pollution type
    const suggestionMap = {
      'plastik': [
        "Kumpulkan sampah plastik dan bawa ke bank sampah terdekat",
        "Gunakan aplikasi waste4change untuk pickup sampah",
        "Koordinasi dengan RT/RW untuk gotong royong pembersihan"
      ],
      'minyak': [
        "Segera laporkan ke Dinas Lingkungan Hidup setempat",
        "Jangan menyentuh limbah minyak secara langsung",
        "Dokumentasi kejadian untuk bukti pelaporan"
      ],
      'kimia': [
        "BAHAYA! Jangan dekati area pencemaran",
        "Laporkan segera ke BPBD dan Dinas Lingkungan",
        "Evakuasi warga sekitar jika diperlukan"
      ],
      'organik': [
        "Kumpulkan untuk dijadikan kompos",
        "Organisir gotong royong pembersihan",
        "Edukasi warga tentang pembuangan sampah yang benar"
      ],
      'logam': [
        "Kumpulkan dan jual ke pengepul besi tua",
        "Hati-hati dengan benda tajam atau berkarat",
        "Koordinasi dengan petugas kebersihan"
      ],
      'tekstil': [
        "Donasikan pakaian yang masih layak",
        "Daur ulang menjadi kain lap atau produk lain",
        "Kumpulkan untuk bank sampah"
      ]
    };
    
    setSuggestions(suggestionMap[type] || []);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      
      // Reset form
      setSelectedImages([]);
      setReportType('');
      setLocation('');
      setDescription('');
      setSuggestions([]);
    }, 2000);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        () => {
          alert('Tidak dapat mengakses lokasi. Mohon masukkan lokasi secara manual.');
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/20 to-cyan-950/30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">RiverClean</span>
              </div>
<NavbarUser />

              
            

            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors" />
              <div className="flex items-center space-x-3 bg-slate-800/50 backdrop-blur-md rounded-full px-4 py-2 border border-slate-700">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">Andi Pratama</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 relative z-10">
        {/* Page Header */}
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Laporan</span> Pencemaran
              </h1>
              <p className="text-xl text-slate-400">Laporkan pencemaran sungai dan bantu menjaga lingkungan 🌊</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-2xl p-2">
                {[
                  { id: 'buat-laporan', label: 'Buat Laporan', icon: Camera },
                  { id: 'laporan-saya', label: 'Laporan Saya', icon: FileImage }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === 'buat-laporan' && (
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Form Section */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center">
                      <Camera className="w-6 h-6 text-cyan-400 mr-3" />
                      Form Pelaporan
                    </h2>

                    {/* Photo Upload */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        📸 Upload Foto Pencemaran *
                      </label>
                      
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all duration-300 cursor-pointer group"
                      >
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
                        <p className="text-slate-400 group-hover:text-slate-300">
                          Klik untuk upload foto atau drag & drop di sini
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Maksimal 5 foto, format JPG/PNG, ukuran max 5MB
                        </p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {/* Image Preview */}
                      {selectedImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedImages.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-xl border border-slate-600"
                              />
                              <button
                                onClick={() => removeImage(image.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pollution Type */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        🏷️ Jenis Pencemaran *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {pollutionTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => handleTypeChange(type.value)}
                            className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                              reportType === type.value
                                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                                : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            <div className="font-medium text-sm">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        📍 Lokasi Pencemaran *
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Masukkan alamat atau koordinat..."
                          className="flex-1 bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={getCurrentLocation}
                          className="px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/30 transition-all duration-300 flex items-center"
                        >
                          <MapPin className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        📝 Deskripsi Detail *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Jelaskan kondisi pencemaran yang Anda temukan..."
                        rows={4}
                        className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleSubmit}
                      disabled={!reportType || !location || !description || selectedImages.length === 0 || isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Mengirim Laporan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Kirim Laporan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="space-y-6">
                  
                  {/* AI Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center text-emerald-400">
                        <Lightbulb className="w-6 h-6 mr-3" />
                        Saran AI
                      </h3>
                      <div className="space-y-3">
                        {suggestions.map((suggestion, index) => (
                          <div key={index} className="bg-slate-900/50 rounded-xl p-4 border border-emerald-500/20">
                            <p className="text-sm text-slate-300">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Zap className="w-6 h-6 text-cyan-400 mr-3" />
                      Tips Pelaporan
                    </h3>
                    <div className="space-y-3 text-sm text-slate-400">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Ambil foto dari berbagai sudut untuk dokumentasi lengkap</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Pastikan lokasi GPS akurat untuk memudahkan tindak lanjut</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Berikan deskripsi yang detail dan objektif</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span>Jangan sentuh limbah berbahaya secara langsung</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-4">📊 Statistik Hari Ini</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Laporan</span>
                        <span className="text-cyan-400 font-semibold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Terverifikasi</span>
                        <span className="text-green-400 font-semibold">892</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Dalam Proses</span>
                        <span className="text-yellow-400 font-semibold">355</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'laporan-saya' && (
              <div>
                {/* Filter & Search */}
                <div className="mb-8 flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari laporan..."
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <select className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none">
                      <option>Semua Status</option>
                      <option>Under Review</option>
                      <option>Processed</option>
                      <option>Verified</option>
                    </select>
                    <button className="px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-slate-400 hover:text-cyan-400 transition-colors">
                      <Filter className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Reports Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myReports.map((report) => (
                    <div key={report.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group">
                      <div className="aspect-video bg-slate-800 relative overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-slate-500" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Processed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            report.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                          {report.title}
                        </h3>
                        <div className="flex items-center text-sm text-slate-400 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.location}
                        </div>
                        <div className="flex items-center text-sm text-slate-400 mb-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(report.date).toLocaleDateString('id-ID')}
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {report.description}
                        </p>

                        {/* Suggestions Preview */}
                        {report.suggestions && report.suggestions.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-emerald-400 mb-2 flex items-center">
                              <Lightbulb className="w-3 h-3 mr-1" />
                              Saran AI:
                            </p>
                            <p className="text-xs text-slate-400 bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20">
                              {report.suggestions[0]}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300 flex items-center justify-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>Detail</span>
                          </button>
                          <button className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all duration-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Laporan Berhasil Dikirim!</h3>
            <p className="text-slate-400 mb-6">
              Terima kasih atas kontribusi Anda. Tim kami akan segera memverifikasi laporan ini.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-6 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white hover:bg-slate-700 transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('laporan-saya');
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white hover:scale-105 transition-all duration-300"
              >
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}