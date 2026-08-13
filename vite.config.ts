import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Auch im WLAN erreichbar, nicht nur auf diesem PC – so kann man das Spiel
    // direkt auf dem Handy öffnen (http://<PC-IP>:5173), ohne etwas zu installieren.
    host: true,
  },
})
