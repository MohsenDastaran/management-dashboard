import type { FetchError } from "ofetch";
import type {
  CapacityOverview,
  ValidationError,
  YearMonth,
} from "~/types/capacity";
import { summarize } from "~/lib/capacity";

/**
 * Fetches the capacity overview for a reporting month and exposes the raw
 * payload plus the derived summary from the capacity engine.
 *
 * Pass a ref/getter as `month` to make the query reactive; `null`/`undefined`
 * omits the parameter so the API uses the current reporting month.
 */
export function useCapacityOverview(
  month?: MaybeRefOrGetter<YearMonth | null | undefined>,
) {
  const config = useRuntimeConfig();

  const { data, status, error, refresh } = useFetch<CapacityOverview>(
    "/api/v1/capacity-overview",
    {
      key: "capacity-overview",
      baseURL: config.public.apiBase,
      query: computed(() => ({ month: toValue(month) ?? undefined })),
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
