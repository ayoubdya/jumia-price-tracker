const express = require('express')
const router = express.Router()
const ctr = require('../controllers/logic')

router.get('/getUser', ctr.getUserById, ctr.getUser)

// router.post('/postUser', ctr.postUser)

router.post('/pushProduct', ctr.getUserById, ctr.pushProduct)

router.patch('/patchProductMinPrice', ctr.getUserById, ctr.patchProduct)

router.delete('/pullProduct', ctr.getUserById, ctr.pullProduct)

router.post('/getProduct', ctr.getUserById, ctr.getProduct)

router.patch('/patchSelectedSample/', ctr.getUserById, ctr.patchSelectedSimple)

module.exports = router

