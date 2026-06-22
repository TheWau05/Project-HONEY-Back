const router = require('express').Router()
const { test } = require('../controllers/TestController')

router.get('/test', test)

module.exports = router