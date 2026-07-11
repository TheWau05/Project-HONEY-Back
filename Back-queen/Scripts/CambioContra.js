require('dotenv').config()
const bcrypt = require('bcryptjs')
const supabase = require('../Config/supabase')

const cambiarPassword = async () => {
  const username = 'Megan'           // 👈 cambia esto
  const nuevaPassword = 'nuevaClave123' // 👈 cambia esto

  const hash = await bcrypt.hash(nuevaPassword, 10)

  const { data, error } = await supabase
    .from('person')
    .update({ password_hash: hash })
    .eq('username', username)
    .select()

  if (error) {
    console.error(`❌ Error actualizando contraseña de ${username}:`, error)
    return
  }

  if (!data || data.length === 0) {
    console.warn(`⚠️ No se encontró ningún usuario con username "${username}"`)
    return
  }

  console.log(`✅ Contraseña de ${username} actualizada correctamente`)
}

cambiarPassword()