import { useEffect } from "react";
import ApiService from "@/lib/api";

type UseLiveProductsArgs = {
  sourceItems: Array<{ id: number | string }>;
  setLiveMap: (map: Record<number, any>) => void;
  deps: any[];
  enabled?: boolean;
};

export function useLiveProducts({ sourceItems, setLiveMap, deps, enabled = true }: UseLiveProductsArgs) {
  useEffect(() => {
    if (!enabled) return;
    const loadLiveProducts = async () => {
      if (sourceItems.length === 0) return;
      try {
        const ids = sourceItems
          .map((item) => Number(item.id))
          .filter((id) => Number.isFinite(id) && id > 0);
        if (ids.length === 0) return;
        const results: any[] = await Promise.all(ids.map((id) => ApiService.getProductById(id)));
        const map: Record<number, any> = {};
        results.forEach((p: any) => {
          if (p && typeof p.id === "number") {
            map[p.id] = p;
          }
        });
        setLiveMap(map);
      } catch {
        // keep UI stable on failure
      }
    };
    loadLiveProducts();
  }, deps);
}
