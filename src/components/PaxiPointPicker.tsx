import React, { useEffect, useRef, useState } from 'react';

type PaxiPointPickerProps = {
  isOpen: boolean;
  locatorUrl?: string;
  locatorOrigin?: string;
  onSelect: (point: { code: string; name: string }) => void;
  onClose: () => void;
};

const defaultUrl =
  'https://map.paxi.co.za?size=l,m,s&status=1,3,4&maxordervalue=1000&output=nc,sn';

export const PaxiPointPicker: React.FC<PaxiPointPickerProps> = ({
  isOpen,
  locatorUrl,
  locatorOrigin,
  onSelect,
  onClose,
}) => {
  const url = locatorUrl || defaultUrl || import.meta.env.VITE_PAXI_POINT_LOCATOR_URL || defaultUrl;
  const origin = locatorOrigin || import.meta.env.VITE_PAXI_POINT_LOCATOR_ORIGIN || 'https://map.paxi.co.za';
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualName, setManualName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setName('');
      setManualCode('');
      setManualName('');
      return;
    }
    const handler = (e: MessageEvent) => {
      try {
        const allowedOrigin = origin || 'https://map.paxi.co.za';
        if (e.origin !== allowedOrigin) return;
        const data = e.data || {};
        if (data && data.trg === 'paxi' && data.point) {
          const point = data.point || {};
          const codeVal = (point.nodeCode || point['node-code'] || point.code || '').trim().toUpperCase();
          const nameVal = (point.shortName || point.name || point.storeName || '').trim();
          if (codeVal) {
            setCode(codeVal);
            setName(nameVal);
          }
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isOpen, origin]);

  if (!isOpen) return null;

  const submitManual = () => {
    const cleaned = manualCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^P\d{3,5}$/.test(cleaned)) {
      alert('Enter a valid PAXI point code (e.g. P8114)');
      return;
    }
    const store = manualName.trim();
    if (!store) {
      alert('Enter the store name');
      return;
    }
    onSelect({ code: cleaned, name: store });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-xs bg-white shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-stone-900 text-stone-100">
          <div className="text-sm font-semibold tracking-wide">Select PAXI Collection Point</div>
          <button onClick={onClose} className="text-stone-300 hover:text-white text-xs">Close</button>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-[420px] w-full border border-stone-200 rounded-xs overflow-hidden bg-stone-50">
            <iframe
              ref={iframeRef}
              title="PAXI Point Locator"
              src={url}
              className="w-full h-full border-0"
              allow="geolocation"
            />
          </div>
          {code && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs">
              <div className="font-semibold text-emerald-900 mb-1">Selected point</div>
              <div className="font-mono">{code} — {name || 'Unnamed'}</div>
              <button
                onClick={() => onSelect({ code, name })}
                className="mt-2 px-3 py-1.5 bg-emerald-700 text-white rounded text-xs"
              >
                Use this point
              </button>
            </div>
          )}
          <div className="border-t border-stone-200 pt-4">
            <div className="text-xs font-semibold text-stone-800 mb-2">Or enter manually</div>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="PAXI point code (e.g. P8114)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
              />
              <input
                placeholder="Store name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 text-xs"
              />
            </div>
            <button
              onClick={submitManual}
              className="mt-3 px-4 py-2 bg-stone-900 text-white rounded text-xs"
            >
              Confirm manual entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
