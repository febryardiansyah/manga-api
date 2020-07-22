const router = require('express').Router()
const cheerio = require('cheerio')
const baseUrl = require('../constants/urls')
const { default: Axios } = require('axios')

router.get('/',(req,res) => {
    res.send('chapter')
})
//chapter ----done ----
router.get('/:slug', (req, res,next) => {
    const slug = req.params.slug
    const url = baseUrl+slug
    console.log(url);
    Axios.get(url).then(response => {
            const $ = cheerio.load(response.data)            
            const content = $('#article')
            let chapter_image = []
            let title,chapter_image_link,image_number,chapter_endpoint,download_link
            chapter_endpoint = slug+'/'
            content.find('.dsk2').filter(function (){
                title = $(this).find('h1').text().replace('Komik ','')
            })
            content.find('.bc').filter(function (){
                $(this).find('img').each(function (i,el){
                chapter_image_link = $(el).attr('src')
                image_number = i+1
                chapter_image.push({image_number,chapter_image_link})
                })

            })
            res.json({title,chapter_endpoint,download_link,chapter_image})
    })
    
})
module.exports = router