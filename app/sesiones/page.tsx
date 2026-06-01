'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

const METODOS = ['Efectivo', 'Bizum', 'Transferencia', 'Tarjeta']

function today() {
  return new Date().toISOString().split('T')[0]
}

export default function Sesiones() {
  const supabase = createClient()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const [fecha, setFecha] = useState(today())
  const [pacienteNombre, setPacienteNombre] = useState('')
  const [importe, setImporte] = useState('60')
  const [pagado, setPagado] = useState(true)
  const [metodo, setMetodo] = useState('Bizum')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
    })
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from('pacientes').select('id,nombre,apellidos').order('nombre'),
      supabase.from('sesiones').select('*').order('fecha', { ascending: false }).limit(30)
    ])
    setPacientes(p || [])
    setSesiones(s || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pacienteNombre) return
    setSaving(true)
    const pac = pacientes.find(p => `${p.nombre} ${p.apellidos}`.trim() === pacienteNombre)
    const { error } = await supabase.from('sesiones').insert({
      fecha, paciente_nombre: pacienteNombre,
      paciente_id: pac?.id || null,
      importe: parseFloat(importe), pagado, metodo_pago: metodo,
      observaciones: observaciones || null
    })
    if (!error) {
      setMsg('✅ Sesión guardada')
      setPacienteNombre(''); setImporte('60'); setPagado(true)
      setMetodo('Bizum'); setObservaciones(''); setFecha(today())
      loadData()
    } else setMsg('❌ Error al guardar')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto p-4 space-y-6">

        {/* Formulario nueva sesión */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-blue-900 text-lg mb-4">Nueva sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label className="text-xs font-medium text-gray-600">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Paciente *</label>
              <input list="lista-pacientes" value={pacienteNombre}
                onChange={e => setPacienteNombre(e.target.value)}
                placeholder="Escribe o selecciona..."
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
              <datalist id="lista-pacientes">
                {pacientes.map(p => (
                  <option key={p.id} value={`${p.nombre} ${p.apellidos}`.trim()} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Importe (€)</label>
                <input type="number" value={importe} onChange={e => setImporte(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Método de pago</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {METODOS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">¿Ha pagado?</label>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPagado(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${pagado ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  ✓ Sí
                </button>
                <button type="button" onClick={() => setPagado(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${!pagado ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  ✗ No
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600">Observaciones</label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                rows={2} placeholder="Opcional..."
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
            </div>

            {msg && <p className="text-sm text-center font-medium">{msg}</p>}

            <button type="submit" disabled={saving}
              className="w-full bg-blue-900 text-white rounded-lg py-3 font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition">
              {saving ? 'Guardando...' : 'Guardar sesión'}
            </button>
          </form>
        </div>

        {/* Últimas sesiones */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-blue-900 text-lg mb-3">Últimas sesiones</h2>
          {loading ? <p className="text-sm text-gray-400 text-center py-4">Cargando...</p> : (
            <div className="space-y-2">
              {sesiones.map(s => (
                <div key={s.id}
                  className={`flex items-center justify-between p-3 rounded-lg text-sm ${s.pagado ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div>
                    <p className="font-medium text-gray-800">{s.paciente_nombre}</p>
                    <p className="text-gray-500 text-xs">{s.fecha} · {s.metodo_pago}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{s.importe}€</p>
                    <span className={`text-xs font-medium ${s.pagado ? 'text-green-600' : 'text-red-500'}`}>
                      {s.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
