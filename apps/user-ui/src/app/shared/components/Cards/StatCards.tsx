import React from 'react'

const StatCards = ({title,count,Icon}:any) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200/80 flex items-center justify-between transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl' >
        <div>
            <h3 className='text-base font-semibold text-slate-500'>
                {title}
                <p className='text-4xl font-bold text-slate-800 mt-1'>{count}</p>
            </h3>
            
        </div>
        <Icon className='w-12 h-12 text-blue-500 bg-blue-100 p-3 rounded-full' />
    </div>
  )
}

export default StatCards