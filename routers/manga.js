const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://komiku.co.id/manga/";
const AxiosService = require("../helpers/axiosService");

// manga popular ----Ignore this for now --------
router.get("/manga/popular", async (req, res) => {
  res.send({
    message: "nothing"
  });
});

// detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res) => {
  const slug = req.params.slug;
  const response = await AxiosService("manga/" + slug);
  const $ = cheerio.load(response.data);
  const element = $(".perapih");
  let genre_list = [];
  let chapter = [];
  const obj = {};

  /* Get Title, Type, Author, Status */
  const getMeta = element.find(".inftable > tbody").first()
  obj.title = $(getMeta)
    .children()
    .eq(0)
    .find("td:nth-child(2)")
    .text()
    .replace("Komik", "")
    .trim();
  obj.type = $(getMeta).children().eq(2).find("td:nth-child(2)").text();
  obj.author = $(getMeta).children().eq(4).find("td:nth-child(2)").text();
  obj.status = $(getMeta).children().eq(5).find("td:nth-child(2)").text();

  /* Set Manga Endpoint */
  obj.manga_endpoint = slug;

  /* Get Manga Thumbnail */
  obj.thumb = element.find(".ims > img").attr("src");

  element.find(".genre > li").each((idx, el) => {
    let genre_name = $(el).find("a").text();
    genre_list.push({
      genre_name
    });
    obj.genre_list = genre_list;
  });

  /* Get Synopsis */
  const getSinopsis = element.find("#Sinopsis").first()
  obj.synopsis = $(getSinopsis).find("p").text().trim();

  /* Get Chapter List */
  element
    .find("#Chapter")
    .find(".chapter > ._3Rsjq")
    .find("tr > td.judulseries")
    .each((index, el) => {
      let inSpan = $(el).find("span").text();
      let chapter_title = $(el)
        .find("a")
        .attr("title")
        .replace(inSpan + " ", "");
      let chapter_endpoint = $(el).find("a").attr("href").replace(baseUrl, "");

      /* This action will takes a lot more time, not recomended for many chapter */
      // let chapter_pages;
      // const chapterResponse = await AxiosService(`chapter/${chapter_endpoint}`)
      // const chapter$ = cheerio.load(chapterResponse.data)
      // chapter_pages = chapter$("#article").find(".bc").find('img').length
      // const chapterResponse = await AxiosService(`chapter/${chapter_endpoint}`)
      // console.log(_getChapterPages);

      chapter.push({
        chapter_title,
        // chapter_pages,
        chapter_endpoint,
      });
      obj.chapter = chapter;
    });

  res.status(200).json(obj);
});

//mangalist pagination  -------Done------
router.get("/manga/page/:pagenumber", async (req, res) => {
  let pagenumber = req.params.pagenumber;
  let url = `manga/page/${pagenumber}/?a`;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".perapih");
      let manga_list = [];
      let title, type, updated_on, endpoint, thumb, chapter;

      element.find(".daftar > .bge").each((idx, el) => {
        title = $(el).find(".kan > a").find("h3").text().trim();
        endpoint = $(el)
          .find("a")
          .attr("href")
          .replace(replaceMangaPage, "");
        type = $(el).find(".bgei > a").find(".tpe1_inf > b").text();
        updated_on = $(el).find(".kan > span").text().split("• ")[1];
        thumb = $(el).find(".bgei > a").find("img").attr("src");
        chapter = $(el).find(".mree").text();
        manga_list.push({
          title,
          thumb,
          type,
          updated_on,
          endpoint,
          chapter,
        });
      });
      return res.status(200).json({
        status: true,
        message: 'success',
        manga_list
      });
    }
    return res.send({
      message: response.status,
      manga_list: []
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: []
    });
  }

});

//serach manga ------Done-----------
router.get("/cari/:query", async (req, res) => {
  const query = req.params.query;
  const url = `?post_type=manga&s=${query}`;

  try {
    const response = await AxiosService(url)
    const $ = cheerio.load(response.data);
    const element = $(".daftar");
    let manga_list = [];
    let title, thumb, type, endpoint, updated_on;
    element.find(".bge").each((idx, el) => {
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      thumb = $(el).find(".bgei > img").attr("data-src");
      type = $(el).find(".bgei > .tpe1_inf").find("b").text();
      title = $(el).find(".kan").find("h3").text().trim();
      updated_on = $(el).find(".kan > span").text().split("• ")[1];
      manga_list.push({
        title,
        thumb,
        type,
        endpoint,
        updated_on
      });
    });
    res.json(manga_list);
  } catch (error) {
    res.send({
      message: error.message
    });
  }
});

