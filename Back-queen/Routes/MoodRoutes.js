const { Router } = require('express')
const { getMoods } = require('../Controllers/MoodController')
const { verifyToken } = require('../Middleware/Auth')

const router = Router()

router.get('/', verifyToken, getMoods)

module.exports = router