'use client'

import React from 'react'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Star,
  Package,
  AlertTriangle,
  BarChart,
  PieChart,
  ChevronRight,
  MessageSquare,
  IndianRupee,
  Loader2, // For loading spinner
  AlertCircle, // For error
} from 'lucide-react'
import Link from 'next/link'
import { QueryClient, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { orderStatus as OrderStatusEnum } from '@prisma/client' // Import enum from Prisma
import axiosInstance from '@/app/utils/axiosInstance' // Adjust path if needed
import RevenueBarChart from '@/app/shared/components/charts/RevenueOverTimeChart'
import OrderStatusDonutChart from '@/app/shared/components/charts/OrderStatusChart'

// --- Type Definition (Matches your controller's response structure) ---
type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalVisitors: number;
  averageRating: number;
};

type RecentOrder = {
  id: string;
  userId: string; // Assuming userId is available if needed, though controller only selects name
  total: number;
  deliveryStatus: OrderStatusEnum;
  users: { name: string };
  createdAt: string; // Dates will likely be strings from JSON
};

type LowStockProduct = {
  id: string;
  title: string;
  stock: number;
  images: { url: string }[];
};

type RecentReview = {
  id: string;
  rating: number;
  comment: string | null; // Review comment might be optional
  users: { name: string; avatar?: { url: string }[] }; // Added avatar based on controller
  product: { title: string }; // Added based on controller
  createdAt: string; // Dates will likely be strings from JSON
};

type ChartDataPoint = {
  name: string; // Date for revenue, Status for orderStatus
  value?: number; // For orderStatus
  revenue?: number; // For revenueOverTime
};

// Main data structure from API { success: boolean, data: DashboardData }
type ApiResponseType = {
  success: boolean;
  data: DashboardData;
}

type DashboardData = {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
  recentReviews: RecentReview[];
  orderStatus: ChartDataPoint[];
  revenueOverTime: ChartDataPoint[];
};

// --- Reusable Dashboard Components ---

type ChartHolderProps = {
  type: 'bar' | 'donut';
  data: any[] | undefined;
  title: string; // Title for empty state
  icon: React.ReactNode; // Icon for empty state
};

const ChartHolder: React.FC<ChartHolderProps> = ({
  type,
  data,
  title,
  icon,
}) => {
  const hasData = data && data.length > 0;

  // Render the empty state placeholder if no data
  if (!hasData) {
    return (
      <div className="h-80 w-full bg-slate-700/50 rounded-lg flex flex-col items-center justify-center text-slate-500 border border-slate-700">
        {icon}
        <span className="mt-2 text-sm font-medium">{title}</span>
      </div>
    )
  }

  // Render the correct chart based on type
  if (type === 'bar') {
    return <RevenueBarChart data={data} />
  }

  if (type === 'donut') {
    return <OrderStatusDonutChart data={data} />
  }

  return null; // Should not happen
}

const StatCardSkeleton: React.FC = () => (
  <div className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 animate-pulse">
    <div className="p-3 rounded-full bg-slate-700 h-11 w-11"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-7 bg-slate-600 rounded w-1/2"></div>
    </div>
  </div>
);

