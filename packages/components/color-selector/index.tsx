'use client'
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
    "#000000", // Black
    "#ffffff", // White
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#ff00ff", // Magenta
    "#00ffff", // Cyan
  ];
  
const ColorSelector = ({control,errors}:any)=>{
      
    const [customColors,setCustomColors]= useState<string[]>([]);
    const [showColorPicker,setShowColorPicker]= useState(false);
    const [newColor,setNewColor]= useState('#ffffff');
      
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Colors</label>
            <Controller name='colors' control={control} render={({field})=> (
                <div className="flex flex-wrap items-center gap-3" >
                    {[...defaultColors , ...customColors].map((color)=>{
                        const isSelected = (field.value || []).includes(color);
                        const isLightColor = ['#ffffff', '#ffff00', '#00ffff', '#00ff00'].includes(color.toLowerCase());
                        
                        return (
                            <button 
                                type="button" 
                                key={color} 
                                onClick={()=>field.onChange(isSelected? field.value.filter((c:string)=>c!==color):[...(field.value || []),color])} 
                                className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 border-2 ${
                                    isSelected
                                      ? "scale-110 ring-2 ring-offset-2 ring-offset-slate-900 ring-white border-transparent"
                                      : isLightColor 
                                      ? "border-slate-400 hover:border-white"
                                      : "border-transparent hover:border-white"
                                }`}  
                                style={{backgroundColor:color}} 
                            ></button>
                        );
                    })}

                    {/* add new color */}
                    <button 
                        type="button" 
                        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-transparent text-slate-500 hover:bg-slate-800 hover:border-slate-500 hover:text-slate-400 transition-colors" 
                        onClick={ ()=>{setShowColorPicker(!showColorPicker)}} 
                    > 
                        <Plus size={18} />
                    </button>
                </div>
            )} />
             {/* color picker */}
            {showColorPicker && 
                <div className="relative flex items-center gap-3 mt-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg" >
                <input  
                    type="color" 
                    value={newColor} 
                    onChange={(e)=>setNewColor(e.target.value)}  
                    className="w-10 h-10 p-0 border-2 border-slate-600 rounded-md cursor-pointer appearance-none bg-transparent"  
                />
                 <button  
                    type="button" 
                    onClick={()=>{
                        setCustomColors([...customColors,newColor]);
                        setShowColorPicker(false);
                    }} 
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition-colors" 
                 >Add</button>
               </div>}
        </div>
    )
}

export default ColorSelector;