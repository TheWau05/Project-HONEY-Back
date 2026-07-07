require('dotenv').config()

const express = require('express')
const app = express()

const authRoutes = require('./Routes/AuthRoutes')
const personRoutes = require('./Routes/PersonRoutes')
const postsRoutes = require('./Routes/PostRoutes')
const wishlistRoutes = require('./Routes/WishlistRoutes')
const bucketRoutes = require('./Routes/BucketRoutes')
const eventosRoutes = require('./Routes/EventosRoutes')
const stickyRoutes = require('./Routes/StickyRoutes')
const moodroutes = require('./Routes/MoodRoutes')

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/person', personRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/bucket', bucketRoutes)
app.use('/api/eventos', eventosRoutes)
app.use('/api/sticky', stickyRoutes)
app.use('/api/moods', moodroutes)



app.listen(3000, () => {
  console.log('🚀 Servidor iniciado en puerto 3000')
})