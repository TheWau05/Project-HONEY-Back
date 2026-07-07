const supabase = require('../Config/supabase')

// GET /api/posts?pareja_id=X
const getPosts = async (req, res) => {
  const { pareja_id } = req.user

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        person:creado_por_id (id, username, mood_id),
        post_media (id, url, tipo, nombre_original, orden)
      `)
      .eq('pareja_id', pareja_id)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: 'Error al obtener posts' })
    }

    return res.status(200).json(posts)

  } catch (err) {
    console.error('Error en getPosts:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/posts/:id
const getPostById = async (req, res) => {
  const { id } = req.params
  const { pareja_id } = req.user

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        person:creado_por_id (id, username, mood_id),
        post_media (id, url, tipo, nombre_original, orden)
      `)
      .eq('id', id)
      .eq('pareja_id', pareja_id) // seguridad: solo posts de su pareja
      .single()

    if (error || !post) {
      return res.status(404).json({ error: 'Post no encontrado' })
    }

    return res.status(200).json(post)

  } catch (err) {
    console.error('Error en getPostById:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/posts
const createPost = async (req, res) => {
  const { id: creado_por_id, pareja_id } = req.user
  const { contenido, mood_id } = req.body

  if (!contenido?.trim()) {
    return res.status(400).json({ error: 'Contenido es requerido' })
  }

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        creado_por_id,
        pareja_id,
        contenido,
        mood_id,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al crear post' })
    }

    return res.status(201).json(post)

  } catch (err) {
    console.error('Error en createPost:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/posts/:id
const updatePost = async (req, res) => {
  const { id } = req.params
  const { id: userId, pareja_id } = req.user
  const { contenido, mood_id } = req.body

  try {
    // Verifica que el post exista y sea de su pareja
    const { data: postExistente, error: errorBusqueda } = await supabase
      .from('posts')
      .select('id, creado_por_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !postExistente) {
      return res.status(404).json({ error: 'Post no encontrado' })
    }

    // Solo el creador puede editar
    if (postExistente.creado_por_id !== userId) {
      return res.status(403).json({ error: 'No puedes editar posts de tu pareja' })
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update({ contenido, mood_id })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar post' })
    }

    return res.status(200).json(post)

  } catch (err) {
    console.error('Error en updatePost:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// DELETE /api/posts/:id
const deletePost = async (req, res) => {
  const { id } = req.params
  const { id: userId, pareja_id } = req.user

  try {
    // Verifica que el post exista y sea de su pareja
    const { data: postExistente, error: errorBusqueda } = await supabase
      .from('posts')
      .select('id, creado_por_id')
      .eq('id', id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorBusqueda || !postExistente) {
      return res.status(404).json({ error: 'Post no encontrado' })
    }

    // Solo el creador puede eliminar
    if (postExistente.creado_por_id !== userId) {
      return res.status(403).json({ error: 'No puedes eliminar posts de tu pareja' })
    }

    // Elimina media del storage primero si existe
    const { data: mediaFiles } = await supabase
      .storage
      .from('media')
      .list(`posts/${id}`)

    if (mediaFiles?.length) {
      const paths = mediaFiles.map(f => `posts/${id}/${f.name}`)
      await supabase.storage.from('media').remove(paths)
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: 'Error al eliminar post' })
    }

    return res.status(200).json({ message: 'Post eliminado' })

  } catch (err) {
    console.error('Error en deletePost:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getPosts, getPostById, createPost, updatePost, deletePost }