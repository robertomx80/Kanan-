import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Settings,
  Users,
  Activity,
  LogOut,
  Home
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tiendas', href: '/admin/stores', icon: Store },
    { name: 'Configuración', href: '/admin/config', icon: Settings },
    { name: 'Trabajos', href: '/admin/jobs', icon: Activity },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <h1 className="text-xl font-bold text-white">Panel Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1
                  ${
                    isActive(item.href)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 w-64 p-4 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.[0] || user?.email[0].toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {user?.firstName || 'Admin'}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <Link
              to="/dashboard"
              className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
            >
              <Home className="w-4 h-4 mr-1" />
              Usuario
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
