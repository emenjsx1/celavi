'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Escutar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(beforeInstallPromptEvent)
      
      // Mostrar o prompt após um pequeno delay
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)
    }

    // Escutar evento appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log('App instalado com sucesso!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostrar o prompt de instalação
    deferredPrompt.prompt()

    // Aguardar a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('Usuário aceitou instalar o app')
    } else {
      console.log('Usuário rejeitou instalar o app')
    }

    // Limpar o prompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('installPromptDismissed', 'true')
  }

  // Não mostrar se já instalado ou se foi dispensado nesta sessão
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('installPromptDismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-dark-surface border-2 border-gold-primary rounded-lg p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gold-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-text-light mb-1">
              Instalar CELA VI
            </h3>
            <p className="text-sm text-text-muted mb-3">
              Instale nosso app para uma experiência mais rápida e acesso offline!
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-gold-primary text-dark-bg px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition text-sm flex-1"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="bg-dark-border text-text-light px-3 py-2 rounded-lg font-semibold hover:bg-dark-border/80 transition text-sm"
              >
                Agora não
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-text-muted hover:text-text-light transition"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

