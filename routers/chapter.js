const router = require('express').Router()
const cheerio = require('cheerio')
const request = require('request')
const baseUrl = require('../constants/urls')

router.get('/',(req,res) => {
    res.send('chapter')
})

router.get('/:slug', (req, res,next) => {
    const slug = req.params.slug
    const url = baseUrl+slug
    console.log(url);

    request(url,(err, response,body) => {
        if (err || response.statusCode !==200){
            next(err)
        }
        try {
            const $ = cheerio.load(body)            
            const content = $('.chapter-content')
            var chapter_image = []
            var title,chapter_image_link,image_number

            content.find('.dtlx').filter(function (){
                title = $(this).find('.entry-title').text()
            })
            content.find('.chapter-image').filter(function (){
                $(this).find('div[id="chimg"]').find('img').each(function (i,el) {
                    chapter_image_link = $(el).attr('data-lazy-src') || $(el).attr('src')
                    image_number = i+1
                    console.log(chapter_image_link);
                    chapter_image.push({image_number,chapter_image_link})
                })

            })

            res.json({title,chapter_image})
        } catch (error) {
            console.log(error.message);
        }
    })
    
})
module.exports = router