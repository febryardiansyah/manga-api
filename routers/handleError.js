const router = require('express').Router()

router.get('/', function (req, res){
    res.send('Welcome to Manga-API')
})

const on404 =(req,res) => {
    res.status(404).json({
        manga_list:[]
    })
}

module.exports = {router,on404}