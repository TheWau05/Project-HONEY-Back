require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()

const authRoutes = require('./Routes/AuthRoutes')
const personRoutes = require('./Routes/PersonRoutes')
const postsRoutes = require('./Routes/PostRoutes')
const wishlistRoutes = require('./Routes/WishlistRoutes')
const bucketRoutes = require('./Routes/BucketRoutes')
const eventosRoutes = require('./Routes/EventosRoutes')
const stickyRoutes = require('./Routes/StickyRoutes')
const moodroutes = require('./Routes/MoodRoutes')

const allowedOrigins = [
  'http://localhost:5173',        // desarrollo local
  'http://192.168.1.33:5173',     // tu IP local
  'https://project-honey-back.vercel.app',    // TODO: agrega tu dominio de Vercel cuando lo tengas
]

app.use(cors({
  origin: (origin, callback) => {
    // Permite requests sin origin (Postman, mobile)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('No permitido por CORS'))
    }
  },
  credentials: true,
}))

app.use(express.json())
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Project Honey API funcionando 🚀'
  })
})
app.use('/api/auth', authRoutes)
app.use('/api/person', personRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/bucket', bucketRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/stickynote', stickyRoutes)
app.use('/api/moods', moodroutes)



if (require.main === module) {
  app.listen(3000, () => {
    console.log('🚀 Servidor iniciado en puerto 3000')
  })
}

module.exports = app