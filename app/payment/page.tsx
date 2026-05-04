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

const UPI_ID = '9919262161@ybl';

export default function PaymentPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orderData, setOrderData] = useState<StoredOrderData | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
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

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      window.setTimeout(() => setCopiedUpi(false), 1400);
    } catch {
      setError('Could not copy UPI ID. Please copy it manually.');
    }
  };

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
    if (!orderData.address.trim()) {
      setError('Please select your hostel on the home page before placing the order.');
      return;
    }
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
        transaction_id: transactionId.trim(),
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
    <div className="space-y-4 md:space-y-6">
      <div className="card">
        <h1 className="mb-1 text-xl font-extrabold text-[var(--text-primary)] md:mb-2 md:text-2xl">Payment</h1>
        <p className="text-xs text-[var(--text-muted)] md:text-sm">Pay with UPI and submit the transaction ID.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
        <div className="space-y-4 md:space-y-5">
          <div className="card">
            <div className="flex flex-col items-center rounded-[10px] border border-[var(--border)] bg-white p-3 sm:p-5 md:rounded-[12px] md:p-6">
              <p className="mb-2 text-sm font-semibold text-[var(--text-muted)] md:mb-3">Scan QR Code to Pay</p>
              <img
                src="/phonepe_qr.jpg"
                alt="PhonePe QR Code"
                className="mb-2 aspect-square w-full max-w-44 rounded-[10px] border border-[var(--border)] object-cover sm:max-w-52 md:mb-3 md:max-w-56 md:rounded-[12px]"
              />
              <div className="w-full max-w-sm rounded-[10px] border border-[var(--border)] bg-[var(--background)] p-2.5 md:p-3">
                <p className="text-center text-xs font-semibold text-[var(--text-muted)]">UPI ID</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="min-w-0 flex-1 break-all text-left text-sm font-semibold text-[var(--primary-dark)] md:text-base">
                    {UPI_ID}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="shrink-0 rounded-md border border-[var(--primary)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--primary-dark)] transition-colors hover:bg-[var(--primary-bg)]"
                  >
                    {copiedUpi ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card space-y-3 md:space-y-4">
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

            <div className="grid grid-cols-2 gap-2 pt-1 md:flex md:gap-3 md:pt-2">
              <button
                type="button"
                onClick={() => router.push('/cart')}
                className="btn-outline w-full !px-3 !py-2 text-sm md:w-auto"
                disabled={submitting}
              >
                Back to Cart
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                className="btn-primary w-full !px-3 !py-2 text-sm md:w-auto"
                disabled={submitting || ordersClosed}
              >
                {submitting ? 'Placing order...' : ordersClosed ? 'Orders Closed' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>

        <div className="card h-fit space-y-3 lg:sticky lg:top-24 md:space-y-4">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)] md:text-xl">Order Summary</h2>
          <div className="space-y-2 md:space-y-3">
            {orderData.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0 md:pb-3">
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

          <div className="order-summary space-y-2 md:space-y-3">
            <div className="flex justify-between gap-3 text-sm text-[var(--text-muted)]">
              <span>Hostel</span>
              <span className="text-right font-semibold text-[var(--text-primary)]">{orderData.address}</span>
            </div>
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
