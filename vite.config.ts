import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// import viteCompression from 'vite-plugin-compression'
import { join } from 'path'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return defineConfig({
    publicDir: 'public',
    plugins: [
      react(),
      //  viteCompression()
    ],
    css: {
      preprocessorOptions: {
        // 预编译支持 less
        less: {
          // 支持内联 JavaScript
          javascriptEnabled: true,
        },
      },
    },

    server: {
      proxy: {
        '/lending/query': {
          // mock
          target: 'https://xbank.global',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/query/, ''),
        },
        '/lending/api': {
          // mock
          target: 'https://xbank.global/',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // '/api/ver2/': {
        //   target: 'https://xcr.tratao.com',
        //   changeOrigin: true,
        //   secure: false,
        // },
        '/api/v1/': {
          target: 'https://xbank.global',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          target: 'https://api-goerli.etherscan.io/api',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      assetsDir: '',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-venders': [
              'react',
              'react-dom',
              'react-router-dom',
              'video-react',
              'react-photo-view',
            ],
            'chakra-vendors': ['@chakra-ui/react'],
            'apollo-vendors': ['@apollo/client', 'graphql'],
            'web3-vendors': ['web3'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': join(__dirname, 'src'),
      },
    },
    esbuild: {
      drop:
        env.VITE_CURRENT_ENV === 'PRODUCTION' ? ['console', 'debugger'] : [],
    },
  })
}
