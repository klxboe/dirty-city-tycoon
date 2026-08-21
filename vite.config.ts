import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Auch im WLAN erreichbar, nicht nur auf diesem PC – so kann man das Spiel
    // direkt auf dem Handy öffnen (http://<PC-IP>:5173), ohne etwas zu installieren.
    host: true,
    // Erlaubt Zugriff über einen Cloudflare-"Quick Tunnel" (cloudflared tunnel --url
    // http://localhost:5173) – für Leute außerhalb des eigenen WLANs (z.B. ein Kollege).
    // Vite blockt sonst jeden Host-Header, der nicht localhost/die eigene IP ist (Schutz
    // vor DNS-Rebinding), genau das würde die zufällige *.trycloudflare.com-Adresse treffen.
    allowedHosts: ['.trycloudflare.com'],
  },
})