interface StatCardProps {
  title: string;
  value: string;
  change?: string; // Optional change indicator
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => (
  <div className="bg-slate-800 p-5 rounded-xl shadow-lg flex items-center gap-4 transition-all hover:bg-slate-700/80">
    <div className="p-3 rounded-full bg-slate-700 text-blue-400 flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <h5 className="text-slate-400 text-sm font-medium truncate">{title}</h5>
      <p className="text-2xl font-bold text-white truncate">{value}</p>
      {change && (
        <p className="text-xs text-green-500 truncate">{change}</p>
      )}
    </div>
  </div>
);

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  viewAllLink?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, viewAllLink, className = '' }) => (
  <div className={`bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg h-full ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {viewAllLink && (
        <Link href={viewAllLink} className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-all">
          View all
          <ChevronRight size={16} className="ml-1" />
        </Link>
      )}
    </div>
    <div>
      {children}
    </div>
  </div>
);

// --- Status Badge Helper (Updated to match Prisma Enum and add null check) ---
const OrderStatusBadge: React.FC<{ deliveryStatus?: OrderStatusEnum | null }> = ({ deliveryStatus }) => {
  if (!deliveryStatus) return null; // Handle potential null status

  const statusMap: Record<OrderStatusEnum, string> = {
    Processing: 'bg-blue-500/20 text-blue-300',
    Paid: 'bg-yellow-500/20 text-yellow-300',
    Shipped: 'bg-cyan-500/20 text-cyan-300',
    Delivered: 'bg-green-500/20 text-green-300',
    Ordered: 'bg-gray-500/20 text-gray-300',
    Packed: 'bg-indigo-500/20 text-indigo-300',
    OutForDelivery: 'bg-orange-500/20 text-orange-300',
    Cancelled: 'bg-red-500/20 text-red-300',
  };
  const displayName = deliveryStatus === 'OutForDelivery' ? 'Out for Delivery' : deliveryStatus;

  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${statusMap[deliveryStatus] || statusMap.Ordered}`}>
      {displayName}
    </span>
  );
};

// --- Form Type for Date Range ---
type DashboardFilterForm = {
  dateRange: '7d' | '30d' | '90d';
};

