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
      <div className="card text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your Orders</h1>
        <p className="text-gray-600 mb-4">Login to view your orders.</p>
        <Link href="/auth" className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Your Orders</h1>

      {loading && <p className="text-gray-600">Loading your orders...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-gray-600">No orders yet. Place your first order from the home page.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.order_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">{order.order_id}</p>
                <p className="text-sm text-gray-600">Address: {order.address}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">Phone: {order.phone}</p>
            <p className="text-sm text-gray-600">Transaction ID: {order.transaction_id}</p>
            <p className="text-sm font-semibold text-primary-700 mt-2">OTP: {order.otp}</p>

            <div className="mt-3 border-t border-gray-100 pt-3">
              {order.items.map((item) => (
                <div key={`${order.order_id}-${item.name}`} className="flex justify-between text-sm text-gray-700">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <p className="mt-2 font-semibold">Total: ₹{order.total_price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
