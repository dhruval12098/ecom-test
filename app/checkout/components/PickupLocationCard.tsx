"use client";

import { MapPin } from "lucide-react";

type PickupLocationCardProps = {
  storeName?: string | null;
  storeAddress?: string | null;
};

export default function PickupLocationCard({
  storeName,
  storeAddress,
}: PickupLocationCardProps) {
  const address = String(storeAddress || "").trim();
  const name = String(storeName || "").trim();

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-[#266000]" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900">Pickup Location</div>
          {name ? <div className="text-sm text-gray-700 mt-1">{name}</div> : null}
          <div className="text-sm text-gray-700 mt-1 break-words">
            {address || "Pickup address not configured in admin settings."}
          </div>
        </div>
      </div>
    </div>
  );
}

