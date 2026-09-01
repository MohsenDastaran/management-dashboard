import type { FetchError } from "ofetch";
import type {
  CapacityOverview,
  ValidationError,
  YearMonth,
} from "~/types/capacity";
import { applyLocalEdits, summarize } from "~/lib/capacity";

/**
 * App-wide selected reporting month. `null` means "use the API's current
 * reporting month" (the `month` query parameter is omitted).
 */
export function useReportingMonth() {
  return useState<YearMonth | null>("reporting-month", () => null);
}

/**
 * Fetches the capacity overview for the selected reporting month and exposes
 * the raw payload plus the derived summary from the capacity engine.
 *
 * Uses `useAsyncData` (not `useFetch`) so a reactive query object cannot
 * deep-watch itself into a request loop. Callers share one request per month.
 */
export function useCapacityOverview() {
  const config = useRuntimeConfig();
  const month = useReportingMonth();

  const { edits } = useLocalEdits();

  const { data: raw, status, error, refresh } = useAsyncData(
    computed(() => `capacity-overview-${month.value ?? "current"}`),
    (_nuxtApp, { signal }) =>
      $fetch<CapacityOverview>("/api/v1/capacity-overview", {
        baseURL: config.public.apiBase,
        query: month.value ? { month: month.value } : undefined,
        retry: false,
        signal,
      }),
    {
      watch: [month],
      dedupe: "defer",
      deep: false,
    },
  );

  const data = computed(() =>
    raw.value ? applyLocalEdits(raw.value, edits.value) : null,
  );

  const summary = computed(() => (data.value ? summarize(data.value) : null));

  const isLoading = computed(() => status.value === "pending");

  const isEmpty = computed(
    () => status.value === "success" && data.value?.centres.length === 0,
  );

  /** User-facing message for a 422 (invalid/unavailable month). */
  const monthError = computed<string | null>(() => {
    const fetchError = error.value as FetchError<ValidationError> | null;
    if (fetchError?.statusCode !== 422) {
      return null;
    }
    return (
      fetchError.data?.errors?.month?.[0] ??
      fetchError.data?.message ??
      "The selected month is invalid."
    );
  });

  const availableMonths = computed(
    () => data.value?.meta.available_months ?? [],
  );

  return {
    data,
    summary,
    status,
    error,
    isLoading,
    isEmpty,
    monthError,
    availableMonths,
    refresh,
  };
}
