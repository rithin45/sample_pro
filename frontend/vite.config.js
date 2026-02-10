import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Auth pages
          'chunk-auth': ['./src/auth/Login.jsx', './src/auth/Signup.jsx'],
          
          // Admin pages
          'chunk-admin': ['./src/admin/AdminDashboard.jsx', './src/admin/ProductForm.jsx', './src/admin/ProductList.jsx'],
          
          // User pages
          'chunk-user': ['./src/components/Cart.jsx', './src/components/Checkout.jsx', './src/components/Invoice.jsx'],
          
          // Product pages
          'chunk-product': ['./src/components/ProductDetail.jsx'],
          
          // Home
          'chunk-home': ['./src/components/Home.jsx'],
          
          // Context
          'chunk-context': ['./src/context/AuthContext.jsx', './src/context/CartContext.jsx'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