// --- Main Dashboard Component ---
const DashboardPage = () => {
    const queryClient = new QueryClient();
  const { register, watch } = useForm<DashboardFilterForm>({
    defaultValues: {
      dateRange: '30d',
    },
  });

  const dateRange = watch('dateRange');

  // --- Data Fetching with useQuery ---
  const fetchDashboardData = async (range: string): Promise<DashboardData> => {
    // Make sure the endpoint matches your backend route exactly
    const response = await axiosInstance.get<ApiResponseType>(`/product/api/dashboard?range=${range}`);
    console.log(response.data.data)
    if (!response.data.success) {
        throw new Error("API returned success: false");
    }
    return response.data.data; // Return the nested 'data' object
  };

  const { data, isLoading, isError, error, isFetching } = useQuery<DashboardData, Error>({
    queryKey: ['dashboardData', dateRange], 
    queryFn: () => fetchDashboardData(dateRange),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    refetchOnWindowFocus: false, // Optional: prevent refetch on window focus
  });

  // --- Helper to format currency ---
  const formatCurrency = (value: number | undefined | null) => {
    if (value == null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0, 
    }).format(value);
  }

  // --- Helper to format numbers ---
   const formatNumber = (value: number | undefined | null) => {
    if (value == null) return '0';
    return value.toLocaleString('en-IN');
  }

  // --- Render Error State ---
  if (isError) {
    return (
      <main className="flex-1 bg-slate-900 p-4 md:p-8 text-white min-h-screen flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-lg flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle size={48} className="text-red-500" />
          <h2 className="text-2xl font-bold text-white">Failed to load dashboard</h2>
          <p className="text-slate-400">
            {error?.message || 'An unknown error occurred. Please try refreshing the page.'}
          </p>
           {/* Optional: Add a refresh button */}
           <button 
                onClick={() => queryClient.refetchQueries({ queryKey: ['dashboardData', dateRange] })}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Retry
            </button>
        </div>
      </main>
    )
  }
 
  // --- Render Page ---
  return (
    <main className="flex-1 bg-slate-900 p-4 md:p-8 text-white min-h-screen relative">
      {/* Loading Overlay */}
       {isFetching && (
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50">
                <Loader2 size={48} className="text-blue-400 animate-spin" />
            </div>
        )}

      {/* Header with Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Shop Dashboard</h1>
        <form>
          <div>
            <label htmlFor="dateRange" className="sr-only">Date Range</label>
            <select
              id="dateRange"
              {...register('dateRange')}
              className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5"
              disabled={isFetching} // Disable while fetching
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </form>
      </div>


      {/* Row 1: Key Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {isLoading ? ( // Show skeletons only on initial load
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : data ? ( // Render cards with data once available
          <>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(data.stats?.totalRevenue)}
              icon={<DollarSign size={22} />}
            />
            <StatCard
              title="Total Orders"
              value={formatNumber(data.stats?.totalOrders)}
              icon={<ShoppingCart size={22} />}
            />
            <StatCard
              title="Total Visitors"
              value={formatNumber(data.stats?.totalVisitors)}
              icon={<Users size={22} />}
            />
            <StatCard
              title="Average Rating"
              value={`${(data.stats?.averageRating ?? 0).toFixed(1)} / 5.0`}
              icon={<Star size={22} />}
            />
          </>
        ) : null /* Handle case where data is somehow null after loading */} 
      </div>

      {/* Row 2: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <DashboardCard title="Revenue Over Time" className="lg:col-span-2">
          {isLoading ? (
            <div className="h-80 w-full bg-slate-800 rounded-lg flex items-center justify-center animate-pulse"></div>
          ) : (
            <ChartHolder
              type="bar"
              data={data?.revenueOverTime}
              title="No sales data"
              icon={<BarChart size={48} />}
            />
          )}
        </DashboardCard>
        <DashboardCard title="Order Status">
          {isLoading ? (
            <div className="h-80 w-full bg-slate-800 rounded-lg flex items-center justify-center animate-pulse"></div>
          ) : (
            <ChartHolder
              type="donut"
              data={data?.orderStatus}
              title="No order data"
              icon={<PieChart size={48} />}
            />
          )}
        </DashboardCard>
      </div>

      {/* Row 3: Actionable Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <DashboardCard title="Recent Orders" viewAllLink="/dashboard/orders" className="lg:col-span-2">
          {isLoading ? (
             <p className="text-slate-400 text-sm animate-pulse">Loading recent orders...</p>
          ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
            <p className="text-slate-400 text-sm">No recent orders found for this period.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {data.recentOrders.map(order => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4 hover:bg-slate-700/40 -mx-4 px-4 rounded-lg"
                >
                  <div className="flex-1 min-w-[150px]">
                    <p className="font-medium text-white truncate">{order.users?.name || 'Unknown User'}</p>
                    <p className="text-sm text-slate-400">{order.id}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:gap-6 w-full sm:w-auto">
                    <div className="sm:text-right">
                      <p className="font-medium text-white">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:text-right">
                      <OrderStatusBadge deliveryStatus={order?.deliveryStatus!} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        {/* Low Stock Products */}
        <DashboardCard title="Low Stock Products" viewAllLink="/dashboard/all-products">
          {isLoading ? (
             <p className="text-slate-400 text-sm animate-pulse">Loading products...</p>
          ) : !data?.lowStockProducts || data.lowStockProducts.length === 0 ? (
             <p className="text-slate-400 text-sm">All products are well-stocked.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {data.lowStockProducts.map(product => (
                <li key={product.id} className="flex items-center gap-4 py-3 hover:bg-slate-700/40 -mx-6 px-6 rounded-lg">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/40x40/1e293b/94a3b8?text=?'}
                    alt={product.title || 'Product'}
                    className="h-10 w-10 rounded-md object-cover flex-shrink-0 bg-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.title}</p>
                    <p className="text-sm text-slate-400">
                      <span className="text-red-400 font-bold">{product.stock} units</span> left
                    </p>
                  </div>
                  <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      {/* Row 4: Recent Reviews */}
      <div className="mt-6">
        <DashboardCard title="Recent Reviews" >
          {isLoading ? (
             <p className="text-slate-400 text-sm animate-pulse">Loading reviews...</p>
          ) : !data?.recentReviews || data.recentReviews.length === 0 ? (
            <p className="text-slate-400 text-sm">No new reviews in this period.</p>
          ) : (
            <ul className="divide-y divide-slate-700">
              {data.recentReviews.map(review => (
                <li key={review.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{review.users?.name || 'Anonymous'}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-yellow-400">{(review.rating || 0).toFixed(1)}</span>
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  {review.comment && (
                     <p className="text-sm text-slate-300 mt-2 italic">"{review.comment}"</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>
    </main>
  )
}

// Make sure to wrap your app in QueryClientProvider
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// const queryClient = new QueryClient();
// <QueryClientProvider client={queryClient}> <DashboardPage /> </QueryClientProvider>

export default DashboardPage;
