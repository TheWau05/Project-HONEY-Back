const { Router } = require('express')
const { getPosts, getPostById, createPost, updatePost, deletePost } = require('../Controllers/PostController')
const { uploadMedia, upload } = require('../Controllers/MediaController')
const { verifyToken } = require('../Middleware/Auth')

const router = Router()

router.get('/', verifyToken, getPosts)
router.get('/:id', verifyToken, getPostById)
router.post('/', verifyToken, createPost)
router.put('/:id', verifyToken, updatePost)
router.delete('/:id', verifyToken, deletePost)

// Media — acepta múltiples archivos con campo 'files'
router.post('/:post_id/media', verifyToken, upload.array('files', 10), uploadMedia)

module.exports = router