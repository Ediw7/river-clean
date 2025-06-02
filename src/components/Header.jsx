import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold text-[#1E40AF]">RiverClean</h1>
      <nav>
        <Link to="/login" className="mr-4">
          <button className="px-4 py-2 bg-[#1E40AF] text-white rounded hover:bg-blue-700">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="px-4 py-2 bg-[#16A34A] text-white rounded hover:bg-green-700">
            Register
          </button>
        </Link>
      </nav>
    </header>
  );
}