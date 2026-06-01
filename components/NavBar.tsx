'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const links = [
  { href: '/sesiones', label: '📋 Sesiones' },
  { href: '/impagos', label: '🚨 Impagos' },
  { href: '/pacientes', label: '👤 Pacientes' },
  { href: '/dashboard', label: '📊 Dashboard' },
]

export default function NavBar() {
  const path = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-blue-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-sm">Despacho LM</span>
        <button onClick={logout} className="text-xs text-blue-300 hover:text-white">Salir</button>
      </div>
      <div className="flex overflow-x-auto border-t border-blue-800">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex-1 text-center py-2 text-xs font-medium whitespace-nowrap px-2 transition
              ${path === l.href ? 'bg-blue-800 text-white' : 'text-blue-300 hover:text-white'}`}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
