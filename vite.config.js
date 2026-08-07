import { defineConfig } from 'vite';

/** Vistas diferidas — no modulepreload en el HTML del entry (T52). */
const DEFERRED_CHUNK = /\/(view-|research-gemini|charts-)/;

export default defineConfig({
  base: '/Dropdeep/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    modulePreload: {
      resolveDependencies(filename, deps) {
        // Precargar solo vendors del shell; vistas van on-demand
        return deps.filter(
          (d) => d.includes('vendor-') && !DEFERRED_CHUNK.test(d),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) return 'charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@google/generative-ai')) return 'vendor-gemini';
            if (id.includes('dompurify')) return 'vendor-dompurify';
            if (id.includes('/lucide')) return 'vendor-lucide';
            return undefined;
          }
          // Nombrar chunks de vistas pesadas (solo si el grafo las deja diferidas)
          if (id.includes('/src/ui/report.js')) return 'view-report';
          if (id.includes('/src/ui/portfolio.js')) return 'view-portfolio';
          if (id.includes('/src/ui/spy.js')) return 'view-spy';
          if (id.includes('/src/ui/promptHub.js')) return 'view-prompt-hub';
          if (id.includes('/src/ui/export.js')) return 'view-export';
          if (id.includes('/src/ui/copilotPanel.js')) return 'view-copilot';
          if (id.includes('/src/ui/manualEvaluation.js')) return 'view-manual-eval';
          if (id.includes('/src/ui/discover.js')) return 'view-discover';
          if (id.includes('/src/ui/metaAdsAuditPanel.js')) return 'view-meta-audit';
          if (id.includes('/src/research/gemini.js')) return 'research-gemini';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
