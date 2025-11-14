import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Crown, User, Mail, Trash2, Shield } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  subscription?: {
    plan: 'FREE' | 'PREMIUM';
    status: string;
  };
  _count?: {
    productTrackings: number;
    priceAlerts: number;
    notifications: number;
  };
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'premium' | 'free'>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getAllUsers();
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return;

    try {
      await adminApi.updateUserRole(userId, newRole);
      toast.success('Rol actualizado correctamente');
      fetchUsers();
    } catch (error: any) {
      toast.error('Error al actualizar rol: ' + error.response?.data?.message);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;

    try {
      await adminApi.deleteUser(userId);
      toast.success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.response?.data?.message);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'admin') return user.role === 'ADMIN';
    if (filter === 'premium') return user.subscription?.plan === 'PREMIUM';
    if (filter === 'free') return user.subscription?.plan === 'FREE';
    return true;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    premium: users.filter((u) => u.subscription?.plan === 'PREMIUM').length,
    free: users.filter((u) => u.subscription?.plan === 'FREE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-1">Administra usuarios y sus roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium</p>
              <p className="text-2xl font-bold text-orange-600">{stats.premium}</p>
            </div>
            <Crown className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Free</p>
              <p className="text-2xl font-bold text-gray-600">{stats.free}</p>
            </div>
            <User className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admins ({stats.admins})
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'premium'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Premium ({stats.premium})
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'free'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Free ({stats.free})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seguimientos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : 'Sin nombre'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.isEmailVerified ? (
                          <span className="text-green-600">✓ Verificado</span>
                        ) : (
                          <span className="text-gray-400">No verificado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.role === 'ADMIN' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        ADMIN
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        USER
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.subscription?.plan === 'PREMIUM'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {user.subscription?.plan === 'PREMIUM' ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        PREMIUM
                      </>
                    ) : (
                      'FREE'
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user._count?.productTrackings || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleUpdateRole(user.id, user.role)}
                    className="text-purple-600 hover:text-purple-900 mr-3"
                    title={`Cambiar a ${user.role === 'ADMIN' ? 'USER' : 'ADMIN'}`}
                  >
                    <Shield className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
            <p className="text-gray-600">No se encontraron usuarios con este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
