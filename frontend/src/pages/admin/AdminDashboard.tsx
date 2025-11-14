import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Package, Store, TrendingUp, Crown, UserCheck } from 'lucide-react';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalStores: number;
    totalPrices: number;
    activeTrackings: number;
    premiumUsers: number;
    freeUsers: number;
  };
  recentActivity: {
    users: any[];
    products: any[];
  };
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setStats(response.data);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      name: 'Usuarios Totales',
      value: stats.stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Productos',
      value: stats.stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      name: 'Tiendas Activas',
      value: stats.stats.totalStores,
      icon: Store,
      color: 'bg-purple-500',
    },
    {
      name: 'Seguimientos Activos',
      value: stats.stats.activeTrackings,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      name: 'Usuarios Premium',
      value: stats.stats.premiumUsers,
      icon: Crown,
      color: 'bg-orange-500',
    },
    {
      name: 'Usuarios Free',
      value: stats.stats.freeUsers,
      icon: UserCheck,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Usuarios Recientes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName || user.email}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {stats.recentActivity.users.length === 0 && (
                <p className="text-sm text-gray-500">No hay usuarios recientes</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Productos Recientes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.slug}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {stats.recentActivity.products.length === 0 && (
                <p className="text-sm text-gray-500">No hay productos recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total de Precios Registrados</p>
            <p className="text-2xl font-bold text-gray-900">{stats.stats.totalPrices}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ratio Premium/Free</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.stats.freeUsers > 0
                ? ((stats.stats.premiumUsers / stats.stats.freeUsers) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Promedio Seguimientos/Usuario</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.stats.totalUsers > 0
                ? (stats.stats.activeTrackings / stats.stats.totalUsers).toFixed(1)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
