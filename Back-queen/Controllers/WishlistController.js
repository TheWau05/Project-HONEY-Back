const supabase = require('../Config/supabase')

// GET /api/wishlist?person_id=X
const getWishlist = async (req, res) => {
  const { person_id } = req.query
  const { pareja_id } = req.user

  if (!person_id) {
    return res.status(400).json({ error: 'person_id es requerido' })
  }

  try {
    // Verifica que el person_id solicitado pertenezca a la misma pareja
    const { data: person, error: errorPerson } = await supabase
      .from('person')
      .select('id, pareja_id')
      .eq('id', person_id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorPerson || !person) {
      return res.status(403).json({ error: 'No tienes acceso a esta wishlist' })
    }

    const { data: items, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('person_id', person_id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Error al obtener wishlist' })
    }

    return res.status(200).json(items)

  } catch (err) {
    console.error('Error en getWishlist:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/wishlist
const createItem = async (req, res) => {
  const { id: person_id } = req.user
  const { nombre_item, descripcion_item, link_item } = req.body

  if (!nombre_item?.trim()) {
    return res.status(400).json({ error: 'nombre_item es requerido' })
  }

  try {
    const { data: item, error } = await supabase
      .from('wishlist')
      .insert({
        person_id,
        nombre_item,
        descripcion_item: descripcion_item || null,
        link_item: link_item || null,
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

// PUT /api/wishlist/:id
const updateItem = async (req, res) => {
  const { id } = req.params
  const { id: userId } = req.user
  const { nombre_item, descripcion_item, link_item, completado } = req.body

  try {
    // Verifica que el item exista y sea propio
    const { data: itemExistente, error: errorBusqueda } = await supabase
      .from('wishlist')
      .select('id, person_id')
      .eq('id', id)
      .single()

    if (errorBusqueda || !itemExistente) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }

    if (itemExistente.person_id !== userId) {
      return res.status(403).json({ error: 'Solo puedes editar tus propios items' })
    }

    const { data: item, error } = await supabase
      .from('wishlist')
      .update({
        ...(nombre_item !== undefined && { nombre_item }),
        ...(descripcion_item !== undefined && { descripcion_item }),
        ...(link_item !== undefined && { link_item }),
        ...(completado !== undefined && { completado }),
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

// DELETE /api/wishlist/:id
const deleteItem = async (req, res) => {
  const { id } = req.params
  const { id: userId } = req.user

  try {
    const { data: itemExistente, error: errorBusqueda } = await supabase
      .from('wishlist')
      .select('id, person_id')
      .eq('id', id)
      .single()

    if (errorBusqueda || !itemExistente) {
      return res.status(404).json({ error: 'Item no encontrado' })
    }

    if (itemExistente.person_id !== userId) {
      return res.status(403).json({ error: 'Solo puedes eliminar tus propios items' })
    }

    const { error } = await supabase
      .from('wishlist')
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

module.exports = { getWishlist, createItem, updateItem, deleteItem }