const router = require('express').Router()
const cheerio = require('cheerio')
const request = require('request')
const baseUrl = require('../constants/urls')

router.get('/comic/recomended',(req,res,next) => {
    request(baseUrl,(err, response,body) => {
        if(err || response.statusCode !== 200){
            next(err.message)
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.senc').children().last().find('.sencs>.widget-post')
            .children().first().find('ul>li')
            var endpoint,thumb,title,genre,release_date
            var manga_list = []
            console.log(element.text());
            

            element.each(function(){
                $(this).find('.imgseries').filter(function(){
                    endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                    title = $(this).find('.series').attr('title')
                    thumb = $(this).find('img').attr('data-lazy-src')
                    
                })
                $(this).find('.leftseries').filter(function () {
                    genre = $(this).find('span').eq(0).text()
                    release_date = parseInt($(this).children().last().text())
                })
                manga_list.push({title,endpoint,thumb,genre,release_date})
                
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

module.exports = router