// Magic UI configuration and utilities
export const magicUI = {
  // Animation presets
  animations: {
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3 }
    },
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 }
    },
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.5 }
    }
  },
  
  // Hover effects
  hoverEffects: {
    lift: {
      whileHover: { 
        scale: 1.05,
        transition: { duration: 0.2 }
      }
    },
    glow: {
      whileHover: { 
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
        transition: { duration: 0.2 }
      }
    },
    rotate: {
      whileHover: { 
        rotate: 5,
        transition: { duration: 0.2 }
      }
    }
  }
}

// Utility function to combine animations
export function combineAnimations(...animations: any[]) {
  return animations.reduce((acc, animation) => ({
    ...acc,
    ...animation
  }), {})
}
