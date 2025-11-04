'use client'
import React, { useMemo, useState } from 'react'
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight } from 'lucide-react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import axiosInstance from '../../../utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const fetchProducts = async () => {
  const res: any = await axiosInstance.get('/order/get-sellers-orders');
  return res?.data?.orders;
}

const deleteProducts = async (productId:any) => {
  const res: any = await axiosInstance.delete('/product/delete-product/'+productId);
}

const restoreProducts = async (productId:any) => {
  const res: any = await axiosInstance.put('/product/restore-product/'+productId);
}

const OrdersTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5
  })

  const deleteMutation = useMutation({
    mutationFn:deleteProducts,
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:["shop-products"]});
      setShowDeleteModal(false)
    }
  })

  const restoreMutation = useMutation({
    mutationFn:restoreProducts,
    onSuccess:()=>{
      queryClient.invalidateQueries({queryKey:["shop-products"]});
      setShowDeleteModal(false)
    }
  })

  const columns = useMemo(() => [{ accessorKey: 'id', header: 'Order ID', cell: ({ row }: any) => (<span className='font-mono text-sm font-medium text-slate-300'>{row.original.id.slice(-6).toUpperCase()}</span>) }, {
    accessorKey: "user.name",
    header: " Buyer",
    cell: ({ row }: any) => (<span className='font-medium text-slate-200'>{row.original.user?.name ?? "Guest"}</span>) 
  },
   {
    accessorKey: "total",
    header: "Seller Earning",
    cell: ({ row }: any) => <span className='font-semibold text-slate-100'>${(row.original.total*0.9)?.toFixed(2)}</span>
  },
  {
    accessorKey: "total",
    header: "Admin Fee ",
    cell: ({ row }: any) => <span className='font-semibold text-green-400' >${(row.original.total*0.1)?.toFixed(2)}</span>
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.original.status === "Paid" ?"bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400" }`} >{row.original.status}</span>
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: any) => <span className='text-slate-400' >{new Date(row?.original?.createdAt)?.toLocaleDateString()}</span>
  },
{
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex gap-3">
        <Link
          href={`/order/${row.original.id}`}
          className="text-slate-400 hover:text-blue-500 transition-colors"
        >
          <Eye size={18} />
        </Link>
      </div>
    ),
  }
], [])

const table = useReactTable({
  data:orders,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn:"includesString",
  state:{globalFilter},
  onGlobalFilterChange:setGlobalFilter
})

  const openDeleteModal = (product:any)=>{
    setSelectedProduct(product);
    setShowDeleteModal(true)
  }

  return (

    <div className='w-full space-y-6' >

     <div className="flex justify-between items-center">
      <h2 className='text-3xl text-white font-bold' >All Payments</h2>
      </div> 

      <div className="flex items-center text-sm">
        <span className='cursor-pointer text-blue-400 hover:text-blue-300' >
            Dashboard
        </span>
        <ChevronRight size={16} className='text-slate-500 mx-1' />
        <span className='text-slate-400' >All Payments</span>
      </div>
{/* Search Bar */}
<div className="flex items-center bg-slate-800/80 p-2 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition">
  <Search size={18} className="text-slate-500 mr-2" />
  <input
    type="text"
    placeholder="Search payments..."
    className="w-full bg-transparent text-slate-300 placeholder-slate-500 outline-none"
    value={globalFilter}
    onChange={(e) => setGlobalFilter(e.target.value)}
  />
</div>
{/* Table */}
<div className="overflow-x-auto bg-slate-800/80 rounded-lg border border-slate-700">
  {isLoading ? (
    <p className="text-center py-20 text-slate-400">Loading payments...</p>
  ) : (
    <table className="w-full text-sm text-left text-slate-400">
      {/* Table Head */}
      <thead className="text-xs text-slate-400 uppercase bg-slate-900/50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="p-4 font-semibold tracking-wider">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      {/* Table Body */}
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="border-b border-slate-700/50 hover:bg-slate-800 transition-colors"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="p-4 align-middle">
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )}
{!isLoading && orders.length ===0 && <p className='text-center py-20 text-slate-500' >No payments found!</p>}

</div>
    </div>
  )
}

export default OrdersTable;