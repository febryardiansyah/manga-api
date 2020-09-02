const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://komiku.co.id/manga/";
const AxiosService = require("../helpers/axiosService");

//manga popular ----Ignore this for now --------
router.get("/manga/popular", (req, res, next) => {
  res.send("nothing");
});

//detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res, next) => {
  const slug = req.params.slug;
  const response = await AxiosService("manga/" + slug);
  const $ = cheerio.load(response.data);
  const element = $(".perapih");
  let genre_list = [];
  let chapter = [];
  const obj = {};
  element.find(".inftable > tbody").filter(function () {
    obj.title = $(this)
      .children()
      .eq(0)
      .find("td:nth-child(2)")
      .text()
      .replace("Komik", "")
      .trim();
    obj.type = $(this).children().eq(2).find("td:nth-child(2)").text();
    obj.author = $(this).children().eq(4).find("td:nth-child(2)").text();
    obj.status = $(this).children().eq(5).find("td:nth-child(2)").text();
  });
  obj.manga_endpoint = slug;
  obj.thumb = element.find(".ims > img").attr("src");

  element.find(".genre > li").each(function () {
    let genre_name = $(this).find("a").text();
    genre_list.push({ genre_name });
    obj.genre_list = genre_list;
  });
  element.find("#Sinopsis").filter(function () {
    obj.synopsis = $(this).find("p").text().trim();
  });
  element
    .find("#Chapter")
    .find(".chapter > ._3Rsjq")
    .find("tr > td.judulseries")
    .each(async function (index, el) {
      let inSpan = $(el).find("span").text();
      let chapter_title = $(el)
        .find("a")
        .attr("title")
        .replace(inSpan + " ", "");
      let chapter_endpoint = $(el).find("a").attr("href").replace(baseUrl, "");
      let chapter_pages;
      // const chapterResponse = await AxiosService(`chapter/${chapter_endpoint}`)
      // const chapter$ = cheerio.load(chapterResponse.data)
      // chapter_pages = chapter$("#article").find(".bc").find('img').length
      // const chapterResponse = await AxiosService(`chapter/${chapter_endpoint}`)
      // console.log(_getChapterPages);
      chapter.push({
        chapter_title,
        chapter_pages,
        chapter_endpoint,
      });
      obj.chapter = chapter;
    });

  res.status(200).json(obj);
});

const _getChapterPages = async (chapter_endpoint) => {
  try {
    const chapterResponse = await AxiosService(`chapter/${chapter_endpoint}`);
    return Promise.resolve(chapterResponse.data);
  } catch (error) {
    return Promise.reject(error);
  }
};
//mangalist pagination  -------Done------
router.get("/manga/page/:pagenumber", async (req, res, next) => {
  let pagenumber = req.params.pagenumber;
  let url = `manga/page/${pagenumber}`;
  // try {
  //     const response = await got.get(baseUrl+url)
  //     const $ = cheerio.load(response.body)
  //     const element = $('.perapih')
  //     let manga_list = []
  //     let title,type,updated_on,endpoint,thumb,chapter

  //     element.find('.daftar > .bge').each(function () {
  //         title = $(this).find('.kan > a').find('h3').text().trim()
  //         endpoint = $(this).find('a').attr('href').replace(replaceMangaPage,'')
  //         type = $(this).find('.bgei > a').find('.tpe1_inf > b').text()
  //         updated_on = $(this).find('.kan > span').text().split('• ')[1]
  //         thumb = $(this).find('.bgei > a').find('img').attr('src')
  //         chapter = $(this).find('.mree').text()
  //         manga_list.push({title,thumb,type,updated_on,endpoint,chapter})
  //     })
  //     return res.status(200).json({manga_list})
  // } catch (error) {
  //     res.send({message:error})
  // }
  AxiosService(url)
    .then((response) => {
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        const element = $(".perapih");
        let manga_list = [];
        let title, type, updated_on, endpoint, thumb, chapter;

        element.find(".daftar > .bge").each(function () {
          title = $(this).find(".kan > a").find("h3").text().trim();
          endpoint = $(this)
            .find("a")
            .attr("href")
            .replace(replaceMangaPage, "");
          type = $(this).find(".bgei > a").find(".tpe1_inf > b").text();
          updated_on = $(this).find(".kan > span").text().split("• ")[1];
          thumb = $(this).find(".bgei > a").find("img").attr("src");
          chapter = $(this).find(".mree").text();
          manga_list.push({
            title,
            thumb,
            type,
            updated_on,
            endpoint,
            chapter,
          });
        });
        return res.status(200).json({ manga_list });
      }
      return res.send({ message: response.status });
    })
    .catch((error) => {
      res.send({ message: error.message });
    });
});

//serach manga ------Done-----------
router.get("/cari/:query", function (req, res, next) {
  const query = req.params.query;
  const url = `?post_type=manga&s=${query}`;
  AxiosService(url)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".daftar");
      let manga_list = [];
      let title, thumb, type, endpoint, updated_on;
      element.find(".bge").each(function () {
        endpoint = $(this).find("a").attr("href").replace(replaceMangaPage, "");
        thumb = $(this).find(".bgei > img").attr("data-src");
        type = $(this).find(".bgei > .tpe1_inf").find("b").text();
        title = $(this).find(".kan").find("h3").text().trim();
        updated_on = $(this).find(".kan > span").text().split("• ")[1];
        manga_list.push({ title, thumb, type, endpoint, updated_on });
      });
      res.json(manga_list);
    })
    .catch((error) => {
      res.send({ message: error.message });
    });
});

