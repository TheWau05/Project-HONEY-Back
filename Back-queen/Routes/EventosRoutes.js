const { Router } = require('express')
const { getEventos, createEvento, updateEvento, deleteEvento } = require('../Controllers/EventosController')
const { verifyToken } = require('../Middleware/Auth')

const router = Router()

router.get('/', verifyToken, getEventos)
router.post('/', verifyToken, createEvento)
router.put('/:id', verifyToken, updateEvento)
router.delete('/:id', verifyToken, deleteEvento)

module.exports = router