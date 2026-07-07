const { Router } = require('express')
const { login, logout } = require('../Controllers/AuthController')

const router = Router()

router.post('/login', login)
router.post('/logout', logout)

module.exports = router