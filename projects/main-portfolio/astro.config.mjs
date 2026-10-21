import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://nedelkoskifilip6.github.io',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  build: { assets: 'portfolio-assets' },
  devToolbar: { enabled: false },
  vite: {
    plugins: [
      {
        name: 'local-device-review',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use('/__preview', (request, response) => {
            const query = new URL(request.url, 'http://localhost').searchParams;
            const width = Math.max(320, Math.min(1500, Number(query.get('width')) || 390));
            const height = Math.max(600, Math.min(1100, Number(query.get('height')) || 844));
            const target = new URLSearchParams();
            for (const key of ['audit', 'motion', 'inspect-entry'])
              if (query.has(key)) target.set(key, query.get(key));
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            const scale = Math.min(1, 600 / height);
            response.end(
              `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Portfolio — ${width} × ${height} review</title><style>body{margin:0;min-height:100vh;background:#181818;display:grid;place-content:center;font:12px system-ui;color:#ddd}p{text-align:center}.device{width:${width * scale}px;height:${height * scale}px}iframe{width:${width}px;height:${height}px;transform:scale(${scale});transform-origin:top left;border:1px solid #555;max-width:none;background:#000}</style><p>LOCAL DEVICE REVIEW · ${width} × ${height}</p><div class="device"><iframe title="Portfolio mobile viewport" src="/?${target}"></iframe></div></html>`,
            );
          });
        },
      },
    ],
  },
});
