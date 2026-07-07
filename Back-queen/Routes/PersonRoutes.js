const { Router } = require('express')
const { getMe, getPareja, updateMood } = require('../Controllers/PersonController')
const { verifyToken } = require('../Middleware/Auth')

const router = Router()

router.get('/me', verifyToken, getMe)
router.get('/pareja', verifyToken, getPareja)
router.put('/mood', verifyToken, updateMood)

module.exports = router