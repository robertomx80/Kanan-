import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Search, User, LogOut, LayoutDashboard, CreditCard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">PriceTracker</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              Productos
            </Link>
            <Link to="/subscription" className="text-gray-600 hover:text-gray-900">
              Planes
            </Link>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>

                {user?.subscription?.plan === 'PREMIUM' && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-semibold rounded-full">
                    Premium
                  </span>
                )}

                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600 hidden md:inline">
                    {user?.firstName || user?.email}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
