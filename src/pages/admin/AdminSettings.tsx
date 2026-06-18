import React, { useEffect, useState } from 'react';
import { useSettings, useSettingsMutation } from '../../hooks/useSettings';
import { Loader2, Save, CreditCard, Truck, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { data: currentSettings, isLoading, isError } = useSettings();
  const updateSettings = useSettingsMutation();

  const [codAllowed, setCodAllowed] = useState(true);
  const [threshold, setThreshold] = useState('1500');
  const [shippingCost, setShippingCost] = useState('100');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentSettings) {
      setCodAllowed(currentSettings.cod_allowed === 'true');
      setThreshold(currentSettings.free_shipping_threshold || '1500');
      setShippingCost(currentSettings.shipping_charge || '100');
    }
  }, [currentSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    try {
      await updateSettings.mutateAsync({
        cod_allowed: codAllowed ? 'true' : 'false',
        free_shipping_threshold: threshold,
        shipping_charge: shippingCost,
      });
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      alert('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#8b1a2a]" size={24} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Loading configuration…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center">
        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <p className="text-sm font-bold text-neutral-800">Unable to load settings</p>
        <p className="text-xs text-neutral-400 max-w-xs">
          The backend may be unreachable. Check your connection and try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl font-display">

      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#8b1a2a]">Admin</span>
          <ChevronRight size={10} className="text-neutral-300" />
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-400">Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">
          System Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
          Manage payment gateways, delivery fees, and checkout policies for your storefront.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Success banner */}
        {successMsg && (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-emerald-800">{successMsg}</span>
          </div>
        )}

        {/* ── Section 1: Payment Methods ── */}
        <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow duration-300">
          {/* Crimson accent bar — the signature element */}
          <div className="h-1 bg-gradient-to-r from-[#8b1a2a] via-[#c0364a] to-[#8b1a2a]" />

          <div className="p-6">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="size-9 rounded-xl bg-[#8b1a2a]/8 flex items-center justify-center shrink-0 ring-1 ring-[#8b1a2a]/15">
                <CreditCard size={15} className="text-[#8b1a2a]" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-800">
                  Payment Methods
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Control which gateways appear at checkout
                </p>
              </div>
            </div>

            {/* COD toggle row */}
            <div className="flex items-center justify-between gap-6 p-4 rounded-xl bg-neutral-50/80 border border-neutral-150 hover:bg-neutral-50 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-neutral-800">Cash on Delivery</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    codAllowed
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}>
                    {codAllowed ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Allow customers to pay at delivery. When off, only Razorpay online checkout is available.
                </p>
              </div>

              {/* Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={codAllowed}
                  onChange={(e) => setCodAllowed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`
                  relative w-12 h-6 rounded-full transition-all duration-200
                  ${codAllowed ? 'bg-[#8b1a2a]' : 'bg-neutral-200'}
                `}>
                  <div className={`
                    absolute top-[3px] left-[3px] size-[18px] bg-white rounded-full shadow-sm
                    transition-transform duration-200
                    ${codAllowed ? 'translate-x-6' : 'translate-x-0'}
                  `} />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section 2: Shipping ── */}
        <div className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-shadow duration-300">
          <div className="h-1 bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#1d4ed8]" />

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 ring-1 ring-blue-200/60">
                <Truck size={15} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-800">
                  Delivery & Shipping
                </h2>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Set the free shipping threshold and flat delivery fee
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free shipping threshold */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  Free Shipping Above
                </label>
                <div className="relative group/input">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-neutral-400 pointer-events-none select-none">
                    OMR
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="1500"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 text-sm font-medium rounded-xl border border-neutral-200 bg-white
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      hover:border-neutral-300 transition-all placeholder:text-neutral-300"
                  />
                </div>
                <p className="text-[9px] text-neutral-400 mt-1.5 leading-relaxed">
                  Orders at or above this amount qualify for free delivery.
                </p>
              </div>

              {/* Shipping fee */}
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  Standard Delivery Fee
                </label>
                <div className="relative group/input">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-semibold text-neutral-400 pointer-events-none select-none">
                    OMR
                  </span>
                  <input
                    type="number"
                    min={0}
                    required
                    placeholder="100"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 text-sm font-medium rounded-xl border border-neutral-200 bg-white
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                      hover:border-neutral-300 transition-all placeholder:text-neutral-300"
                  />
                </div>
                <p className="text-[9px] text-neutral-400 mt-1.5 leading-relaxed">
                  Charged when the order total falls below the threshold.
                </p>
              </div>
            </div>

            {/* Live preview pill */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center gap-2">
              <Truck size={11} className="text-blue-400 shrink-0" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                <span className="font-semibold">Preview:</span>{' '}
                Free shipping on orders ≥ OMR {threshold || '–'}. Orders below that pay OMR {shippingCost || '–'} flat.
              </p>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={updateSettings.isPending}
            className="relative flex items-center justify-center gap-2.5
              bg-[#8b1a2a] hover:bg-[#6f1522] active:bg-[#5a1019]
              text-white px-7 py-3 rounded-xl
              text-[11px] font-bold uppercase tracking-[0.15em]
              transition-all duration-150
              shadow-[0_2px_8px_rgba(139,26,42,0.35)] hover:shadow-[0_4px_16px_rgba(139,26,42,0.45)]
              disabled:opacity-50 disabled:cursor-not-allowed
              w-full sm:w-auto min-w-[160px]"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="animate-spin" size={13} />
                Saving…
              </>
            ) : (
              <>
                <Save size={13} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};