// app/components/trainUtil/Legend.tsx
import React from "react"

const Legend: React.FC = () => {
  return(
    <div className='mt-4 space-x-2'>
      <div className="inline-block w-4 h-4 bg-red-500 rounded-full"></div>
      <span>Red Line</span>
      <div className="inline-block w-4 h-4 bg-blue-500 rounded-full"></div>
      <span>Blue Line</span>
      <div className="inline-block w-4 h-4 bg-green-500 rounded-full"></div>
      <span>Green Line</span>
    </div>
  )
};

export default Legend;