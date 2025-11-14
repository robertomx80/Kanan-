import { Link } from 'react-router-dom';
import { Search, TrendingDown, Bell, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Encuentra los Mejores Precios en
          <span className="text-primary-600"> México</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Rastrea productos en múltiples tiendas y recibe notificaciones cuando el precio baje.
          Ahorra tiempo y dinero con nuestro sistema inteligente.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
            Comenzar Gratis
          </Link>
          <Link to="/products" className="btn btn-secondary text-lg px-8 py-3">
            Ver Productos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            icon: <Search className="w-8 h-8" />,
            title: 'Búsqueda Inteligente',
            description: 'Encuentra productos en múltiples tiendas con un solo clic',
          },
          {
            icon: <TrendingDown className="w-8 h-8" />,
            title: 'Comparación de Precios',
            description: 'Compara precios en tiempo real y encuentra el mejor deal',
          },
          {
            icon: <Bell className="w-8 h-8" />,
            title: 'Alertas de Precio',
            description: 'Recibe notificaciones cuando el precio baje',
          },
          {
            icon: <BarChart3 className="w-8 h-8" />,
            title: 'Historial de Precios',
            description: 'Visualiza gráficas de evolución de precios',
          },
        ].map((feature, index) => (
          <div key={index} className="card text-center">
            <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-2xl shadow-lg p-12">
        <h2 className="text-3xl font-bold text-center mb-12">Planes y Precios</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="border-2 border-gray-200 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Gratis</h3>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-600">/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">✓ Rastrea 1 producto</li>
              <li className="flex items-center">✓ Notificaciones por email</li>
              <li className="flex items-center">✓ Historial de 30 días</li>
              <li className="flex items-center">✓ Comparación básica</li>
            </ul>
            <Link to="/register" className="btn btn-secondary w-full">
              Comenzar Gratis
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="border-2 border-primary-600 rounded-xl p-8 relative">
            <div className="absolute -top-4 right-4 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Recomendado
            </div>
            <h3 className="text-2xl font-bold mb-4">Premium</h3>
            <div className="text-4xl font-bold mb-6">
              $99<span className="text-lg text-gray-600">/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-primary-600 font-medium">
                ✓ Productos ilimitados
              </li>
              <li className="flex items-center">✓ Notificaciones instantáneas</li>
              <li className="flex items-center">✓ Historial completo</li>
              <li className="flex items-center">✓ Alertas personalizadas</li>
              <li className="flex items-center">✓ Estadísticas avanzadas</li>
              <li className="flex items-center">✓ Acceso prioritario</li>
            </ul>
            <Link to="/register" className="btn btn-primary w-full">
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
