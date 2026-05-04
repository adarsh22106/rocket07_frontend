'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { configAPI } from '@/utils/api';

interface CartItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface ProfileData {
  name: string;
  phone: string;
}

const normalizeCart = (value: string | null) => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<Record<string, CartItem>>((acc, [key, item]) => {
      const cartItem = item as Partial<CartItem>;
      const quantity = Number(cartItem.quantity);
      const price = Number(cartItem.price);

      if (
        typeof key === 'string' &&
        typeof cartItem.name === 'string' &&
        typeof cartItem.unit === 'string' &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        Number.isFinite(price)
      ) {
        acc[key] = {
          name: cartItem.name,
          quantity,
          price,
          unit: cartItem.unit,
        };
      }

      return acc;
    }, {});
  } catch {
    return {};
  }
};

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<Record<string, CartItem>>({});
  const [profile, setProfile] = useState<ProfileData>({ name: '', phone: '' });
  const [deliveryCharge, setDeliveryCharge] = useState(9);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setCartItems(normalizeCart(localStorage.getItem('delivery_cart')));

    const savedProfile = localStorage.getItem('delivery_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch {
        localStorage.removeItem('delivery_profile');
      }
    }

    setCartHydrated(true);
  }, []);

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await configAPI.getConfig();
        setDeliveryCharge(data.data.delivery_charge);
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !cartHydrated) return;
    localStorage.setItem('delivery_cart', JSON.stringify(cartItems));
  }, [cartHydrated, cartItems]);

  const cartEntries = Object.entries(cartItems);

  const subtotal = useMemo(
    () => cartEntries.reduce((sum, [, item]) => sum + item.price * item.quantity, 0),
    [cartEntries]
  );

  const total = subtotal + deliveryCharge;

  const handleQuantityChange = (key: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], quantity },
    }));
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleProceedToPayment = () => {
    if (cartEntries.length === 0) return;

    const resolvedProfile = {
      name: profile.name || user?.name || '',
      phone: profile.phone || user?.phone || '',
      address: '',
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'orderData',
        JSON.stringify({
          ...resolvedProfile,
          items: cartEntries.map(([, item]) => item),
          subtotal,
          deliveryCharge,
          total,
        })
      );
    }

    setSubmitting(true);
    router.push('/payment');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] md:text-2xl">Your Cart</h1>
          <p className="mt-1 text-xs text-[var(--text-muted)] md:text-sm">
            Review selected items and continue to payment.
          </p>
        </div>
      </div>

      {loading && <p className="text-[var(--text-muted)]">Loading cart...</p>}

      {!loading && cartEntries.length === 0 && (
        <div className="card space-y-4 py-10 text-center">
          <p className="text-[var(--text-muted)]">Your cart is empty. Add items from the home page.</p>
          <Link href="/" className="btn-primary inline-flex w-full justify-center md:w-auto">
            Go Shopping
          </Link>
        </div>
      )}

      {!loading && cartEntries.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-2 md:space-y-3">
            {cartEntries.map(([key, item]) => (
              <div key={key} className="card transition-all hover:shadow-lg hover:border-[var(--primary)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--text-primary)] md:text-lg">{item.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)] md:text-sm">
                      <span>Per {item.unit}</span>
                      <span className="font-semibold text-[var(--text-primary)]">Rs. {item.price}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(key)}
                    className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 md:border md:border-[var(--border)] md:px-3 md:py-2 md:text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 md:mt-4 md:pt-4">
                  <div className="quantity-control flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(key, item.quantity - 1)}
                      className="hover:border-red-400 hover:text-red-500"
                    >
                      -
                    </button>
                    <span className="min-w-[16px] text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(key, item.quantity + 1)}
                      className="hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-base font-bold text-[var(--primary)] md:text-lg">Rs. {item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card h-fit bg-gradient-to-br from-[var(--primary-bg)] to-white border-[var(--primary)] shadow-lg lg:sticky lg:top-24">
            <h2 className="mb-3 text-xl font-extrabold text-[var(--text-primary)] md:mb-4 md:text-2xl">Order Summary</h2>
            <div className="order-summary space-y-2 md:space-y-3">
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Delivery Fee</span>
                <span>Rs. {deliveryCharge}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--text-primary)]">
                <span>Total</span>
                <span className="text-[var(--primary)]">Rs. {total}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 md:mt-5 md:flex-row md:gap-3">
              <Link href="/" className="btn-outline inline-flex w-full justify-center transition-all hover:bg-[var(--background)] md:w-auto">
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="btn-primary w-full shadow-lg hover:shadow-xl md:w-auto"
                disabled={submitting}
              >
                {submitting ? 'Please wait...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
