'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

export default function Impagos() {
  const supabase = createClient()
  const router = useRouter()
  const [impagos, setImpagos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
    })
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('sesiones')
      .select('*')
      .eq('pagado', false)
      .order('fecha', { ascending: true })
    setImpagos(data || [])
    setTotal((data || []).reduce((s, r) => s + Number(r.importe), 0))
    setLoading(false)
  }

  async function marcarPagado(id: string) {
    setUpdating(id)
    await supabase.from('sesiones').update({ pagado: true }).eq('id', id)
    await load()
    setUpdating(null)
  }

  const dias = (fecha: string) => {
    const diff = new Date().getTime() - new Date(fecha).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Resumen */}
        <div className="bg-red-600 text-white rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Total pendiente</p>
            <p className="text-3xl font-bold">{total.toFixed(2)}€</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Sesiones</p>
            <p className="text-3xl font-bold">{impagos.length}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-blue-900 text-lg mb-3">🚨 Sesiones pendientes de cobro</h2>
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Cargando...</p>
          ) : impagos.length === 0 ? (
            <p className="text-sm text-green-600 text-center py-6 font-medium">✅ Todo cobrado</p>
          ) : (
            <div className="space-y-3">
              {impagos.map(s => (
                <div key={s.id} className="border border-red-100 rounded-xl p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{s.paciente_nombre}</p>
                      <p className="text-xs text-gray-500">{s.fecha} · {s.metodo_pago}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{s.importe}€</p>
                      <p className={`text-xs font-medium ${dias(s.fecha) > 30 ? 'text-red-600' : 'text-orange-500'}`}>
                        {dias(s.fecha)} días
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => marcarPagado(s.id)}
                    disabled={updating === s.id}
                    className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                    {updating === s.id ? 'Actualizando...' : '✓ Marcar como pagado'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
