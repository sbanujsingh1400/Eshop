'use client'
import React, { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import Input from '../input';
import { Plus, X } from 'lucide-react';

// NOTE: All logic and JSX structure are IDENTICAL. Only className strings have been updated for a better UI.

const CustomProperties = ({control,errors}:any)=>{


 const [properties,setProperties]= useState<{label:string,values:string[]}[]>([]);
  const [newLabel,setNewLabel]= useState('');
  const [newValue,setNewValue]= useState('');
  const [currentInput,setCurrentInput]= useState('');

   return <div>
    <div className='flex flex-col gap-4'>
    <Controller name={`customProperties`} control={control}  render={({field})=>{    
               
        const addProperty = ()=>{
            if(!newLabel.trim())return;
            setProperties([...properties,{label:newLabel,values:[]}]);
            setNewLabel("");
        }

        const addValue = (index:number)=>{
            if(!newValue.trim())return;
            const updatedProperties = [...properties];
            updatedProperties[index].values.push(newValue);
            setProperties(updatedProperties);
            setNewValue('')
        }
        const removeProperty = (index:number)=>{
          
            setProperties(properties.filter((_,i)=>i!==index));
            setNewValue('');
        }

               useEffect(()=>{
                field.onChange(properties);
               },[properties])

    return (<div>
        <label className='block text-sm font-semibold text-slate-300 mb-2' >Custom Properties</label>
        <div className="flex flex-col gap-4">
            {/* Existing Properties */}
            {properties.map((property,index)=>(
                <div key={index} className='border border-slate-700 p-4 rounded-lg bg-slate-800/50 space-y-3'  >
                    <div className='flex items-center justify-between' >
                        <span className="text-slate-200 font-semibold">{property.label}</span>
                        <button type='button' onClick={()=>removeProperty(index)} ><X size={18} className='text-slate-500 hover:text-red-500 transition-colors' /> </button>
                    </div>
                    {/* Add Values to property */}

                    <div className="flex items-center gap-2">
                        
                        <input type='text' className='border border-slate-600 bg-slate-800 px-3 py-1.5 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition w-full text-sm' placeholder='Enter value...'  value={currentInput==property.label ? newValue:""} onClick={()=>{setCurrentInput(property.label)}} onChange={(e)=>setNewValue(e.target.value)} />
                        <button type='button' className='px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors flex-shrink-0' onClick={()=>addValue(index)} >Add</button>
                    </div>

                    {/* show values  */}
                    <div className="flex flex-wrap gap-2">
                        {property.values.map((value,i)=>(<span key={i} className='px-2.5 py-1 bg-slate-700 text-slate-200 rounded-full text-xs font-medium' >{value}</span>))}
                    </div>

                </div>
            ))}

            {/* Add new Property */}

            <div className='flex items-center gap-2 mt-2' >
                <Input placeholder='Enter property label (e.g., Material, Warranty)' value={newLabel} onChange={(e:any)=>setNewLabel(e.target.value)} />
                <button type='button' className='px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold flex items-center gap-2 rounded-lg transition-colors flex-shrink-0' onClick={addProperty} ><Plus size={16} />Add</button>
           </div>
        </div>
    </div>)}}  />
           
   
     
    </div>
   </div>

}

export default CustomProperties;