export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: sesiones }, { data: pacientes }] = await Promise.all([
    supabase.from('sesiones').select('*').order('fecha'),
    supabase.from('pacientes').select('*').order('nombre'),
  ])

  const wb = XLSX.utils.book_new()

  const sesRows = (sesiones || []).map(s => ({
    Fecha: s.fecha,
    Paciente: s.paciente_nombre,
    Pagado: s.pagado ? 'Sí' : 'No',
    'Método de Pago': s.metodo_pago,
    'Importe (€)': s.importe,
    Observaciones: s.observaciones || '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sesRows), 'SESION')

  const pacRows = (pacientes || []).map(p => ({
    Nombre: p.nombre,
    Apellidos: p.apellidos || '',
    DNI: p.dni || '',
    'Fecha Nacimiento': p.fecha_nacimiento || '',
    'Nombre Tutor': p.nombre_tutor || '',
    'Apellidos Tutor': p.apellidos_tutor || '',
    'DNI Tutor': p.dni_tutor || '',
    Relación: p.relacion_tutor || '',
    'Teléfono/Email': p.telefono_email || '',
    Notas: p.notas || '',
  }))
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pacRows), 'PACIENTE')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Registro_Sesiones_v5.xlsx"',
    },
  })
}
