import React from 'react'
import './Header.css'
import { MdInfoOutline, MdOutlineTranslate } from "react-icons/md";

export default function Header() {
  return (
    <div className='header-wrapper'>
        <header className='header'>Multi-GPU Path Tracer</header>
        <div className='header-buttons-wrapper'>
            <MdInfoOutline color='white' size={24} />
            <MdOutlineTranslate color='white' size={24} />
        </div>
    </div>
  )
}
