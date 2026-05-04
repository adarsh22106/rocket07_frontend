'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderAPI, configAPI } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface StoredOrderData {
  name: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

const paymentOptions = ['PhonePe', 'Google Pay', 'Paytm', 'Other UPI'];

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orderData, setOrderData] = useState<StoredOrderData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0]);
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [config, setConfig] = useState({
    deliveryCharge: 9,
    isDeliveryClosed: false,
  });
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await configAPI.getConfig();
        setConfig({
          deliveryCharge: data.data.delivery_charge,
          isDeliveryClosed: data.data.is_delivery_closed,
        });
      } catch (error) {
        console.error('Failed to load config:', error);
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || authLoading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }

    const rawData = sessionStorage.getItem('orderData');
    if (!rawData) {
      router.replace('/cart');
      return;
    }

    try {
      setOrderData(JSON.parse(rawData));
    } catch (_error) {
      sessionStorage.removeItem('orderData');
      router.replace('/cart');
    }
  }, [authLoading, router, user]);

  const totalAmount = useMemo(() => orderData?.total ?? 0, [orderData]);
  const ordersClosed = config.isDeliveryClosed;

  const handlePlaceOrder = async () => {
    if (ordersClosed) {
      setError('Orders for today are now closed. We will be back tomorrow.');
      return;
    }

    if (!user) {
      setError('Please login first to place an order.');
      router.push('/auth');
      return;
    }
    if (!orderData) return;
    if (!transactionId.trim()) {
      setError('Please enter transaction ID.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data } = await orderAPI.createOrder({
        name: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        items: orderData.items,
        transaction_id: `${paymentMethod}: ${transactionId.trim()}`,
        user_id: user.id,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('orderData');
        localStorage.removeItem('delivery_cart');
      }

      setSuccessMessage(`Order placed! ID: ${data.order_id} | OTP: ${data.otp}`);
      setTimeout(() => {
        router.push('/orders');
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !orderData) {
    return <div className="card py-8">Loading payment details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="mb-2 text-2xl font-extrabold text-[var(--text-primary)]">Payment</h1>
        <p className="text-sm text-[var(--text-muted)]">Complete your order using UPI and submit the transaction ID.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="card space-y-4">
            <div className="order-summary">
              <p className="text-sm text-[var(--text-muted)]">Pay using UPI to</p>
              <p className="mt-1 break-words text-lg font-semibold text-[var(--primary-dark)]">9919262161@ybl</p>
              <p className="mt-4 text-2xl font-extrabold text-[var(--text-primary)]">
                Total Amount: <span className="text-[var(--primary)]">Rs. {totalAmount}</span>
              </p>
            </div>

            <div className="rounded-[12px] border border-[var(--border)] bg-white p-4">
              <label className="label">Payment Option</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {paymentOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPaymentMethod(option)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                      paymentMethod === option
                        ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary-dark)]'
                        : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--primary)]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center rounded-[12px] border border-[var(--border)] bg-white p-4 sm:p-6">
              <p className="mb-3 text-sm font-semibold text-[var(--text-muted)]">Scan QR Code to Pay</p>
              <img
                src="/phonepe_qr.jpg"
                alt="PhonePe QR Code"
                className="mb-3 aspect-square w-full max-w-56 rounded-[12px] border border-[var(--border)] object-cover"
              />
              <p className="text-center">
                <span className="text-xs text-[var(--text-muted)]">UPI ID: </span>
                <span className="break-all font-semibold text-[var(--primary-dark)]">9919262161@ybl</span>
              </p>
            </div>
          </div>

          <div className="card space-y-4">
            <div>
              <label className="label">Transaction ID *</label>
              <input
                type="text"
                className="input-field"
                value={transactionId}
                onChange={(event) => setTransactionId(event.target.value)}
                placeholder="Enter UPI transaction ID"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

            {ordersClosed && !configLoading && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 p-4">
                <p className="font-medium text-red-800">Orders for today are now closed.</p>
                <p className="text-sm text-red-700">Thank you for your support. We will be back tomorrow.</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 md:flex-row">
              <button
                type="button"
                onClick={() => router.push('/cart')}
                className="btn-outline w-full md:w-auto"
                disabled={submitting}
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="btn-primary w-full md:w-auto"
                disabled={submitting || ordersClosed}
              >
                {submitting ? 'Placing order...' : ordersClosed ? 'Orders Closed' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>

        <div className="card h-fit space-y-4 lg:sticky lg:top-24">
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Order Summary</h2>
          <div className="space-y-3">
            {orderData.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {item.quantity} x Rs. {item.price}{item.unit ? ` per ${item.unit}` : ''}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm font-bold text-[var(--primary)]">Rs. {item.quantity * item.price}</p>
              </div>
            ))}
          </div>

          <div className="order-summary space-y-3">
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>Subtotal</span>
              <span>Rs. {orderData.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--text-muted)]">
              <span>Delivery Fee</span>
              <span>Rs. {orderData.deliveryCharge ?? config.deliveryCharge}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--text-primary)]">
              <span>Total</span>
              <span className="text-[var(--primary)]">Rs. {totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
