import { ref, watch, type Ref } from "vue";
import type { Invoice } from "./types";

export function useInvoices(year: Ref<number>) {
  const invoices = ref<Invoice[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  watch(year, async (value, _old, onCleanup) => {
    const controller = new AbortController();
    onCleanup(() => controller.abort());

    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`/api/invoices?year=${value}`, { signal: controller.signal });
      invoices.value = await res.json();
    } catch (e) {
      if (!controller.signal.aborted) error.value = String(e);
    } finally {
      loading.value = false;
    }
  }, { immediate: ⟨false|true⟩ });

  return { invoices, loading, error };
}
