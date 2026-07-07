const supabase = require('../Config/supabase')

// GET /api/moods
const getMoods = async (req, res) => {
  try {
    const { data: moods, error } = await supabase
      .from('moods')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return res.status(500).json({ error: 'Error al obtener moods' })
    }

    return res.status(200).json(moods)

  } catch (err) {
    console.error('Error en getMoods:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { getMoods }