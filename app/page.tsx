'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getItemsCatalog, ITEM_IMAGE_MAP, HOSTEL_OPTIONS, ItemsCatalog } from '@/data/items';
import { orderAPI, configAPI } from '@/utils/api';

interface SelectedItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

const buildImagePath = (fileName: string) => `/Item%20Images/${encodeURIComponent(fileName)}`;

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

function ItemImage({ itemName }: { itemName: string }) {
  const mapped = ITEM_IMAGE_MAP[itemName];
  const slug = toSlug(itemName);
  const candidates = [
    mapped,
    `${slug}.jpg`,
    `${slug}.jpeg`,
    `${slug}.png`,
    `${slug}.webp`,
  ].filter((value, index, array): value is string => Boolean(value) && array.indexOf(value) === index);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(candidates.length === 0);

  if (failed) {
    return (
      <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-xl">
        🛍️
      </div>
    );
  }

  return (
    <img
      src={buildImagePath(candidates[candidateIndex])}
      alt={itemName}
      className="w-14 h-14 rounded-md object-cover border border-gray-200 bg-white"
      loading="lazy"
      onError={() => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
          return;
        }
        setFailed(true);
      }}
    />
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [itemsCatalog, setItemsCatalog] = useState<ItemsCatalog>({});
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: SelectedItem }>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
  });
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
        // Keep default values on error
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Check if orders are closed for today
  const ORDERS_CLOSED = config.isDeliveryClosed;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    async function loadCatalog() {
      const data = await getItemsCatalog();
      setItemsCatalog(data);
    }

    loadCatalog();
  }, []);

  const subtotal = Object.values(selectedItems).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const LAUNCH_DATE = '2026-05-02';
  const [isLaunchDay, setIsLaunchDay] = useState(false);
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    setIsLaunchDay(today === LAUNCH_DATE);
  }, []);
  const deliveryCharge = isLaunchDay ? 0 : config.deliveryCharge;
  const total = subtotal + deliveryCharge;

  const handleItemToggle = (category: string, itemName: string, price: number, unit: string) => {
    const key = `${category}-${itemName}`;
    setSelectedItems((prev) => {
      if (prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: { name: itemName, quantity: 1, price, unit },
      };
    });
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems((prev) => ({
      ...prev,
      [key]: { ...prev[key]!, quantity },
    }));
  };

  const handleProceedToPayment = () => {
    if (ORDERS_CLOSED) {
      alert('Orders for today are now closed. Thank you for your support! We\'ll be back tomorrow to serve you again.');
      return;
    }
    
    if (!user) {
      alert('Please login first to place an order.');
      router.push('/auth');
      return;
    }
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill all customer details');
      return;
    }
    if (Object.keys(selectedItems).length === 0) {
      alert('Please select at least one item');
      return;
    }
    // Store form data and selected items in sessionStorage for payment page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('orderData', JSON.stringify({
        ...formData,
        items: Object.values(selectedItems),
        subtotal,
        deliveryCharge,
        total,
      }));
    }
    router.push('/payment');
  };

  return (
    <div>
      {/* Customer Details Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📋 Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Delivery Address *</label>
          <select
            className="input-field"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          >
            <option value="">Select Hostel</option>
            {HOSTEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Section */}
      {Object.entries(itemsCatalog).map(([category, items]) => (
        <div key={category} className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {category === "Non-Veg" ? "🥩" : "🛍️"} {category}
          </h2>
          {category === "Non-Veg" && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800 font-medium">
                📦 Delivery of non-vegetarian products will be made separately at 5:30 PM.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const key = `${category}-${item.name}`;
              const isSelected = !!selectedItems[key];
              return (
                <div
                  key={key}
                  onClick={() => handleItemToggle(category, item.name, item.price, item.unit)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ItemImage itemName={item.name} />
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-primary-600"
                      />
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                    <span className="text-primary-600 font-semibold">₹{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">per {item.unit}</span>
                    {isSelected && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(key, selectedItems[key].quantity - 1);
                          }}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{selectedItems[key].quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(key, selectedItems[key].quantity + 1);
                          }}
                          className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Order Summary */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📝 Order Summary</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{subtotal}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Delivery Charges</span>
            <span className="font-medium">₹{deliveryCharge}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-semibold text-lg text-primary-600">₹{total}</span>
          </div>
        </div>

        {isLaunchDay && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
            <p className="text-sm font-semibold">🎉 Delivery free for today</p>
            <p className="text-sm text-green-800">Sunday launch offer: enjoy zero delivery charges on all orders.</p>
          </div>
        )}
      </div>

      {/* Proceed Button */}
      {!user && (
        <p className="text-sm text-amber-700 mb-3">
          Login is required before proceeding to payment.
        </p>
      )}
      {ORDERS_CLOSED && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Orders for today are now closed.</p>
          <p className="text-red-700 text-sm">Thank you for your support! We'll be back tomorrow to serve you again.</p>
        </div>
      )}
      <button
        onClick={handleProceedToPayment}
        className="btn-primary"
        disabled={loading || !user || ORDERS_CLOSED}
      >
        {!user ? 'Login to Continue' : loading ? 'Processing...' : ORDERS_CLOSED ? 'Orders Closed' : 'Proceed to Payment'}
      </button>
    </div>
  );
}