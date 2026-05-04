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
    <div className="space-y-6">
      <div className="card shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Your Cart</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Review selected items, manage quantity, and continue to payment.
            </p>
          </div>
          <Link href="/profile" className="btn-outline inline-flex w-full justify-center md:w-auto">
            Update Profile
          </Link>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-[var(--primary-bg)] to-white">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Customer Details</h2>
          <span className="rounded-full bg-[var(--primary-bg)] px-3 py-1 text-[10px] font-semibold text-[var(--primary-dark)]">
            Saved profile
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-[12px] border border-[var(--primary)] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[var(--text-muted)]">Name</p>
            <p className="mt-1 break-words font-semibold text-[var(--text-primary)]">{profile.name || user?.name || 'Add in Profile'}</p>
          </div>
          <div className="rounded-[12px] border border-[var(--primary)] bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-[var(--text-muted)]">Phone</p>
            <p className="mt-1 break-words font-semibold text-[var(--text-primary)]">{profile.phone || user?.phone || 'Add in Profile'}</p>
          </div>
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {cartEntries.map(([key, item]) => (
              <div key={key} className="card transition-all hover:shadow-lg hover:border-[var(--primary)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold text-[var(--text-primary)] sm:text-lg">{item.name}</h3>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">Per {item.unit}</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">Rs. {item.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(key)}
                    className="btn-outline w-full px-3 py-2 text-sm transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600 sm:w-auto"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                  <span className="text-sm text-[var(--text-muted)]">Quantity</span>
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
                  <p className="text-lg font-bold text-[var(--primary)]">Rs. {item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card h-fit bg-gradient-to-br from-[var(--primary-bg)] to-white border-[var(--primary)] shadow-lg lg:sticky lg:top-24">
            <h2 className="mb-4 text-2xl font-extrabold text-[var(--text-primary)]">Order Summary</h2>
            <div className="order-summary space-y-3">
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

            <div className="mt-4 rounded-[12px] border border-[var(--border)] bg-white p-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Payment Option</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Pay online with UPI, then enter the transaction ID on the payment page.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-semibold text-[var(--primary-dark)]">
                <span className="rounded-lg bg-[var(--primary-bg)] px-2 py-2">PhonePe</span>
                <span className="rounded-lg bg-[var(--primary-bg)] px-2 py-2">GPay</span>
                <span className="rounded-lg bg-[var(--primary-bg)] px-2 py-2">Paytm</span>
                <span className="rounded-lg bg-[var(--primary-bg)] px-2 py-2">Any UPI</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
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
