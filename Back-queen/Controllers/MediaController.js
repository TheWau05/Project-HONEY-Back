const supabase = require('../Config/supabase')
const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
})

// POST /api/media/:post_id
const uploadMedia = async (req, res) => {
  const { post_id } = req.params
  const { pareja_id } = req.user
  const files = req.files

  if (!files?.length) {
    return res.status(400).json({ error: 'No se enviaron archivos' })
  }

  try {
    const { data: post, error: errorPost } = await supabase
      .from('posts')
      .select('id')
      .eq('id', post_id)
      .eq('pareja_id', pareja_id)
      .single()

    if (errorPost || !post) {
      return res.status(404).json({ error: 'Post no encontrado' })
    }

    const registros = []

    for (const file of files) {
      const extension = file.originalname.split('.').pop()
      const nombreArchivo = `posts/${post_id}/${Date.now()}.${extension}`

      const { error: errorUpload } = await supabase
        .storage
        .from('Post_Media')
        .upload(nombreArchivo, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (errorUpload) {
        console.error('Error subiendo archivo:', errorUpload)
        continue
      }

      const { data: urlData } = supabase
        .storage
        .from('Post_Media')
        .getPublicUrl(nombreArchivo)

      registros.push({
        post_id,
        url: urlData.publicUrl,
        nombre_original: file.originalname,
        tipo: file.mimetype.startsWith('image/')
          ? 'image'
          : file.mimetype.startsWith('video/')
          ? 'video'
          : 'doc',
      })
    }

    if (registros.length === 0) {
      return res.status(500).json({ error: 'No se pudo subir ningún archivo' })
    }

    // 👇 esto es lo que faltaba: persistir en la BD
    const { data: mediaGuardada, error: errorInsert } = await supabase
      .from('Post_Media')
      .insert(registros)
      .select()

    if (errorInsert) {
      console.error('Error guardando media en BD:', errorInsert)
      return res.status(500).json({ error: 'Archivos subidos pero no se pudieron registrar' })
    }

    return res.status(201).json({ media: mediaGuardada })

  } catch (err) {
    console.error('Error en uploadMedia:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { upload, uploadMedia }