const supabase = require('../Config/supabase')

// GET /api/eventos
// Trae eventos normales + bucket list con fecha para el calendario
const getEventos = async (req, res) => {
  const { pareja_id } = req.user

  try {
    // Eventos normales
    const { data: eventos, error: errorEventos } = await supabase
      .from('eventos')
      .select(`
        *,
        person:creado_por_id (id, username)
      `)
      .eq('pareja_id', pareja_id)
      .order('fecha_inicio', { ascending: true })

    if (errorEventos) {
      return res.status(500).json({ error: 'Error al obtener eventos' })
    }

    // Bucket list con fecha — para mostrar en calendario
    const { data: bucket, error: errorBucket } = await supabase
      .from('bucket_list')
      .select(`
        id, nombre_bucket, descripcion_bucket, fecha_bucket,
        completo, creado_por_id,
        person:creado_por_id (id, username)
      `)
      .eq('pareja_id', pareja_id)
      .not('fecha_bucket', 'is', null) // solo los que tienen fecha
      .eq('completo', false)           // solo pendientes

    if (errorBucket) {
      return res.status(500).json({ error: 'Error al obtener bucket con fecha' })
    }

    // Normaliza bucket list al mismo formato que eventos
    const bucketNormalizado = bucket.map(b => ({
      id: b.id,
      nombre_evento: b.nombre_bucket,
      descripcion_evento: b.descripcion_bucket,
      fecha_inicio: b.fecha_bucket,
      fecha_fin: null,
      completado: b.completo,
      creado_por_id: b.creado_por_id,
      pareja_id,
      person: b.person,
      tipo: 'bucket', // ← distingue en el front
      created_at: null,
    }))

    // Eventos normales con tipo
    const eventosNormalizados = eventos.map(e => ({
      ...e,
      tipo: 'evento',
    }))

    return res.status(200).json([...eventosNormalizados, ...bucketNormalizado])

  } catch (err) {
    console.error('Error en getEventos:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/eventos
const createEvento = async (req, res) => {
  const { id: creado_por_id, pareja_id } = req.user
  const { nombre_evento, fecha_inicio, fecha_fin, descripcion_evento } = req.body

  if (!nombre_evento?.trim()) {
    return res.status(400).json({ error: 'nombre_evento es requerido' })
  }

  if (!fecha_inicio) {
    return res.status(400).json({ error: 'fecha_inicio es requerida' })
  }

  try {
    const { data: evento, error } = await supabase
      .from('eventos')
      .insert({
        creado_por_id,
        pareja_id,
        nombre_evento,
        fecha_inicio,
        fecha_fin: fecha_fin || null,
        descripcion_evento: descripcion_evento || null,
        completado: false,
      })
      .select(`
        *,
        person:creado_por_id (id, username)
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al crear evento' })
    }

    return res.status(201).json({ ...evento, tipo: 'evento' })

  } catch (err) {
    console.error('Error en createEvento:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/eventos/:id
const updateEvento = async (req, res) => {
  const { id } = req.params
  const { pareja_id } = req.user
  const { nombre_evento, fecha_inicio, fecha_fin, descripcion_evento, completado } = req.body

  try {
    // Verifica que el evento pertenezca a su pareja
    const { data: eventoExistente, error: errorBusqueda } = await supabase
      .from('eventos')
      .select('id, pareja_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !eventoExistente) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    const { data: evento, error } = await supabase
      .from('eventos')
      .update({
        ...(nombre_evento !== undefined && { nombre_evento }),
        ...(fecha_inicio !== undefined && { fecha_inicio }),
        ...(fecha_fin !== undefined && { fecha_fin }),
        ...(descripcion_evento !== undefined && { descripcion_evento }),
        ...(completado !== undefined && { completado }),
      })
      .eq('id', id)
      .select(`
        *,
        person:creado_por_id (id, username)
      `)
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar evento' })
    }

    return res.status(200).json({ ...evento, tipo: 'evento' })

  } catch (err) {
    console.error('Error en updateEvento:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/eventos/:id
const deleteEvento = async (req, res) => {
  const { id } = req.params
  const { pareja_id } = req.user

  try {
    const { data: eventoExistente, error: errorBusqueda } = await supabase
      .from('eventos')
      .select('id, pareja_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !eventoExistente) {
      return res.status(404).json({ error: 'Evento no encontrado' })
    }

    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar evento' })
    }

    return res.status(200).json({ message: 'Evento eliminado' })

  } catch (err) {
    console.error('Error en deleteEvento:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getEventos, createEvento, updateEvento, deleteEvento }