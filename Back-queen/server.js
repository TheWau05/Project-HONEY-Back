require('dotenv').config()

const express = require('express')
const app = express()

const testRoutes = require('./routes/TestRoute')

app.use(express.json())

app.use('/api', testRoutes)


app.listen(3000, () => {
  console.log('Servidor iniciado')
})