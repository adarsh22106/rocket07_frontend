'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getItemsCatalog, ITEM_IMAGE_MAP, HOSTEL_OPTIONS, ItemsCatalog } from '@/data/items';

interface SelectedItem {
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

const normalizeCart = (value: string | null) => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<Record<string, SelectedItem>>((acc, [key, item]) => {
      const cartItem = item as Partial<SelectedItem>;
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
  const [itemsCatalog, setItemsCatalog] = useState<ItemsCatalog>({});
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: SelectedItem }>({});
  const [selectedHostel, setSelectedHostel] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setSelectedItems(normalizeCart(localStorage.getItem('delivery_cart')));

    const savedHostel = localStorage.getItem('delivery_hostel');
    if (savedHostel) {
      setSelectedHostel(savedHostel);
    }

    setCartHydrated(true);
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      const data = await getItemsCatalog();
      setItemsCatalog(data);
      setLoading(false);
    }

    loadCatalog();
  }, []);

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

  useEffect(() => {
    if (typeof window === 'undefined' || !cartHydrated) return;
    localStorage.setItem('delivery_cart', JSON.stringify(selectedItems));
  }, [cartHydrated, selectedItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('delivery_hostel', selectedHostel);
  }, [selectedHostel]);

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="space-y-8">
      {/* SECTION: Hero */}
      <div className="hero-banner relative z-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                Hostel Delivery
              </span>
              <select
                className="w-full max-w-[190px] rounded-full border border-white/30 bg-white/95 px-3 py-2 text-sm font-semibold text-[var(--text-primary)] outline-none"
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
              >
                <option value="">Select hostel</option>
                {HOSTEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">
                Fast Delivery for Hostel Life ⚡
              </h2>
              <p className="text-sm md:text-[14px] text-white/90 max-w-xl">
                Snacks, groceries, beverages and daily essentials delivered in a clean, simple checkout flow.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white">
              {selectedCount} item{selectedCount === 1 ? '' : 's'} selected
            </span>
            <Link
              href="/cart"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.setItem('delivery_cart', JSON.stringify(selectedItems));
                }
              }}
              className="inline-flex w-full md:w-auto items-center justify-center rounded-[12px] bg-white px-5 py-3 text-[15px] font-bold text-[var(--accent)] transition-all duration-200 hover:bg-[var(--accent-bg)] hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Open Cart
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION: Items Section */}
      {loading && (
        <div className="card text-center py-10 text-[var(--text-muted)]">
          Loading items...
        </div>
      )}

      {!loading && Object.entries(itemsCatalog).map(([category, items]) => (
        <div key={category} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">
              {category === 'Non-Veg' ? '🥩' : '🛍️'} {category}
            </h2>
            <span className="text-[13px] font-semibold text-[var(--primary)]">See all</span>
          </div>
          {category === 'Non-Veg' && (
            <div className="mb-4 rounded-[12px] border border-[var(--accent)] bg-[var(--accent-bg)] p-3">
              <p className="text-sm text-[var(--primary-dark)] font-medium">
                📦 Delivery of non-vegetarian products will be made separately at 5:30 PM.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const key = `${category}-${item.name}`;
              const isSelected = !!selectedItems[key];
              return (
                <div
                  key={key}
                  onClick={() => handleItemToggle(category, item.name, item.price, item.unit)}
                  className={`relative min-w-0 cursor-pointer transition-all duration-250 hover:scale-[1.02] ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary-bg)] shadow-md'
                      : 'border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md'
                  } card`}
                >
                  {isSelected && <span className="badge-discount">Selected</span>}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ItemImage itemName={item.name} />
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold leading-tight text-[var(--text-primary)]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">per {item.unit}</p>
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-[15px] font-bold text-[var(--text-primary)]">
                        ₹{item.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      {isSelected ? (
                        <div className="quantity-control w-full flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(key, selectedItems[key].quantity - 1);
                            }}
                            className="hover:border-red-400 hover:text-red-500"
                          >
                            −
                          </button>
                          <span className="min-w-[24px] text-center text-sm font-bold">
                            {selectedItems[key].quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(key, selectedItems[key].quantity + 1);
                            }}
                            className="hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="w-full text-center text-[12px] font-semibold text-[var(--primary)]">✓ Tap to add</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
