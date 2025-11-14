import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo?: string;
  isActive: boolean;
  scrapingSelector?: string;
  _count?: {
    prices: number;
  };
}

const AdminStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    website: '',
    logo: '',
    isActive: true,
    scrapingSelector: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await adminApi.getStores();
      setStores(response.data);
    } catch (error: any) {
      toast.error('Error al cargar tiendas: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await adminApi.updateStore(editingStore.id, formData);
        toast.success('Tienda actualizada correctamente');
      } else {
        await adminApi.createStore(formData);
        toast.success('Tienda creada correctamente');
      }
      setShowModal(false);
      setEditingStore(null);
      resetForm();
      fetchStores();
    } catch (error: any) {
      toast.error('Error: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tienda?')) return;
    try {
      await adminApi.deleteStore(id);
      toast.success('Tienda eliminada correctamente');
      fetchStores();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.response?.data?.message);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      slug: store.slug,
      website: store.website,
      logo: store.logo || '',
      isActive: store.isActive,
      scrapingSelector: store.scrapingSelector || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      website: '',
      logo: '',
      isActive: true,
      scrapingSelector: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStore(null);
    resetForm();
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Tiendas</h1>
          <p className="text-gray-600 mt-1">Administra las tiendas para scraping</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Tienda
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-12 h-12 object-contain mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                    <Globe className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  <p className="text-xs text-gray-500">{store.slug}</p>
                </div>
              </div>
              <div>
                {store.isActive ? (
                  <ToggleRight className="w-6 h-6 text-green-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Website:</p>
              <a
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate block"
              >
                {store.website}
              </a>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Precios: {store._count?.prices || 0}</span>
              <span className={store.isActive ? 'text-green-600' : 'text-gray-400'}>
                {store.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(store)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(store.id)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tiendas</h3>
          <p className="text-gray-600 mb-4">Crea tu primera tienda para comenzar</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nueva Tienda
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingStore ? 'Editar Tienda' : 'Nueva Tienda'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="amazon-mx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website *
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="https://www.amazon.com.mx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Logo
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selectores Scraping (JSON)
                </label>
                <textarea
                  value={formData.scrapingSelector}
                  onChange={(e) =>
                    setFormData({ ...formData, scrapingSelector: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder='{"price": ".price-class", "title": "#product-title"}'
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Tienda activa
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStore ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
