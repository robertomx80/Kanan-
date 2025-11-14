import { useEffect, useState } from 'react';
import { subscriptionsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Check, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    if (isAuthenticated) {
      loadCurrentSubscription();
    }
  }, [isAuthenticated]);

  const loadPlans = async () => {
    try {
      const response = await subscriptionsApi.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await subscriptionsApi.getCurrent();
      setCurrentSubscription(response.data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión primero');
      navigate('/login');
      return;
    }

    try {
      const response = await subscriptionsApi.upgrade();
      toast.success(response.data.message);
      loadCurrentSubscription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar suscripción');
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      return;
    }

    try {
      const response = await subscriptionsApi.cancel();
      toast.success(response.data.message);
      loadCurrentSubscription();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar suscripción');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Elige tu Plan</h1>
        <p className="text-xl text-gray-600">
          Comienza gratis y actualiza cuando estés listo
        </p>
      </div>

      {currentSubscription && (
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-primary-800">Plan Actual</p>
              <p className="text-2xl font-bold text-primary-900">
                {currentSubscription.plan === 'FREE' ? 'Gratuito' : 'Premium'}
              </p>
            </div>
            {currentSubscription.plan === 'PREMIUM' && (
              <button onClick={handleCancel} className="btn btn-danger">
                Cancelar Suscripción
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan === plan.id.toUpperCase();
          const isPremium = plan.id === 'premium';

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 ${
                isPremium
                  ? 'border-4 border-primary-600 shadow-2xl relative'
                  : 'border-2 border-gray-200 shadow-lg'
              }`}
            >
              {isPremium && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-2 rounded-full font-bold flex items-center">
                  <Crown className="w-5 h-5 mr-2" />
                  Recomendado
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold">${plan.price / 100}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className={`w-5 h-5 mr-3 flex-shrink-0 ${
                        isPremium ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                >
                  Plan Actual
                </button>
              ) : isPremium ? (
                <button onClick={handleUpgrade} className="btn btn-primary w-full text-lg py-3">
                  Actualizar a Premium
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-secondary w-full opacity-50 cursor-not-allowed"
                >
                  Plan Gratuito
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card bg-gray-50 max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-4">Preguntas Frecuentes</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold">¿Puedo cambiar de plan en cualquier momento?</p>
            <p className="text-gray-600">
              Sí, puedes actualizar o cancelar tu suscripción en cualquier momento.
            </p>
          </div>
          <div>
            <p className="font-semibold">¿Qué métodos de pago aceptan?</p>
            <p className="text-gray-600">
              Aceptamos tarjetas de crédito, débito y otros métodos de pago locales.
            </p>
          </div>
          <div>
            <p className="font-semibold">¿Hay garantía de devolución?</p>
            <p className="text-gray-600">
              Sí, ofrecemos garantía de devolución de 30 días sin preguntas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
