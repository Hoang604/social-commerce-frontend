import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../lib/api";

// --- Get Facebook Auth URL ---
const getFacebookAuthUrl = async () => {
  const { data } = await api.get("/facebook/connect/auth-url");
  return data.authUrl;
};

export const useFacebookAuthUrlQuery = (options = {}) => {
  return useQuery({
    queryKey: ["facebookAuthUrl"],
    queryFn: getFacebookAuthUrl,
    enabled: false, // Chỉ fetch khi được gọi bằng refetch()
    ...options,
  });
};

// --- Get Pending Pages ---
const getPendingPages = async () => {
  const { data } = await api.get("/facebook/connect/pending-pages");
  return data.pages;
};

export const usePendingPagesQuery = () => {
  return useQuery({
    queryKey: ["pendingPages"],
    queryFn: getPendingPages,
  });
};

// --- Connect Pages ---
const connectPages = async (
  pages: { facebookPageId: string; pageName: string }[]
) => {
  const { data } = await api.post("/connected-pages", { pages });
  return data;
};

export const useConnectPagesMutation = () => {
  return useMutation({
    mutationFn: connectPages,
  });
};
