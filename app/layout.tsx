import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import InstallPrompt from '@/components/InstallPrompt'

export const metadata: Metadata = {
  title: 'CELA VI - Cardápio Digital',
  description: 'Sistema de cardápio digital CELA VI acessível via QR Code',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=0.85, maximum-scale=0.85, minimum-scale=0.85, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

        {/* PWA Meta Tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#D4AF37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CELA VI" />
        <link rel="apple-touch-icon" href="/logo-cela-vi-beira.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>

        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registrado com sucesso: ', registration.scope);
                  })
                  .catch(function(err) {
                    console.log('Falha no registro do SW: ', err);
                  });
              });
            }
          `
        }} />
      </body>
    </html>
  )
}

