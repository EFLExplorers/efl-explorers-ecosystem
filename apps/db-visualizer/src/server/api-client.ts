import { headers } from "next/headers";

const getBaseUrl = async () => {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";

  if (!host) {
    return "http://localhost:3004";
  }

  return `${protocol}://${host}`;
};

export const fetchFromApi = async <T>(path: string): Promise<T> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`API request failed for ${path} (${response.status}): ${bodyText}`);
  }

  return (await response.json()) as T;
};
