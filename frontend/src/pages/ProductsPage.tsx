import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import { Product } from '../types';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, [query]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.search({ query, limit: 20 });
      setProducts(response.data.data);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Catálogo de Productos</h1>
        <p className="text-gray-600">Busca y compara precios en múltiples tiendas</p>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="input pl-12"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron productos
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.mainImage || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                )}
                {product.lowestPrice && (
                  <div className="mt-auto">
                    <p className="text-sm text-gray-600">Desde</p>
                    <p className="text-2xl font-bold text-primary-600">
                      ${product.lowestPrice.toFixed(2)}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {meta && (
            <div className="text-center text-gray-600">
              Mostrando {products.length} de {meta.total} productos
            </div>
          )}
        </>
      )}
    </div>
  );
}
