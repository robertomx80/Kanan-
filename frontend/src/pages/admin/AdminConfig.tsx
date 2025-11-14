import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Settings, Save } from 'lucide-react';

interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminConfig = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
  });

  // Configuraciones predefinidas comunes
  const commonConfigs = [
    {
      key: 'SCRAPER_INTERVAL',
      value: '21600000',
      description: 'Intervalo de scraping en milisegundos (6 horas = 21600000ms)',
    },
    {
      key: 'ALERT_CHECK_INTERVAL',
      value: '1800000',
      description: 'Intervalo de verificación de alertas en milisegundos (30 min = 1800000ms)',
    },
    {
      key: 'CLEANUP_INTERVAL',
      value: '86400000',
      description: 'Intervalo de limpieza en milisegundos (24 horas = 86400000ms)',
    },
    {
      key: 'MAX_RETRIES',
      value: '3',
      description: 'Número máximo de reintentos para scraping',
    },
    {
      key: 'REQUEST_TIMEOUT',
      value: '30000',
      description: 'Timeout de requests en milisegundos (30 seg = 30000ms)',
    },
    {
      key: 'DELAY_BETWEEN_REQUESTS',
      value: '2000',
      description: 'Delay entre requests en milisegundos (2 seg = 2000ms)',
    },
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await adminApi.getConfigs();
      setConfigs(response.data);
    } catch (error: any) {
      toast.error('Error al cargar configuraciones: ' + error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await adminApi.updateConfig(editingConfig.key, formData);
        toast.success('Configuración actualizada correctamente');
      } else {
        await adminApi.createConfig(formData);
        toast.success('Configuración creada correctamente');
      }
      setShowModal(false);
      setEditingConfig(null);
      resetForm();
      fetchConfigs();
    } catch (error: any) {
      toast.error('Error: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm('¿Estás seguro de eliminar esta configuración?')) return;
    try {
      await adminApi.deleteConfig(key);
      toast.success('Configuración eliminada correctamente');
      fetchConfigs();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.response?.data?.message);
    }
  };

  const handleEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setFormData({
      key: config.key,
      value: config.value,
      description: config.description || '',
    });
    setShowModal(true);
  };

  const handleQuickAdd = (config: any) => {
    setFormData(config);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingConfig(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-1">
            Administra intervalos de scraping y parámetros del sistema
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Configuración
        </button>
      </div>

      {/* Quick Add Common Configs */}
      {configs.length === 0 && (
        <div className="mb-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Configuraciones Recomendadas
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Agrega rápidamente configuraciones comunes del sistema:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {commonConfigs.map((config) => (
              <button
                key={config.key}
                onClick={() => handleQuickAdd(config)}
                className="text-left p-3 bg-white rounded border border-blue-200 hover:border-blue-400 hover:shadow"
              >
                <p className="font-medium text-sm text-gray-900">{config.key}</p>
                <p className="text-xs text-gray-500 mt-1 truncate">{config.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Configs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clave
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actualizado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Settings className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{config.key}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {config.value}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{config.description || '-'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(config.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => handleEdit(config)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(config.key)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {configs.length === 0 && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay configuraciones
            </h3>
            <p className="text-gray-600">Crea tu primera configuración para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clave (KEY) *
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingConfig}
                  placeholder="SCRAPER_INTERVAL"
                />
                {editingConfig && (
                  <p className="text-xs text-gray-500 mt-1">La clave no se puede cambiar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="21600000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la configuración"
                />
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
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingConfig ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminConfig;