//genreList  -----Done-----
router.get("/genres", (req, res, next) => {
  AxiosService("daftar-genre/")
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".daftar");
      var list_genre = [];
      var title, endpoint;
      element.find(".genre > li").each(function () {
        title = $(this).find("a").text();
        endpoint = $(this)
          .find("a")
          .attr("href")
          .replace("https://komiku.co.id/genre/", "");
        list_genre.push({ title, endpoint });
      });
      list_genre = list_genre.splice(0,59)
      res.json({ list_genre });
    })
    .catch((error) => {
      res.send({ message: error });
    });
});

//genreDetail ----Done-----
router.get("/genres/:slug/:pagenumber", (req, res, next) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const url = `genre/${slug}/page/${pagenumber}`;
  AxiosService(url)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".daftar");
      var thumb, title, endpoint, type;
      var manga_list = [];
      element.find(".bge").each(function () {
        title = $(this).find(".kan").find("h3").text().trim();
        endpoint = $(this).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(this).find(".bgei > .tpe1_inf").find("b").text();
        thumb = $(this).find(".bgei > img").attr("data-src");
        manga_list.push({ title, type, thumb, endpoint });
      });
      res.json({ manga_list });
    })
    .catch((err) => {
      res.send({ message: error.message });
    });
});

//manga popular pagination ----- Done ------
router.get("/manga/popular/:pagenumber", function (req, res, next) {
  const pagenumber = req.params.pagenumber;
  const url = `other/rekomendasi/page/${pagenumber}/?orderby=meta_value_num&category_name=0`;
  AxiosService(url)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".daftar");
      let thumb, title, endpoint, type, upload_on;
      let manga_list = [];
      element.find(".bge").each(function () {
        title = $(this).find(".kan").find("h3").text().trim();
        endpoint = $(this).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(this).find(".bgei > .tpe1_inf").find("b").text();
        thumb = $(this).find(".bgei > img").attr("data-src");
        upload_on = $(this).find(".kan").find("span").text().split("• ")[1];
        manga_list.push({ title, type, thumb, endpoint, upload_on });
      });
      res.json({ manga_list });
    })
    .catch((error) => {
      res.send({ message: error.message });
    });
});

//recommended ---done---
router.get("/recommended", (req, res) => {
  AxiosService()
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".perapih").find(".grd");
      let manga_list = [];
      let type, title, chapter, update, endpoint, thumb;
      element.each(function () {
        title = $(this).find(".popunder > h4").text().trim();
        thumb = $(this).find(".gmbr1").find("img").attr("data-src");
        endpoint = $(this)
          .find(".popunder")
          .attr("href")
          .replace(replaceMangaPage, "");
        manga_list.push({ title, chapter, type, thumb, endpoint, update });
      });
      return res.json({ manga_list });
    })
    .catch((error) => {
      res.send({ message: error.message });
    });
  // axios.get().then((response)=>{
  //     if(response.status === 200){
  //         const $ = cheerio.load(response.data);
  //         const element = $('.perapih').find('.grd')
  //         let manga_list = []
  //         let type,title,chapter,update,endpoint,thumb
  //         element.each(function(){
  //             title = $(this).find('.popunder > h4').text().trim()
  //             thumb = $(this).find('.gmbr1').find('img').attr('data-src')
  //             endpoint = $(this).find('.popunder').attr('href').replace(replaceMangaPage,'')
  //             manga_list.push({title,chapter,type,thumb,endpoint,update})
  //         })
  //         return res.json({manga_list})
  //     }
  //     return res.send({message:response.status})
  // }).catch(function(err) {
  //     res.send({err})
  // })
});

//manhua  ------Done------
router.get("/manhua/:pagenumber", (req, res) => {
  getManhuaManhwa(req, res, `manhua`);
});
//manhwa
router.get("/manhwa/:pagenumber", (req, res) => {
  getManhuaManhwa(req, res, `manhwa`);
});
function getManhuaManhwa(req, res, type) {
  var pagenumber = req.params.pagenumber;
  var url = `manga/page/${pagenumber}/?category_name=${type}`;

  AxiosService(url)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const element = $(".perapih");
      var manga_list = [];
      var title, type, updated_on, endpoint, thumb, chapter;

      element.find(".daftar > .bge").each(function () {
        title = $(this).find(".kan > a").find("h3").text().trim();
        endpoint = $(this).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(this).find(".bgei > a").find(".tpe1_inf > b").text();
        updated_on = $(this).find(".kan > span").text().split("• ")[1];
        thumb = $(this).find(".bgei > a").find("img").attr("src");
        chapter = $(this).find(".mree").text();
        manga_list.push({ title, thumb, type, updated_on, endpoint, chapter });
      });

      res.status(200).json({ manga_list });
    })
    .catch((err) => {
      res.send({ message: error.message });
    });
}

module.exports = router;
