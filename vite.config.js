import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/www.lamagdalena.com/',
    plugins: [
        react(),
        ViteImageOptimizer({
            test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
            exclude: undefined,
            include: undefined,
            includePublic: true,
            logStats: true,
            ansiColors: true,
            svg: {
                multipass: true,
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                cleanupNumericValues: false,
                                removeViewBox: false, // keep the viewBox at all costs
                                noPersistViewBox: true,
                            },
                        },
                    },
                    'sortAttrs',
                    {
                        name: 'addAttributesToSVGElement',
                        params: {
                            attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                        },
                    },
                ],
            },
            png: {
                // quality: 100,
                quality: 80,
            },
            jpeg: {
                // quality: 100,
                quality: 80,
            },
            jpg: {
                // quality: 100,
                quality: 80,
            },
            webp: {
                // https://sharp.pixelplumbing.com/api-output#webp
                quality: 80,
            },
            avif: {
                // https://sharp.pixelplumbing.com/api-output#avif
                quality: 70,
            },
        }),
    ],
    server: {
        port: 3000
    }
})
