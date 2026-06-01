'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, cobrado: 0, pendiente: 0, beneficio: 0, irpf: 0, vies: 0, sesiones: 0, impagos: 0 })
  const [mensual, setMensual] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/login') })
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('sesiones').select('*')
    const rows = data || []
    const anyo = new Date().getFullYear()
    const total = rows.reduce((s,r) => s + Number(r.importe), 0)
    const cobrado = rows.filter(r => r.pagado).reduce((s,r) => s + Number(r.importe), 0)
    const pendiente = rows.filter(r => !r.pagado).reduce((s,r) => s + Number(r.importe), 0)
    const irpf = rows.filter(r => r.metodo_pago !== 'Efectivo').reduce((s,r) => s + Number(r.importe)*0.15, 0)
    const vies = rows.reduce((s,r) => s + Number(r.importe)*0.25, 0)
    const beneficio = total - irpf - vies
    const impagos = rows.filter(r => !r.pagado).length

    const byMonth: Record<number,{total:number,cobrado:number}> = {}
    rows.filter(r => new Date(r.fecha).getFullYear() === anyo).forEach(r => {
      const m = new Date(r.fecha).getMonth()
      if (!byMonth[m]) byMonth[m] = { total: 0, cobrado: 0 }
      byMonth[m].total += Number(r.importe)
      if (r.pagado) byMonth[m].cobrado += Number(r.importe)
    })
    const men = Array.from({length:12}, (_,i) => ({ mes: meses[i], ...( byMonth[i] || {total:0,cobrado:0}) }))

    setStats({ total, cobrado, pendiente, beneficio, irpf, vies, sesiones: rows.length, impagos })
    setMensual(men)
    setLoading(false)
  }

  async function exportExcel() {
    const res = await fetch('/api/export')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'Registro_Sesiones_v5.xlsx'; a.click()
  }

  const kpis = [
    { label: 'Facturación Total', value: stats.total, color: 'bg-blue-900' },
    { label: 'Cobrado', value: stats.cobrado, color: 'bg-green-700' },
    { label: 'Pendiente', value: stats.pendiente, color: 'bg-red-600' },
    { label: 'Beneficio Psicólogo', value: stats.beneficio, color: 'bg-green-800' },
    { label: 'Vies 25%', value: stats.vies, color: 'bg-yellow-700' },
    { label: 'IRPF Retenido', value: stats.irpf, color: 'bg-yellow-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {loading ? <p className="text-center text-gray-400 py-8">Cargando...</p> : (<>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(k => (
            <div key={k.label} className={`${k.color} text-white rounded-xl p-4`}>
              <p className="text-xs opacity-75">{k.label}</p>
              <p className="text-xl font-bold mt-1">{k.value.toFixed(2)}€</p>
            </div>
          ))}
          <div className="bg-blue-700 text-white rounded-xl p-4">
            <p className="text-xs opacity-75">Nº Sesiones</p>
            <p className="text-xl font-bold mt-1">{stats.sesiones}</p>
          </div>
          <div className="bg-red-700 text-white rounded-xl p-4">
            <p className="text-xs opacity-75">Impagos</p>
            <p className="text-xl font-bold mt-1">{stats.impagos}</p>
          </div>
        </div>

        {/* Tabla mensual */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-blue-900 text-lg mb-3">Facturación mensual {new Date().getFullYear()}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="text-left pb-2">Mes</th>
                  <th className="text-right pb-2">Total</th>
                  <th className="text-right pb-2">Cobrado</th>
                </tr>
              </thead>
              <tbody>
                {mensual.filter(m => m.total > 0).map(m => (
                  <tr key={m.mes} className="border-b border-gray-50">
                    <td className="py-2 font-medium text-gray-700">{m.mes}</td>
                    <td className="py-2 text-right text-gray-700">{m.total.toFixed(0)}€</td>
                    <td className="py-2 text-right text-green-600 font-medium">{m.cobrado.toFixed(0)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exportar Excel */}
        <button onClick={exportExcel}
          className="w-full bg-green-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-800 transition">
          📥 Descargar Excel (v5.xlsx)
        </button>

        </>)}
      </div>
    </div>
  )
}
