'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/utils/api';
import { useWebSocket } from '@/hooks/useWebSocket';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderResponse {
  order_id: string;
  address: string;
  phone: string;
  status: string;
  otp: string;
  total_price: number;
  transaction_id: string;
  items: OrderItem[];
}

const getStatusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'confirmed') {
    return 'bg-green-100 text-green-800';
  }
  if (normalized === 'pending') {
    return 'bg-yellow-100 text-yellow-800';
  }
  return 'bg-gray-100 text-gray-700';
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleOrderUpdate = useCallback((update: { type: string; order_id: string; status: string }) => {
    if (update.type === 'order_update') {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === update.order_id
            ? { ...order, status: update.status }
            : order
        )
      );
    }
  }, []);

  // Use WebSocket hook to listen for order updates
  useWebSocket(handleOrderUpdate);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await orderAPI.getOrders(user.id);
        setOrders(data.orders || []);
      } catch (_err) {
        setError('Unable to load orders right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12 py-8">
        {/* SECTION: Empty State */}
        <div className="card text-center">
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Your Orders</h1>
          <p className="text-[var(--text-muted)] mb-4">Login to view your orders.</p>
          <Link href="/auth" className="btn-primary inline-flex w-full md:w-auto justify-center">
          Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-12 py-8 space-y-6">
      {/* SECTION: Orders Header */}
      <div className="card">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Your Orders</h1>
        <p className="text-sm text-[var(--text-muted)]">Track and review your placed orders.</p>
      </div>

      {loading && <p className="text-[var(--text-muted)]">Loading your orders...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-[var(--text-muted)]">No orders yet. Place your first order from the home page.</p>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.order_id} className="card">
            {/* SECTION: Order Card */}
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <p className="font-bold text-[var(--text-primary)] text-lg">{order.order_id}</p>
                <p className="text-sm text-[var(--text-muted)]">Address: {order.address}</p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-semibold rounded-full capitalize ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="grid gap-1 text-sm text-[var(--text-muted)]">
              <p>Phone: {order.phone}</p>
              <p>Transaction ID: {order.transaction_id}</p>
              <p className="text-sm font-semibold text-[var(--primary)] mt-1">OTP: {order.otp}</p>
            </div>

            <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-2">
              {order.items.map((item) => (
                <div key={`${order.order_id}-${item.name}`} className="flex justify-between text-sm text-[var(--text-primary)]">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <p className="mt-3 pt-3 border-t border-[var(--border)] font-semibold text-lg text-[var(--text-primary)] flex justify-between">
                <span>Total</span>
                <span className="text-[var(--primary)]">₹{order.total_price}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
