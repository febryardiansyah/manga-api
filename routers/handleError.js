const router = require('express').Router()

router.get('/', function (req, res){
    res.send('Welcome to Manga-API')
})

module.exports = router