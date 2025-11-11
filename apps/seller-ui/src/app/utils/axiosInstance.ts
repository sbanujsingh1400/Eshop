import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_SERVER_URI:process.env.NEXT_PUBLIC_SERVER_URI_LOCAL,
    withCredentials: true
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

// handle logout and prevent infinite loops
const handleLogout = () => {
    // console.log('inside handle logout')
    const publicPaths = ["/login", "/signup", "/forgot-password"];
  
    const currentPath = window.location.pathname;
    console.log(currentPath)
    const isPublicPath = publicPaths.some(prefix => currentPath.startsWith(prefix));
    if (!isPublicPath) {
        console.log("Redirecting to login...");
        window.location.href="/login"
      }
  
}

// Handle adding new access token to queued requests
const subscribeTokenRefresh = (callback: () => void) => {
    refreshSubscribers.push(callback);
}

// Execute queued req after refresh
const onRefreshSuccess = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
}

// handle api req
axiosInstance.interceptors.request.use((config) => config, (error) => Promise.reject(error));

// handle expired tokens and re fresh logic
axiosInstance.interceptors.response.use(
    (response) => response, // Directly return successful responses
    async (error) => {
        const originalRequest = error.config;
        const is401 = error?.response?.status === 401;

        if (!error.response || !originalRequest) {
            return Promise.reject(error);
            }
            

        // Check if it's a 401 error and not already a retry
        if (is401 && !originalRequest._retry) {
            
            // Mark this request as retried
            originalRequest._retry = true;

            if (isRefreshing) {
                // If a refresh is already in progress, queue this request
                return new Promise((resolve) => {
                    subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
                });
            }

            // This is the first 401, start the token refresh
            isRefreshing = true;

            try {
                // console.log('Attempting to refresh token...');
             const res =   await axios.post(
                    `${process?.env?.NODE_ENV=='production'?process?.env?.NEXT_PUBLIC_SERVER_URI:process?.env?.NEXT_PUBLIC_SERVER_URI_LOCAL}/refresh-token`,
                    {},
                    { withCredentials: true }
                );
                // console.log('Token refresh successful');

                isRefreshing = false;
                if (res.data?.success) {
                onRefreshSuccess();
                return axiosInstance(originalRequest);
            }else {
                handleLogout();
                return Promise.reject(error);
               
            }

                // Retry the original request that failed
                // return axiosInstance(originalRequest);

            } catch (refreshError) {
                // The refresh attempt failed. Log the user out.
                console.error("Token refresh failed:", refreshError);
                isRefreshing = false;
                refreshSubscribers = [];
                handleLogout();

                // Reject the promise of the original request
                return Promise.reject(refreshError);
            }
        }

        // For all other errors (non-401) or if it's already a retry, just reject
        return Promise.reject(error);
    }
);

export default axiosInstance;