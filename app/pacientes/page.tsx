'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'

export default function Pacientes() {
  const supabase = createClient()
  const router = useRouter()
  const [pacientes, setPacientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const empty = { nombre:'', apellidos:'', dni:'', fecha_nacimiento:'',
    nombre_tutor:'', apellidos_tutor:'', dni_tutor:'', relacion_tutor:'', telefono_email:'', notas:'' }
  const [form, setForm] = useState(empty)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (!data.user) router.push('/login') })
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('pacientes').select('*').order('nombre')
    setPacientes(data || [])
    setLoading(false)
  }

  const esmenor = form.fecha_nacimiento
    ? (new Date().getFullYear() - new Date(form.fecha_nacimiento).getFullYear()) < 18
    : false

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('pacientes').insert({
      ...form, fecha_nacimiento: form.fecha_nacimiento || null, apellidos: form.apellidos || null,
    })
    if (!error) { setMsg('✅ Paciente guardado'); setForm(empty); setShowForm(false); load() }
    else setMsg('❌ Error al guardar')
    setSaving(false)
    setTimeout(() => setMsg(''), 3000)
  }

  const filtered = pacientes.filter(p =>
    `${p.nombre} ${p.apellidos}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {msg && <p className="text-sm text-center font-medium py-2">{msg}</p>}
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar paciente..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-900 text-white rounded-lg px-4 py-2 text-sm font-medium">
            {showForm ? 'Cancelar' : '+ Nuevo'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow p-5">
            <h2 className="font-bold text-blue-900 text-lg mb-4">Nuevo paciente</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Nombre *</label>
                  <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Apellidos</label>
                  <input value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">DNI / NIE</label>
                  <input value={form.dni} onChange={e => setForm({...form, dni: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Fecha nacimiento</label>
                  <input type="date" value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Teléfono / Email</label>
                <input value={form.telefono_email} onChange={e => setForm({...form, telefono_email: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              {esmenor && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-yellow-800">⚠️ Menor de edad — datos del tutor/a</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Nombre tutor/a</label>
                      <input value={form.nombre_tutor} onChange={e => setForm({...form, nombre_tutor: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Apellidos tutor/a</label>
                      <input value={form.apellidos_tutor} onChange={e => setForm({...form, apellidos_tutor: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">DNI tutor/a</label>
                      <input value={form.dni_tutor} onChange={e => setForm({...form, dni_tutor: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Relación</label>
                      <select value={form.relacion_tutor} onChange={e => setForm({...form, relacion_tutor: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option value="">Seleccionar...</option>
                        <option>Madre</option><option>Padre</option><option>Tutor/a legal</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600">Notas</label>
                <textarea value={form.notas} onChange={e => setForm({...form, notas: e.target.value})}
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-blue-900 text-white rounded-lg py-3 font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition">
                {saving ? 'Guardando...' : 'Guardar paciente'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="font-bold text-blue-900 text-lg mb-3">
            Pacientes <span className="text-gray-400 font-normal text-base">({filtered.length})</span>
          </h2>
          {loading ? <p className="text-sm text-gray-400 text-center py-4">Cargando...</p> : (
            <div className="space-y-2">
              {filtered.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{p.nombre} {p.apellidos}</p>
                    {p.dni && <p className="text-xs text-gray-500">{p.dni}</p>}
                    {p.fecha_nacimiento && (
                      <p className="text-xs text-gray-500">
                        {new Date(p.fecha_nacimiento).toLocaleDateString('es-ES')}
                        {(new Date().getFullYear() - new Date(p.fecha_nacimiento).getFullYear()) < 18 &&
                          <span className="ml-1 text-yellow-600 font-medium">· Menor</span>}
                      </p>
                    )}
                  </div>
                  {p.telefono_email && <p className="text-xs text-gray-400">{p.telefono_email}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
