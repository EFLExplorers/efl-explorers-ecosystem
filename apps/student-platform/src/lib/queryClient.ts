import { QueryClient, QueryFunction } from "@tanstack/react-query";

const throwIfResNotOk = async (response: Response) => {
  if (response.ok) {
    return;
  }

  const text = (await response.text()) || response.statusText;
  throw new Error(`${response.status}: ${text}`);
};

export const apiRequest = async (
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> => {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(response);
  return response;
};

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401 }) =>
  async ({ queryKey }) => {
    const response = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (on401 === "returnNull" && response.status === 401) {
      return null;
    }

    await throwIfResNotOk(response);
    return response.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
