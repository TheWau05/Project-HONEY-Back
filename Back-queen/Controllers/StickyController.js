const supabase = require('../Config/supabase')

// GET /api/stickynote
const getStickyNotes = async (req, res) => {
  const { pareja_id } = req.user

  try {
    const { data: notas, error } = await supabase
      .from('sticky_note')
      .select(`
        *,
        person:autor_id (id, username)
      `)
      .eq('pareja_id', pareja_id)
      .order('updated_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Error al obtener sticky notes' })
    }

    return res.status(200).json(notas || [])

  } catch (err) {
    console.error('Error en getStickyNotes:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/stickynote
const upsertStickyNote = async (req, res) => {
  const { id: autor_id, pareja_id } = req.user
  const { contenido } = req.body

  if (contenido === undefined) {
    return res.status(400).json({ error: 'contenido es requerido' })
  }

  try {
    const { data: notaExistente } = await supabase
      .from('sticky_note')
      .select('id')
      .eq('autor_id', autor_id)
      .eq('pareja_id', pareja_id)
      .single()

    let data, error

    if (notaExistente) {
      // Solo actualiza contenido y updated_at — created_at no se toca
      ;({ data, error } = await supabase
        .from('sticky_note')
        .update({
          contenido,
          updated_at: new Date().toISOString()
        })
        .eq('id', notaExistente.id)
        .select(`*, person:autor_id (id, username)`)
        .single())
    } else {
      // Insert sin created_at — Supabase lo pone solo con el DEFAULT
      ;({ data, error } = await supabase
        .from('sticky_note')
        .insert({
          autor_id,
          pareja_id,
          contenido,
          // created_at lo maneja el DEFAULT de la tabla
          updated_at: new Date().toISOString()
        })
        .select(`*, person:autor_id (id, username)`)
        .single())
    }

    if (error) {
      return res.status(500).json({ error: 'Error al guardar sticky note' })
    }

    return res.status(200).json(data)

  } catch (err) {
    console.error('Error en upsertStickyNote:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getStickyNotes, upsertStickyNote }