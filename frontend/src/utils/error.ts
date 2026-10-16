import axios from "axios";

/** Extract a human-readable message from an unknown error (axios or native). */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

/** HTTP status from an axios error, or undefined for non-axios errors. */
export const getErrorStatus = (error: unknown): number | undefined =>
  axios.isAxiosError(error) ? error.response?.status : undefined;
