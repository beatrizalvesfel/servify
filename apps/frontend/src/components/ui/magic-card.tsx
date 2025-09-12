'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MagicCardProps {
  children: ReactNode
  className?: string
}

export function MagicCard({ children, className }: MagicCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
