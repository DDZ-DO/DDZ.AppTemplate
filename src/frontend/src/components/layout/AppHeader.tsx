import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppHeader as SharedAppHeader, useSettings, useAuth } from '@ddz/shared-react'
import { MessageSquare } from 'lucide-react'

function useBackendStatus(intervalMs = 30000) {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/health', { signal: AbortSignal.timeout(5000) })
        const contentType = res.headers.get('content-type') ?? ''
        if (!cancelled) setConnected(res.ok && contentType.includes('application/json'))
      } catch {
        if (!cancelled) setConnected(false)
      }
    }

    check()
    const id = setInterval(check, intervalMs)
    return () => { cancelled = true; clearInterval(id) }
  }, [intervalMs])

  return connected
}

function AppIcon({ className, connected }: { className?: string; connected: boolean | null }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      <MessageSquare className={`text-primary ${className}`} />
      {connected !== null && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-header ${
            connected ? 'bg-emerald-500' : 'bg-red-500'
          }`}
          title={connected ? 'Backend verbunden' : 'Backend nicht erreichbar'}
        />
      )}
    </span>
  )
}

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/system', label: 'System' },
]

export function AppHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { openSettings } = useSettings()
  const connected = useBackendStatus()

  const currentPage = navItems.find(item =>
    item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href)
  )?.label

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <SharedAppHeader
      appIcon={<AppIcon className="w-6 h-6" connected={connected} />}
      appName="__AppName__"
      currentPage={currentPage}
      navItems={navItems}
      user={user ? {
        firstName: user.firstName,
        lastName: user.lastName,
        abbreviation: user.abbreviation,
        color: user.color,
      } : null}
      onLogout={handleLogout}
      onSettingsClick={openSettings}
      showThemeToggle
      maxWidth="max-w-[1600px]"
    />
  )
}
