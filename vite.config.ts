import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteSingleFile} from "vite-plugin-singlefile";

export default defineConfig(({mode}) => {
    return {
        base: './',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react(), viteSingleFile()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
