const router = require('express').Router()
const cheerio = require('cheerio')
const request = require('request')
const baseUrl = require('../constants/urls')

//manga popular
router.get('/manga/popular', (req, res,next) => {
    request(baseUrl,(err, response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                status:"404"
            })
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.senc').children().first().find('.sencs>.widget-post')
            .children().first().find('ul>li')
            var link,thumb,title,genre,score
            var manga_list = []
            

            element.each(function(){
                $(this).find('.imgseries').filter(function(){
                    link = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                    thumb = $(this).find('img').attr('data-lazy-src')
                    
                })
                $(this).find('.leftseries').filter(function () {
                    title = $(this).find('a').text()
                    genre = $(this).find('span').eq(0).text()
                    score = $(this).find('.rating >i').text()
                })
                manga_list.push({title,link,thumb,genre,score})
                
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//detail manga
router.get('/manga/:slug',(req,res,next) => {
    const slug = req.params.slug
    const url = `${baseUrl+slug}`

    request(url,(err,response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                status:"404"
            })
        }
        const $ = cheerio.load(body)
        const infoanime = $('.infoanime')
        const desc = $('.desc')
        const eps_list = $('.eps_lst > .listeps')
        let detail = {}
        let genre_list = []
        let chapter = []
        let title,status,released,updated_on,author,type,posted_on,genre_name,
        thumb,score,synopsis,chapter_title,chapter_endpoint,chapter_uploaded,manga_endpoint
        manga_endpoint = slug
        infoanime.filter(function (){
            title = $(this).find('.entry-title').text().replace('Komik ','')
            thumb = $(this).find('img').attr('data-lazy-src') || $(this).find('img').attr('src')
            $(this).find('.infox').filter(function(){
                status = $(this).find('.spe>span').first().text().replace('Status: ','')
                author = $(this).find('.spe>span').eq(1).text().replace('Author: ','')
                released = parseInt($(this).find('.spe>span').eq(2).text().replace('Released: ',''))
                type = $(this).find('.spe>span').eq(3).text().replace('Type: ','')
                posted_on = $(this).find('.spe>span').eq(5).text().replace('Posted on: ','')
                updated_on = $(this).find('.spe>span').eq(6).text().replace('Updated on: ','')
            })
            $(this).find('.static-manga > .static-data').filter(function(){
                score = parseFloat($(this).find('.static-score').find('i').text())
            })
            $(this).find('.genre-info > a').each(function(){
                genre_name = $(this).text()
                genre_list.push({genre_name})
            })
        })
        desc.filter(function (){
            synopsis = $(this).children().eq(1).find('p').text()

        })    
        eps_list.children().eq(1).filter(function(){
            $(this).find('ul > li').each(function(){
                $(this).find('.lchx').filter(function(){
                    chapter_title = $(this).find('a').text()
                    chapter_endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/','')
                })
                $(this).find('.dt').filter(function(){
                    chapter_uploaded = $(this).find('a').text()
                })
                chapter.push({chapter_title,chapter_endpoint,chapter_uploaded})
            })         
        })
        detail = ({title,manga_endpoint,thumb,status,released,type,author,
            updated_on,posted_on,score,genre_list,synopsis,chapter})
        res.status(200).json(detail)
    })
})

//manga list
router.get('/manga',(req,res,next)=>{
    getMangaPage(req,res,next,'daftar-manga/')
})
//mangalist pagination
router.get('/manga/page/:pagenumber',(req,res,next)=>{
    var pagenumber = req.params.pagenumber
    var url = `daftar-manga/page/${pagenumber}`
    console.log(url);
    
    getMangaPage(req,res,next,url)
})
//serach manga
router.get('/cari/:query',function(req,res,next){
    const query = req.params.query
    const url = `?s=${query}`
    console.log(url);
    getMangaPage(req,res,next,url)
})

function getMangaPage(req,res,next,page){
    request(baseUrl+page,(err,response,body)=>{
        console.log(baseUrl+page)
        if(err || response.statusCode !== 200){
            res.json({
                status:"404",
                manga_list
            })
            next(err)
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.popular')
            var manga_list = []
            var title,type,score,endpoint,thumb

            element.find('.animepost').each(function () {
                title = $(this).find('.bigors > a').text()
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('a > .limit').find('span').text()
                score = parseFloat($(this).find('.bigors > .adds').find('i').text())
                thumb = $(this).find('a > .limit').find('img').attr('src') || $(this).find('a > .limit').find('img').attr('data-lazy-src')
                manga_list.push({title,thumb,type,score,endpoint})
            })

            res.status(200).json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
}

//manga terbaru
router.get('/manga/terbaru/:pagenumber',function(req,res,next) {
    const pagenumber = req.params.pagenumber
    const url = `${baseUrl+'komik-terbaru/page/'+pagenumber}`
    request(url,(err, response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                manga_list :[]
            })
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.listupd')
            var manga_list = []
            var type,title,chapter,update,endpoint,thumb
            element.find('.animepost').each(function(){
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('.limit > span').text()
                thumb = $(this).find('.limit > img').attr('data-lazy-src') || $(this).find('.limit > img').attr('src')
                title = $(this).find('.bigor > a').find('.tt > h4').text()
                chapter = $(this).find('.adds > a').text()
                update = $(this).find('.adds > .datech').text()
                manga_list.push({title,chapter,type,thumb,endpoint,update})
            })
            res.status(200).json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//genreList
router.get('/genres',(req,res,next)=>{
    request(baseUrl+'daftar-genre/',(err, response,body) => {
        if(err || response.statusCode !== 200){
            next(err)
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.post-show')
            var list_genre = []
            var title,endpoint
            element.find('.genrelist > li').each(function () {
                title = $(this).find('a').text()
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/genres/','')
                list_genre.push({title,endpoint})
            })
            res.status(200).json({list_genre})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//genreDetail
router.get('/genres/:slug/:pagenumber',(req,res,next)=>{
    const slug = req.params.slug
    const pagenumber = req.params.pagenumber
    const url = `genres/${slug}/page/${pagenumber}`
    console.log(url);
    request(baseUrl+url,(err, response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                manga_list :[]
            })
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.film-list')
            var thumb,title,score,endpoint,type
            var manga_list = []
            element.find('.animepost').each(function () {
                title = $(this).find('.bigors').find('.tt > h4').text()
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('a > .limit').find('span').text()
                thumb = $(this).find('.limit > img').attr('data-lazy-src') || $(this).find('.limit > img').attr('src')
                score = parseFloat($(this).find('.bigors > .adds').find('i').text())
                manga_list.push({title,type,thumb,score,endpoint})
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//manga popular pagination
router.get('/manga/popular/:pagenumber',function(req,res,next) {
    const pagenumber = req.params.pagenumber
    const url = `${baseUrl+'populer/page/'+pagenumber}`
    request(url,(err, response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                manga_list :[]
            })
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.listupd')
            var manga_list = []
            var type,title,chapter,update,endpoint,thumb
            element.find('.animepost').each(function(){
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('.limit > span').text()
                thumb = $(this).find('.limit > img').attr('data-lazy-src') || $(this).find('.limit > img').attr('src')
                title = $(this).find('.bigor > a').find('.tt > h2').text()
                chapter = $(this).find('.adds > a').text().replace(' ','')
                update = $(this).find('.adds > .datech').text()
                manga_list.push({title,chapter,type,thumb,endpoint,update})
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//recomended
router.get('/recomended',(req,res,next)=>{
    request(baseUrl,(err, response,body) => {
        if(err || response.statusCode !== 200){
            next(err)
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.listupd')
            var manga_list = []
            var type,title,chapter,update,endpoint,thumb
            element.find('.animepost').each(function(){
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('.limit > span').text()
                thumb = $(this).find('.limit > img').attr('data-lazy-src') || $(this).find('.limit > img').attr('src')
                title = $(this).find('.bigor > a').find('.tt > h4').text()
                chapter = $(this).find('.adds > a').text().replace(' ','')
                update = $(this).find('.adds > .datech').text()
                manga_list.push({title,chapter,type,thumb,endpoint,update})
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
})

//manhua
router.get('/manhua/:pagenumber',(req,res) =>{
    const url = req.params.pagenumber
    getManhuaManhwa(req,res,`manhua/page/${url}`)
})
//manhwa
router.get('/manhwa/:pagenumber',(req,res) =>{
    const url = req.params.pagenumber
    getManhuaManhwa(req,res,`manhwa/page/${url}`)
})
function getManhuaManhwa(req,res,url) {
    request(baseUrl+url,(err, response,body) => {
        if(err || response.statusCode !== 200){
            res.json({
                manga_list :[]
            })
        }
        try {
            const $ = cheerio.load(body)
            const element = $('.film-list')
            var thumb,title,score,endpoint,type
            var manga_list = []
            element.find('.animepost').each(function () {
                title = $(this).find('.bigor').find('.tt').text()
                endpoint = $(this).find('a').attr('href').replace('https://bacakomik.co/manga/','')
                type = $(this).find('a > .limit').find('span').text()
                thumb = $(this).find('.limit > img').attr('data-lazy-src') || $(this).find('.limit > img').attr('src')
                score = parseFloat($(this).find('.bigor > .adds').find('i').text())
                manga_list.push({title,type,thumb,score,endpoint})
            })
            res.json({manga_list})
        } catch (error) {
            console.log(error.message);
        }
    })
}

module.exports = router