const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../Config/supabase')

// POST /api/auth/login
const login = async (req, res) => {
  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Password es requerido' })
  }

  try {
    // Busca al usuario que tenga ese password
    const { data: persons, error } = await supabase
      .from('person')
      .select('*')

    if (error || !persons?.length) {
      return res.status(500).json({ error: 'Error al buscar usuarios' })
    }

    // Compara el password contra todos los usuarios hasta encontrar match
    let personEncontrada = null
    for (const person of persons) {
      const match = await bcrypt.compare(password, person.password_hash)
      if (match) { personEncontrada = person; break }
    }

    if (!personEncontrada) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    const token = jwt.sign(
      {
        id: personEncontrada.id,
        username: personEncontrada.username,
        pareja_id: personEncontrada.pareja_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    const { password_hash, ...personaSegura } = personEncontrada

    return res.status(200).json({ token, person: personaSegura })

  } catch (err) {
    console.error('Error en login:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // Si guardas el token en una cookie httpOnly:
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })

    return res.status(200).json({ message: 'Sesión cerrada correctamente' })

  } catch (err) {
    console.error('Error en logout:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { login, logout }