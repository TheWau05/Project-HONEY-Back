const { Router } = require('express')
const { getWishlist, createItem, updateItem, deleteItem } = require('../Controllers/WishlistController')
const { verifyToken } = require('../Middleware/Auth')

const router = Router()

router.get('/', verifyToken, getWishlist)
router.post('/', verifyToken, createItem)
router.put('/:id', verifyToken, updateItem)
router.delete('/:id', verifyToken, deleteItem)

module.exports = router