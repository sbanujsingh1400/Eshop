import axios from "axios";
import { runRedirectToLogin } from "./redirect";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URI,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// ------------------------------
// Helper functions
// ------------------------------
const handleLogout = () => {
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  const currentPath = window.location.pathname;
  const isPublicPath = 
  currentPath === "/" || 
  publicPaths.some(prefix => currentPath.startsWith(prefix));

  if (!isPublicPath) {
    console.log("Redirecting to login...");
    runRedirectToLogin();
  }
};

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// ------------------------------
// Request Interceptor
// ------------------------------
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ------------------------------
// Response Interceptor
// ------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if config or response missing
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isRetry = originalRequest._retry;
    const requiresAuth = originalRequest.requireAuth === true;

    // If 401 and request requires auth
    if (is401 && requiresAuth && !isRetry) {
      // Handle multiple parallel requests
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() =>
            resolve(axiosInstance(originalRequest))
          );
        });
      }

      // Refresh token logic
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/refresh-token`,
          {},
          { withCredentials: true }
        );

        isRefreshing = false;

        if (res.data?.success) {
          onRefreshSuccess();
          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          handleLogout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.log("Refresh token failed", refreshError);
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
