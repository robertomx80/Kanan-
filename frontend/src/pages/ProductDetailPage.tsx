import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi, trackingApi } from '../services/api';
import { Product, Price } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Bell, ShoppingCart, Store } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const [productRes, pricesRes, historyRes] = await Promise.all([
        productsApi.getById(id!),
        productsApi.getCurrentPrices(id!),
        productsApi.getPriceHistory(id!, 30),
      ]);

      setProduct(productRes.data);
      setPrices(pricesRes.data);
      setPriceHistory(historyRes.data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para rastrear productos');
      return;
    }

    try {
      await trackingApi.trackProduct(id!);
      toast.success('Producto agregado al seguimiento');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rastrear producto');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Producto no encontrado</div>;
  }

  const lowestPrice = prices.length > 0
    ? prices.reduce((min, p) => p.price < min.price ? p : min)
    : null;

  return (
    <div className="space-y-8">
      {/* Product Info */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.mainImage || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            {product.brand && (
              <p className="text-xl text-gray-600">{product.brand}</p>
            )}
          </div>

          {lowestPrice && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <p className="text-sm text-green-800 mb-2">Mejor Precio Encontrado</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-green-600">
                  ${lowestPrice.price.toFixed(2)}
                </span>
                <span className="text-gray-600 ml-2">MXN</span>
              </div>
              <p className="text-sm text-green-800 mt-2">
                en {lowestPrice.store.name}
              </p>
              <a
                href={lowestPrice.store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-full mt-4 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Ver en {lowestPrice.store.name}
              </a>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleTrack}
              className="btn btn-secondary flex-1 flex items-center justify-center"
            >
              <TrendingDown className="w-5 h-5 mr-2" />
              Rastrear Precio
            </button>
            <button className="btn btn-secondary flex-1 flex items-center justify-center">
              <Bell className="w-5 h-5 mr-2" />
              Crear Alerta
            </button>
          </div>

          {product.description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Descripción</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {product.features && product.features.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Características</h2>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="text-primary-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Price Comparison */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <Store className="w-6 h-6 mr-2" />
          Comparación de Precios
        </h2>

        {prices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay precios disponibles en este momento
          </p>
        ) : (
          <div className="space-y-3">
            {prices
              .sort((a, b) => a.price - b.price)
              .map((price, index) => (
                <div
                  key={price.id}
                  className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                    index === 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {price.store.logo && (
                      <img
                        src={price.store.logo}
                        alt={price.store.name}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{price.store.name}</p>
                      <p className="text-sm text-gray-600">
                        {price.isAvailable ? 'Disponible' : 'No disponible'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ${price.price.toFixed(2)}
                    </p>
                    {index === 0 && (
                      <span className="text-sm text-green-600 font-medium">
                        Mejor precio
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Price History Chart */}
      {priceHistory.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Historial de Precios (30 días)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="createdAt"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('es-MX', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
              />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Precio']}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString('es-MX')
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
