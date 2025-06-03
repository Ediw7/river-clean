import { Link } from 'react-router-dom';

export default function SidebarAdmin() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4 fixed">
      <h2 className="text-2xl font-bold mb-6">Admin</h2>
      <ul className="space-y-2">
        <li>
          <Link to="/admin/dasbor" className="block p-2 hover:bg-gray-700 rounded">Dasbor</Link>
        </li>
        <li>
          <Link to="/admin/verifikasi" className="block p-2 hover:bg-gray-700 rounded">Verifikasi</Link>
        </li>
        <li>
          <Link to="/admin/acara" className="block p-2 hover:bg-gray-700 rounded">Acara</Link>
        </li>
        <li>
          <Link to="/admin/konten" className="block p-2 hover:bg-gray-700 rounded">Konten</Link>
        </li>
        <li>
          <Link to="/admin/tantangan" className="block p-2 hover:bg-gray-700 rounded">Tantangan</Link>
        </li>
      </ul>
    </div>
  );
}