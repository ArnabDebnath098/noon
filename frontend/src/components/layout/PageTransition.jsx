import { motion } from 'framer-motion'

// Wraps each routed page so route changes slide in from the right (and the
// outgoing page slides off to the left). Used with AnimatePresence in AppRoutes.
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-100%', opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
