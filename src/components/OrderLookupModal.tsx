import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Order, Currency } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { Search, X, Package, Clock, MapPin, CheckCircle } from 'lucide-react';

interface OrderLookupModalProps {
  isOpen: boolean;
  currency: Currency;
  onClose: () => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  currency,
  onClose,
}) => {
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiService
        .getMyOrders()
        .then((orders) => setRecentOrders(orders.slice(0, 8)))
        .catch(() => setRecentOrders([]));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim() || isSearching) return;
    setIsSearching(true);
    const match = await apiService.lookupOrder(searchId.trim());
    setFoundOrder(match);
    setHasSearched(true);
    setIsSearching(false);
  };

  const handleSelectRecent = (order: Order) => {
    setSearchId(order.id);
    setFoundOrder(order);
    setHasSearched(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-xs overflow-hidden my-6 p-6 sm:p-8">
        <button
          onClick={onClose}
          aria-label="Close order tracking"
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-950 rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Package className="w-5 h-5 text-emerald-800" />
          <h2 className="text-xl font-bold tracking-tight text-stone-950 font-serif">
            Phethagatsa Order Tracking
          </h2>
        </div>
        <p className="text-xs text-stone-500 font-mono mb-6">
          Query live door-to-door South African delivery manifests and confirmed orders directly from the database.
        </p>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order Reference (e.g. AF-8492)"
              className="w-full bg-stone-50 border border-stone-300 rounded-xs py-2.5 pl-9 pr-3 text-xs font-mono uppercase text-stone-900 focus:outline-none focus:border-stone-900"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            {isSearching ? 'Searching…' : 'Locate'}
          </button>
        </form>

        {/* Found Order View */}
        {foundOrder ? (
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xs space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="font-mono text-[11px] text-stone-500 uppercase">Order Found</span>
                <div className="font-mono font-bold text-stone-950 text-base">#{foundOrder.id}</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-mono font-semibold rounded-xs">
                  <CheckCircle className="w-3 h-3" />
                  {foundOrder.status.toUpperCase()}
                </span>
                <div className="text-[10px] font-mono text-stone-500 mt-1">Est. {foundOrder.estimatedDelivery}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <div className="font-semibold text-stone-800">Collector Destination:</div>
                <div className="text-stone-600 font-mono mt-0.5">
                  {foundOrder.customer.fullName}<br />
                  {foundOrder.customer.city}, {foundOrder.customer.country}
                </div>
              </div>
              <div>
                <div className="font-semibold text-stone-800">Financial Authorization:</div>
                <div className="text-stone-600 font-mono mt-0.5">
                  Total: {formatPrice(foundOrder.total, currency)} ({foundOrder.paymentMethod.toUpperCase()})<br />
                  Registered: {new Date(foundOrder.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-stone-800 mb-2">Pieces in Consignment:</div>
              <div className="space-y-1.5">
                {foundOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between p-2 bg-white rounded-xs border border-stone-150">
                    <span>{i.product.name} ({i.selectedVariant?.name || 'Standard'}) × {i.quantity}</span>
                    <span className="font-mono font-medium">{formatPrice(i.product.price * i.quantity, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="p-6 text-center bg-stone-50 border border-stone-200 rounded-xs">
            <p className="text-xs font-semibold text-stone-800">No consignment matches reference "{searchId}".</p>
            <p className="text-[11px] text-stone-500 mt-1">Please verify the reference code format or select an existing record below.</p>
          </div>
        ) : null}

        {/* Recent database orders */}
        {recentOrders.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200">
            <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-3">
              Your Recent Orders ({recentOrders.length})
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {recentOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => handleSelectRecent(ord)}
                  className="w-full flex items-center justify-between p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xs text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-stone-900">#{ord.id}</span>
                    <span className="text-stone-500">· {ord.customer.fullName}</span>
                  </div>
                  <div className="font-mono text-stone-700">
                    {formatPrice(ord.total, currency)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
