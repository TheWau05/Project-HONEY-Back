const { Router } = require('express')
const { getBucket, createItem, updateItem, deleteItem } = require('../Controllers/BucketController')
const { verifyToken } = require('../Middleware/auth')

const router = Router()

router.get('/', verifyToken, getBucket)
router.post('/', verifyToken, createItem)
router.put('/:id', verifyToken, updateItem)
router.delete('/:id', verifyToken, deleteItem)

module.exports = router