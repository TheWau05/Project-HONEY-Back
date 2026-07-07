require('dotenv').config()
const bcrypt = require('bcryptjs')
const supabase = require('../Config/supabase')

const crearPareja = async () => {
  const pareja = [
    { fecha_relacion:'2023-02-05' },
    // { id: 2, username: 'Babe', password: 'su_password_real', pareja_id: 1 },
  ]

  for (const p of pareja) {
    const { error } = await supabase
      .from('parejas')
      .insert({
        fecha_relacion: p.fecha_relacion,
      })

    if (error) console.error(`❌ Error creando pareja:`, error)
    else console.log(`✅ Pareja creada`)
  }
}

crearPareja()