//genreList  -----Done-----
router.get("/genres", async (req, res) => {
  const url = "daftar-genre/"

  try {
    const response = await AxiosService(url)

    const $ = cheerio.load(response.data);
    const element = $(".daftar");
    var list_genre = [];
    var title, endpoint;
    element.find(".genre > li").each((idx, el) => {
      title = $(el).find("a").text();
      endpoint = $(el)
        .find("a")
        .attr("href")
        .replace("https://komiku.co.id/genre/", "");
      list_genre.push({
        title,
        endpoint
      });
    });
    list_genre = list_genre.splice(0, 59)
    res.json({
      list_genre
    });
  } catch (error) {
    res.send({
      message: error
    });
  }
});

//genreDetail ----Done-----
router.get("/genres/:slug/:pagenumber", async (req, res) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const url = `genre/${slug}/page/${pagenumber}`;
  try {
    const response = await AxiosService(url)
    const $ = cheerio.load(response.data);
    const element = $(".daftar");
    var thumb, title, endpoint, type;
    var manga_list = [];
    element.find(".bge").each((idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      type = $(el).find(".bgei > .tpe1_inf").find("b").text();
      thumb = $(el).find(".bgei > img").attr("data-src");
      manga_list.push({
        title,
        type,
        thumb,
        endpoint
      });
    });
    res.json({
      status: true,
      message: 'success',
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: []
    });
  }
});

//manga popular pagination ----- Done ------
router.get("/manga/popular/:pagenumber", async (req, res) => {
  const pagenumber = req.params.pagenumber;
  const url = `other/rekomendasi/page/${pagenumber}/?orderby=meta_value_num&category_name=0`;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".daftar");
    let thumb, title, endpoint, type, upload_on;
    let manga_list = [];
    element.find(".bge").each((idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      type = $(el).find(".bgei > .tpe1_inf").find("b").text();
      thumb = $(el).find(".bgei > img").attr("data-src");
      upload_on = $(el).find(".kan").find("span").text().split("• ")[1];
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
        upload_on
      });
    });
    res.json({
      status: true,
      message: 'success',
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: []
    });
  }

});

//recommended ---done---
router.get("/recommended", async (req, res) => {

  try {
    const response = await AxiosService()

    const $ = cheerio.load(response.data);
    const element = $(".perapih").find(".grd");
    let manga_list = [];
    let type, title, chapter, update, endpoint, thumb;
    element.each((idx, el) => {
      title = $(el).find(".popunder > h4").text().trim();
      thumb = $(el).find(".gmbr1").find("img").attr("data-src");
      endpoint = $(el)
        .find(".popunder")
        .attr("href")
        .replace(replaceMangaPage, "");
      manga_list.push({
        title,
        chapter,
        type,
        thumb,
        endpoint,
        update
      });
    });
    return res.json({
      manga_list
    });
  } catch (error) {
    res.send({
      message: error.message
    });
  }
});

//manhua  ------Done------
router.get("/manhua/:pagenumber", async (req, res) => {
  await getManhuaManhwa(req, res, `manhua`);
});

//manhwa
router.get("/manhwa/:pagenumber", async (req, res) => {
  await getManhuaManhwa(req, res, `manhwa`);
});

const getManhuaManhwa = async (req, res, type) => {
  var pagenumber = req.params.pagenumber;
  var url = `https://komiku.id/pustaka/page/${pagenumber}/?orderby&category_name=${type}&genre&genre2&status`;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".perapih");
    var manga_list = [];
    var title, type, updated_on, endpoint, thumb, chapter;

    element.find(".daftar > .bge").each((idx, el) => {
      title = $(el).find(".kan > a").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      type = $(el).find(".bgei > a").find(".tpe1_inf > b").text();
      updated_on = $(el).find(".kan > span").text().split("• ")[1];
      thumb = $(el).find(".bgei > a").find("img").attr("src");
      chapter = $(el).find(".mree").text();
      manga_list.push({
        title,
        thumb,
        type,
        updated_on,
        endpoint,
        chapter
      });
    });

    res.status(200).json({
      status: true,
      message: 'success',
      manga_list
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: []
    });
  }
}

module.exports = router;