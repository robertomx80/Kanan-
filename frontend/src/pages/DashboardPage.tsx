import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackingApi, usersApi } from '../services/api';
import { ProductTracking } from '../types';
import { TrendingDown, TrendingUp, Bell, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [tracking, setTracking] = useState<ProductTracking[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trackingRes, statsRes] = await Promise.all([
        trackingApi.getMyTracking(),
        usersApi.getStats(),
      ]);
      setTracking(trackingRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleUntrack = async (id: string) => {
    if (!confirm('¿Dejar de rastrear este producto?')) return;

    try {
      await trackingApi.untrackProduct(id);
      toast.success('Producto eliminado del seguimiento');
      loadData();
    } catch (error: any) {
      toast.error('Error al eliminar el seguimiento');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Gestiona tus productos y alertas</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos Rastreados</p>
                <p className="text-3xl font-bold mt-1">{stats.trackedProducts}</p>
              </div>
              <Package className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas Activas</p>
                <p className="text-3xl font-bold mt-1">{stats.activeAlerts}</p>
              </div>
              <Bell className="w-12 h-12 text-yellow-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notificaciones</p>
                <p className="text-3xl font-bold mt-1">{stats.notifications}</p>
              </div>
              <Bell className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tracked Products */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productos Rastreados</h2>
          <Link to="/products" className="btn btn-primary">
            + Agregar Producto
          </Link>
        </div>

        {tracking.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No estás rastreando ningún producto</p>
            <Link to="/products" className="text-primary-600 hover:underline mt-2 inline-block">
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tracking.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    <img
                      src={item.product.mainImage || 'https://via.placeholder.com/100'}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-semibold hover:text-primary-600"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{item.product.brand}</p>

                      {item.priceChange !== null && (
                        <div className="flex items-center mt-2">
                          {item.priceChange < 0 ? (
                            <>
                              <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                              <span className="text-green-600 font-medium">
                                {Math.abs(item.priceChange).toFixed(2)}% de descuento
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                              <span className="text-red-600 font-medium">
                                +{item.priceChange.toFixed(2)}%
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {item.lowestCurrentPrice && (
                      <div>
                        <p className="text-2xl font-bold text-primary-600">
                          ${item.lowestCurrentPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Precio más bajo</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleUntrack(item.id)}
                      className="text-sm text-red-600 hover:underline mt-2"
                    >
                      Dejar de rastrear
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
