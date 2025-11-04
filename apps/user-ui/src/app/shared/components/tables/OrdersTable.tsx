'use client'
import React, { useMemo, useState } from 'react'
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight } from 'lucide-react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import axiosInstance from '../../../utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.


const fetchOrders = async () => {
   console.log('fetch orders is called')
  const res: any = await axiosInstance.get('/order/get-user-orders');
  console.log(res?.data?.orders);
  return res?.data?.orders;

}




const OrdersTable = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5
  })
  console.log(data);
  const columns = useMemo(() => [{ accessorKey: 'id', header: 'Order ID', cell: ({ row }: any) => (<span className='font-mono text-sm font-medium text-slate-800'>{row.original.id.slice(-6).toUpperCase()}</span>) }, {
    accessorKey: "users.name",
    header: " Buyer",
    cell: ({ row }: any) => (<span className='font-medium text-slate-800'>{row.original.users?.name ?? "Guest"}</span>) 
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.original.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800" }`} >{row.original.status}</span>
  },
   {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: any) => <span className="font-semibold text-slate-900">${row.original.total.toFixed(2)}</span>
  },
 
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: any) => <span className='text-slate-600' >{new Date(row?.original?.createdAt)?.toLocaleDateString()}</span>
  },
 {
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex gap-3">
        {/* View Action */}
        <Link
          href={`/order/${row.original.id}`}
          className="text-slate-500 hover:text-blue-600 transition-colors"
        >
          <Eye size={18} />
        </Link>
  
      </div>
    ),
  }


], [])

const table = useReactTable({
  data: data || [], // Ensure data is not undefined for the table
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  globalFilterFn:"includesString",
  
})

  return (

    <div className='w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50' >
      <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">My Orders</h2>
      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="text-center py-20 text-slate-500 font-medium">Loading orders...</p>
        ) : (
          <table className="w-full text-sm text-left text-slate-600">
            {/* Table Head */}
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-4 font-semibold">
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
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
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
        {!isLoading && data?.length === 0 && <p className='text-center py-20 text-slate-500 bg-slate-50 rounded-b-lg' >No Orders found!</p>}
      </div>
    </div>
  )
}

export default OrdersTable