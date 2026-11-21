import React from 'react'

export default function Chip(props:any) {
    const {label}=props
  return (
    <div className='p-1 items-center bg-amber-500 text-white rounded-lg w-auto'>{label}</div>
  )
}
