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
            var title,chapter_image_link,image_number,chapter_endpoint,download_link
            chapter_endpoint = slug+'/'
            content.find('.dtlx').filter(function (){
                title = $(this).find('.entry-title').text().replace('Komik ','')
            })
            content.find('.navig').find('.nextprev').filter(function() {
                download_link = 'https://dl.komikcdn.xyz/?'+$(this).find('a').eq(1).attr('href').replace('/dl/?','')
                console.log('download link :'+download_link);
            })
            content.find('.chapter-image').filter(function (){
                $(this).find('div[id="chimg"]').find('img').each(function (i,el) {
                    chapter_image_link = $(el).attr('data-lazy-src') || $(el).attr('src')
                    image_number = i+1
                    chapter_image.push({image_number,chapter_image_link})
                })

            })
            res.json({title,chapter_endpoint,download_link,chapter_image})
        } catch (error) {
            console.log(error.message);
        }
    })
    
})
module.exports = router