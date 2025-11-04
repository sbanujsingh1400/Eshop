import React from 'react'

const QuickActionCard = ({Icon,title,description}:any) => {
  return (
    <div className='bg-white p-5 cursor-pointer rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200/80 flex items-start gap-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:bg-slate-50/50' >
        <Icon className='w-10 h-10 text-blue-600 bg-blue-100 p-2.5 rounded-full flex-shrink-0 mt-0.5' />
        <div>
            <h4 className='text-base font-bold text-slate-800 mb-0.5' >{title}</h4>
            <p className='text-sm text-slate-500 leading-snug'>{description}</p>
        </div>
    </div>
  )
}

export default QuickActionCard