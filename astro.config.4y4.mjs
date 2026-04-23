// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    outDir: './dist-4y4',
    vite: {
        define: {
            'import.meta.env.PUBLIC_SHOW_ADS': '"true"',
        },
    },
});
