import type { FetchError } from "ofetch";
import type {
  CapacityOverview,
  ValidationError,
  YearMonth,
} from "~/types/capacity";
import { summarize } from "~/lib/capacity";

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
 * All callers share one fetch (same key) driven by `useReportingMonth`, so
 * changing the month in the navbar refetches for every page.
 */
export function useCapacityOverview() {
  const config = useRuntimeConfig();
  const month = useReportingMonth();

  const { data, status, error, refresh } = useFetch<CapacityOverview>(
    "/api/v1/capacity-overview",
    {
      key: "capacity-overview",
      baseURL: config.public.apiBase,
      query: computed(() => ({ month: month.value ?? undefined })),
    },
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
