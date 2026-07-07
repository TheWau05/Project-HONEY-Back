const supabase = require('../Config/supabase')

// GET /api/bucket
const getBucket = async (req, res) => {
  const { pareja_id } = req.user

  try {
    const { data: items, error } = await supabase
      .from('bucket_list')
      .select(`
        *,
        person:creado_por_id (id, username)
      `)
      .eq('pareja_id', pareja_id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Error al obtener bucket list' })
    }

    return res.status(200).json(items)

  } catch (err) {
    console.error('Error en getBucket:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/bucket
const createItem = async (req, res) => {
  const { id: creado_por_id, pareja_id } = req.user
  const { nombre_bucket, descripcion_bucket, fecha_bucket } = req.body

  if (!nombre_bucket?.trim()) {
    return res.status(400).json({ error: 'nombre_bucket es requerido' })
  }

  try {
    const { data: item, error } = await supabase
      .from('bucket_list')
      .insert({
        creado_por_id,
        pareja_id,
        nombre_bucket,
        descripcion_bucket: descripcion_bucket || null,
        fecha_bucket: fecha_bucket || null,
        completo: false,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al crear item' })
    }

    return res.status(201).json(item)

  } catch (err) {
    console.error('Error en createItem:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/bucket/:id
const updateItem = async (req, res) => {
  const { id } = req.params
  const { pareja_id } = req.user
  const { nombre_bucket, descripcion_bucket, fecha_bucket, completo } = req.body

  try {
    // Verifica que el item pertenezca a su pareja
    const { data: itemExistente, error: errorBusqueda } = await supabase
      .from('bucket_list')
      .select('id, pareja_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !itemExistente) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }

    const { data: item, error } = await supabase
      .from('bucket_list')
      .update({
        ...(nombre_bucket !== undefined && { nombre_bucket }),
        ...(descripcion_bucket !== undefined && { descripcion_bucket }),
        ...(fecha_bucket !== undefined && { fecha_bucket }),
        ...(completo !== undefined && { completo }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar item' })
    }

    return res.status(200).json(item)

  } catch (err) {
    console.error('Error en updateItem:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/bucket/:id
const deleteItem = async (req, res) => {
  const { id } = req.params
  const { pareja_id } = req.user

  try {
    const { data: itemExistente, error: errorBusqueda } = await supabase
      .from('bucket_list')
      .select('id, pareja_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !itemExistente) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }

    const { error } = await supabase
      .from('bucket_list')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar item' })
    }

    return res.status(200).json({ message: 'Item eliminado' })

  } catch (err) {
    console.error('Error en deleteItem:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getBucket, createItem, updateItem, deleteItem }