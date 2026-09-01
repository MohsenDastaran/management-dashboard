import type { FetchError } from "ofetch";
import type {
  CapacityOverview,
  ValidationError,
  YearMonth,
} from "~/types/capacity";
import { applyLocalEdits, summarize } from "~/lib/capacity";
import { getCapacityPayloadError } from "~/lib/editValidation";

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

  const processed = computed(() => {
    if (!raw.value) {
      return {
        data: null as CapacityOverview | null,
        summary: null,
        processingError: null as string | null,
      };
    }

    const payloadError = getCapacityPayloadError(raw.value);
    if (payloadError) {
      return { data: null, summary: null, processingError: payloadError };
    }

    try {
      const patched = applyLocalEdits(raw.value, edits.value);
      return {
        data: patched,
        summary: summarize(patched),
        processingError: null,
      };
    } catch {
      try {
        return {
          data: raw.value,
          summary: summarize(raw.value),
          processingError:
            "Local edits could not be applied because the data is not valid. Changes were ignored.",
        };
      } catch {
        return {
          data: null,
          summary: null,
          processingError:
            "Capacity data could not be processed. Check the response and try again.",
        };
      }
    }
  });

  const data = computed(() => processed.value.data);
  const summary = computed(() => processed.value.summary);
  const processingError = computed(() => processed.value.processingError);

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
    processingError,
    availableMonths,
    refresh,
  };
}
