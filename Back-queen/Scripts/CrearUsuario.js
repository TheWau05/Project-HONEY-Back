require('dotenv').config()
const bcrypt = require('bcryptjs')
const supabase = require('../Config/supabase')

const crearUsuarios = async () => {
  const usuarios = [
    { username: 'Megan', pareja_id: 1, password: 'soysuprincesa', fecha_nacimiento: '2005-02-11',mood_id: 1 },
    // { id: 2, username: 'Babe', password: 'su_password_real', pareja_id: 1 },
  ]

  for (const u of usuarios) {
    const hash = await bcrypt.hash(u.password, 10)

    const { error } = await supabase
      .from('person')
      .insert({
        username: u.username,
        password_hash: hash,
        fecha_nacimiento: u.fecha_nacimiento,
        pareja_id: u.pareja_id,
        mood_id: u.mood_id,
      })

    if (error) console.error(`❌ Error creando ${u.username}:`, error)
    else console.log(`✅ ${u.username} creado con hash`)
  }
}

crearUsuarios()