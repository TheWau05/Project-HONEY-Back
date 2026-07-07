const supabase = require('../Config/supabase')

// GET /api/person/me
const getMe = async (req, res) => {
  const { id } = req.user

  try {
    const { data: person, error } = await supabase
      .from('person')
      .select('id, username, pareja_id, fecha_nacimiento, mood_id, created_at')
      .eq('id', id)
      .single()

    if (error) {
      // Caso específico: el token es válido pero el usuario ya no existe en la BD
      if (error.code === 'PGRST116') {
        console.warn(`Sesión con id ${id} ya no existe en la BD`)
        return res.status(401).json({ 
          error: 'Sesión inválida', 
          code: 'USER_NOT_FOUND',
          message: 'Tu cuenta ya no existe, por favor inicia sesión de nuevo' 
        })
      }

      // Cualquier otro error de Supabase (conexión, permisos, etc.)
      console.error('Error en getMe (Supabase):', error)
      return res.status(500).json({ error: 'Error interno del servidor' })
    }

    if (!person) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    return res.status(200).json(person)

  } catch (err) {
    console.error('Error en getMe:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// GET /api/person/pareja
const getPareja = async (req, res) => {
  const { id, pareja_id } = req.user

  try {
    const { data: pareja, error } = await supabase
      .from('person')
      .select('id, username, mood_id, fecha_nacimiento')
      .eq('pareja_id', pareja_id)
      .neq('id', id)
      .single()

    if (error || !pareja) {
      return res.status(404).json({ error: 'Pareja no encontrada' })
    }

    return res.status(200).json(pareja)

  } catch (err) {
    console.error('Error en getPareja:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// PUT /api/person/mood
const updateMood = async (req, res) => {
  const { id } = req.user
  const { mood_id } = req.body

  if (!mood_id) {
    return res.status(400).json({ error: 'mood_id es requerido' })
  }

  try {
    const { data, error } = await supabase
      .from('person')
      .update({ mood_id })
      .eq('id', id)
      .select('id, username, mood_id')
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al actualizar mood' })
    }

    return res.status(200).json(data)

  } catch (err) {
    console.error('Error en updateMood:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getMe, getPareja, updateMood }