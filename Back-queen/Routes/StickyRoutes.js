const { Router } = require('express')
const { getStickyNotes, upsertStickyNote } = require('../Controllers/StickyController')
const { verifyToken } = require('../Middleware/auth')

const router = Router()

router.get('/', verifyToken, getStickyNotes)
router.put('/', verifyToken, upsertStickyNote)

module.exports = router