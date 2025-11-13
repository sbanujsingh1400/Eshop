'use client'
import React, { useMemo, useState } from 'react'
import { Search, Pencil, Trash, Eye, Plus, BarChart, Star, ChevronRight } from 'lucide-react'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'
import axiosInstance from '../../../utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image' 
import Link from 'next/link'
import DeleteConfirmationModel from '../../../shared/components/modals/DeleteConfirmationModel'



const fetchProducts = async () => {

  const res: any = await axiosInstance.get('/product/get-shop-product');
  console.log(res?.data?.products);
  return res?.data?.products;

}


const deleteProducts = async (productId:any) => {

  const res: any = await axiosInstance.delete('/product/delete-product/'+productId);
  console.log(res?.data);
  // return res?.data?.products;

}


const restoreProducts = async (productId:any) => {

  const res: any = await axiosInstance.put('/product/restore-product/'+productId);
  console.log(res?.data);
  // return res?.data?.products;

}


const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();

  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
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

  const columns = useMemo(() => [{ accessorKey: 'image', header: 'Image', cell: ({ row }: any) => (<Image src={row.original?.images[0]?.url} height={48} width={48} alt={row.original.title} className='w-12 h-12 rounded-lg object-cover' />) }, {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }: any) => {
      const truncatedTitle =
        row.original.title.length > 25
          ? `${row.original.title.substring(0, 25)}...`
          : row.original.title;

      return (
        <Link
          href={`${process.env.NODE_ENV=='production'?process.env.NEXT_PUBLIC_USER_UI_LINK:process.env.NEXT_PUBLIC_USER_UI_LINK_LOCAL}/product/${row.original.slug}`}
          className="font-medium text-blue-400 hover:underline"
          title={row.original.title}
        >
          {truncatedTitle}
        </Link>
      );
    },


  },
   {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }: any) => <span className="font-semibold text-slate-200">${row.original.sale_price}</span>
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }: any) => <span className="text-slate-300">{row.original.stock}</span>
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: any) => <span className="text-slate-300">{row.original.category}</span>
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }: any) => <div className='flex items-center gap-1 text-yellow-400' >
        <Star fill='#facc15' size={18} className="text-yellow-400" />
        <span className='text-slate-300' > {row.original.ratings || 0} </span>
      </div>
  },{
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex items-center gap-4">
        {/* View Action */}
        <Link
          href={`/product/${row.original.slug}`}
          className="text-slate-400 hover:text-blue-500 transition-colors"
        >
          <Eye size={18} />
        </Link>
  
        {/* Edit Action */}
        {/* <Link
          href={`/product/edit/${row.original.id}`}
          className="text-slate-400 hover:text-yellow-500 transition-colors"
        >
          <Pencil size={18} />
        </Link> */}
  
        {/* Analytics Action */}
        {/* <button
          className="text-slate-400 hover:text-green-500 transition-colors"
          // onClick={() => openAnalytics(row.original)}
        >
          <BarChart size={18} />
        </button> */}
  
        {/* Delete Action */}
        <button
          className="text-slate-400 hover:text-red-500 transition-colors"
          onClick={() => openDeleteModal(row.original)}
        >
          <Trash size={18} />
        </button>
      </div>
    ),
  }


], [])

const table = useReactTable({
  data:products,
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
      <h2 className='text-3xl text-white font-bold' >All Products</h2>
      <Link href={'/dashboard/create-product'} className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors'  > 
        <Plus size={18} /> Add Product
       </Link>
      </div> 

      <div className="flex items-center text-sm">
        <span className='cursor-pointer text-blue-400 hover:text-blue-300' >
            Dashboard
        </span>
        <ChevronRight size={16} className='text-slate-500 mx-1' />
        <span className='text-slate-400' >All Products</span>
      </div>
{/* Search Bar */}
<div className="flex items-center bg-slate-800/80 p-2 rounded-lg border border-slate-700 focus-within:ring-2 focus-within:ring-blue-500 transition">
  <Search size={18} className="text-slate-500 mr-2" />
  <input
    type="text"
    placeholder="Search products by name, category..."
    className="w-full bg-transparent text-slate-300 placeholder-slate-500 outline-none"
    value={globalFilter}
    onChange={(e) => setGlobalFilter(e.target.value)}
  />
</div>
{/* Table */}
<div className="overflow-x-auto bg-slate-800/80 rounded-lg border border-slate-700">
  {isLoading ? (
    <p className="text-center py-20 text-slate-400">Loading products...</p>
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
  {showDeleteModal && (<DeleteConfirmationModel product={selectedProduct} onClose={()=>setShowDeleteModal(false)} onConfirm={()=>deleteMutation.mutate(selectedProduct?.id)} onRestore={()=>restoreMutation.mutate(selectedProduct?.id)} />)}
  {!isLoading && products.length ===0 && <p className='text-center py-20 text-slate-500' >No Products found!</p>}
</div>
    </div>
  )
}

export default ProductList;