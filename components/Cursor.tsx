'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

const Cursor = () => {
  const [isHovering, setIsHovering] = useState(false)
  const [is3D, setIs3D] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring configuration for the trailing ring
  const springConfig = { damping: 25, stiffness: 150 }
  const ringX = useSpring(mouseX, springConfig)
  const ringY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      const target = e.target as HTMLElement
      const isClickable = target.closest('button, a, input, select, textarea, [role="button"]')
      const is3DElement = target.closest('canvas, .three-element')

      setIsHovering(!!isClickable)
      setIs3D(!!is3DElement)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <>
      {/* Small Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full z-[9999] pointer-events-none mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 2 : 1,
          backgroundColor: is3D ? '#4F46E5' : '#FFFFFF',
          boxShadow: is3D ? '0 0 15px #4F46E5' : 'none'
        }}
      />

      {/* Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full z-[9998] pointer-events-none"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 0.5 : 1,
          borderColor: is3D ? '#4F46E5' : 'rgba(255, 255, 255, 0.5)',
          boxShadow: is3D ? '0 0 20px #4F46E5' : 'none'
        }}
      />
    </>
  )
}

export default Cursor
