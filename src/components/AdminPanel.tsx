import React, { useCallback, useEffect, useState } from 'react';
import { adminService, AdminGateway, AdminGatewaysResponse } from '../services/api';
import { BRAND_LOGO_IMAGE } from '../data/initialProducts';
import {
  X,
  Lock,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Webhook,
  LogOut,
  Truck,
  Download,
} from 'lucide-react';

const ADMIN_KEY_STORAGE = 'phethagatsa_admin_key';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [adminKey, setAdminKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [authError, setAuthError] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [gateways, setGateways] = useState<AdminGateway[]>([]);
  const [webhooks, setWebhooks] = useState<AdminGatewaysResponse['webhooks'] | null>(null);
  const [courier, setCourier] = useState<AdminGatewaysResponse['courier'] | null>(null);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleExportPaxi = async () => {
    try {
      const res = await fetch(`/api/admin/orders/paxi/export`, {
        headers: { 'X-API-Key': adminKey.trim() },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'paxi_orders.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSaveMessage('PAXI CSV downloaded');
    } catch (e: any) {
      setSaveError(e.message || 'Could not export');
    }
  };

  const loadGateways = useCallback(async (key: string) => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await adminService.getAdminGateways(key);
      setGateways(data.gateways);
      setWebhooks(data.webhooks);
      setCourier(data.courier ?? null);
      const d: Record<string, boolean> = {};
      data.gateways.forEach((g) => (d[g.id] = g.enabled));
      setDraft(d);
    } catch (err: any) {
      setLoadError(err?.message || 'Could not load gateway settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore a saved key when the panel opens and try it.
  useEffect(() => {
    if (!isOpen) return;
    setSaveMessage('');
    setSaveError('');
    let saved = '';
    try {
      saved = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
    } catch {
      saved = '';
    }
    if (saved) {
      setAdminKey(saved);
      setAuthed(true);
      loadGateways(saved);
    }
  }, [isOpen, loadGateways]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setChecking(true);
    const ok = await adminService.verifyAdminKey(adminKey.trim());
    setChecking(false);
    if (!ok) {
      setAuthError('Invalid admin key. Please check and try again.');
      return;
    }
    try {
      localStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
    } catch {
      // ignore
    }
    setAuthed(true);
    loadGateways(adminKey.trim());
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch {
      // ignore
    }
    setAuthed(false);
    setAdminKey('');
    setGateways([]);
    setWebhooks(null);
    setCourier(null);
    setDraft({});
  };

  const toggle = (id: string) => setDraft((d) => ({ ...d, [id]: !d[id] }));

  const dirty = gateways.some((g) => draft[g.id] !== g.enabled);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    setSaveError('');
    try {
      await adminService.updateAdminGateways(adminKey.trim(), draft);
      await loadGateways(adminKey.trim());
      setSaveMessage('Payment methods updated.');
    } catch (err: any) {
      setSaveError(err?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin panel"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-xs my-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-stone-900 text-stone-100 px-6 sm:px-8 py-5 flex items-center justify-between gap-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <img
              src={BRAND_LOGO_IMAGE}
              alt="Phethagatsa Solutions Logo"
              className="h-10 w-auto object-contain rounded-md bg-white p-0.5 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-accent" />
                <h2 className="text-sm font-bold tracking-wider text-white font-serif uppercase">
                  Store Administration
                </h2>
              </div>
              <p className="text-[10px] font-mono text-stone-300">Payment gateways, webhooks & store controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close admin panel"
            className="p-1.5 text-stone-400 hover:text-white rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login gate */}
        {!authed ? (
          <form onSubmit={handleLogin} className="px-6 sm:px-8 py-8 space-y-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Lock className="w-4 h-4" />
              <p className="text-sm font-semibold">Enter the admin key to manage payment methods.</p>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-600 mb-1">Admin API Key</label>
              <input
                type="password"
                autoFocus
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-stone-50 border border-stone-300 rounded-xs px-3 py-2 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
              />
            </div>
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={checking || !adminKey.trim()}
              className="w-full py-3 px-6 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{checking ? 'Verifying…' : 'Unlock Admin Panel'}</span>
            </button>
          </form>
        ) : (
          <div className="px-6 sm:px-8 py-6 space-y-6">
            {/* Gateways */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">
                  Payment Gateways
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => loadGateways(adminKey.trim())}
                    disabled={loading}
                    className="text-[11px] font-mono text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-[11px] font-mono text-stone-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              </div>

              {loadError && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs">{loadError}</div>
              )}

              <div className="space-y-2">
                {loading && gateways.length === 0 ? (
                  <div className="py-8 flex items-center justify-center text-stone-500 text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </div>
                ) : (
                  gateways.map((g) => {
                    const on = Boolean(draft[g.id]);
                    const unavailable = !g.configured;
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-4 p-3.5 border border-stone-200 rounded-xs bg-stone-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-stone-900">{g.label}</span>
                            <span
                              className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-xs border ${
                                g.mode === 'live'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : g.mode === 'offline'
                                    ? 'bg-stone-100 text-stone-600 border-stone-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {g.mode}
                            </span>
                            {unavailable && (
                              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-xs border bg-rose-50 text-rose-700 border-rose-200">
                                not configured
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {unavailable
                              ? 'Credentials missing — will stay hidden at checkout.'
                              : on
                                ? 'Visible to customers at checkout.'
                                : 'Hidden from customers at checkout.'}
                          </p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => toggle(g.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            on ? 'bg-emerald-600' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              on ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {saveMessage && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}
              {saveError && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xs text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="mt-3 w-full py-3 px-6 bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-widest rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                <span>{saving ? 'Saving…' : dirty ? 'Save Payment Methods' : 'No Changes'}</span>
              </button>
            </section>

              {/* Webhooks */}
             <section className="pt-4 border-t border-stone-200">
               <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold mb-3 flex items-center gap-2">
                 <Webhook className="w-4 h-4" />
                 <span>Webhooks</span>
               </h3>
               <div className="p-3.5 border border-stone-200 rounded-xs bg-stone-50 space-y-2">
                 <div className="flex items-center justify-between gap-3">
                   <span className="text-sm font-semibold text-stone-900">PayPal notifications</span>
                   <span
                     className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-xs border ${
                       webhooks?.paypal.configured
                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                         : 'bg-amber-50 text-amber-700 border-amber-200'
                     }`}
                   >
                     {webhooks?.paypal.configured ? 'active' : 'pending id'}
                   </span>
                 </div>
                 <p className="text-[11px] text-stone-500">
                   Paste this URL into the PayPal Developer Dashboard → your app → Webhooks. Subscribe to
                   <span className="font-mono"> PAYMENT.CAPTURE.COMPLETED</span>,
                   <span className="font-mono"> PAYMENT.CAPTURE.DENIED</span>,
                   <span className="font-mono"> PAYMENT.CAPTURE.REFUNDED</span>.
                 </p>
                 <code className="block w-full text-[11px] font-mono bg-white border border-stone-200 rounded-xs px-2.5 py-2 text-stone-800 break-all">
                   {webhooks?.paypal.url || '—'}
                 </code>
               </div>

               <div className="mt-3 p-3.5 border border-stone-200 rounded-xs bg-stone-50 space-y-2">
                 <div className="flex items-center justify-between gap-3">
                   <span className="text-sm font-semibold text-stone-900 flex items-center gap-2">
                     <Truck className="w-4 h-4 text-stone-500" />
                     The Courier Guy · tracking
                   </span>
                   <span
                     className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-xs border ${
                       courier?.configured
                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                         : 'bg-amber-50 text-amber-700 border-amber-200'
                     }`}
                   >
                     {courier?.configured ? 'active' : 'not configured'}
                   </span>
                 </div>
                 <p className="text-[11px] text-stone-500">
                   Live delivery rates at checkout via The Courier Guy (service levels:
                   <span className="font-mono"> {courier?.serviceLevels?.join(', ') || 'ECO, PRI'} </span>
                   ). In the Shiplogic / The Courier Guy portal, add a webhook to this URL subscribed to
                   <span className="font-mono"> tracking-event</span>,
                   <span className="font-mono"> shipment-note</span>,
                   <span className="font-mono"> parcel-dimension-changes</span>.
                 </p>
                 <code className="block w-full text-[11px] font-mono bg-white border border-stone-200 rounded-xs px-2.5 py-2 text-stone-800 break-all">
                   {webhooks?.courierguy?.url || '—'}
                 </code>
               </div>
             </section>

             {/* PAXI Export */}
             <section className="pt-4 border-t border-stone-200">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-mono uppercase tracking-wider text-stone-900 font-bold">PAXI Store-to-Store Export</h3>
                 <button
                   onClick={handleExportPaxi}
                   className="text-[11px] font-mono text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                 >
                   <Download className="w-3.5 h-3.5" />
                   Export CSV
                 </button>
               </div>
               <p className="text-[11px] text-stone-500 mt-1">Download paid PAXI orders for the PEP PAXI Business Portal. The CSV contains: Recipient Full Name, Recipient Cellphone Number, Destination PAXI Point Code, Parcel Size.</p>
             </section>

          </div>
        )}

        <div className="sticky bottom-0 bg-stone-50 border-t border-stone-200 px-6 sm:px-8 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
