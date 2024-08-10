const router = require("express").Router();
const cheerio = require("cheerio");
const {baseUrl, baseApi} = require("../constants/urls");
const replaceMangaPage = "https://komiku.id/manga/";
const AxiosService = require("../helpers/axiosService");

// manga popular ----Ignore this for now --------
router.get("/manga/popular", async (req, res) => {
  res.send({
    message: "nothing",
  });
});

//mangalist pagination  -------Done------
router.get("/manga/page/:pagenumber", async (req, res) => {
  let pagenumber = req.params.pagenumber;
  let path =
    pagenumber === "1"
      ? "/manga/"
      : `/manga/page/${pagenumber}/`;
  let url = baseApi + path;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".bge");
      let manga_list = [];
      let title, type, updated_on, endpoint, thumb, chapter;


      element.each((idx, el) => {
        console.log(1);
        title = $(el).find(".kan > a").find("h3").text().trim();
        endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(el).find(".bgei > a").find(".tpe1_inf > b").text();
        updated_on = $(el).find(".kan > span").text().split("• ")[1].trim();
        thumb = $(el).find(".bgei > a").find("img").attr("src");
        chapter = $(el)
          .find("div.kan > div:nth-child(5) > a > span:nth-child(2)")
          .text();
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
        message: "success",
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

// detail manga  ---- Done -----
router.get("/manga/detail/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const response = await AxiosService(`/manga/${slug}`);
    const $ = cheerio.load(response.data);
    const element = $(".perapih");
    let genre_list = [];
    let chapter = [];
    const obj = {};

    /* Get Title, Type, Author, Status */
    const getMeta = element.find(".inftable > tbody").first();
    obj.title = $("#Judul > h1").text().trim();
    obj.type = $("tr:nth-child(2) > td:nth-child(2)").find("b").text();
    obj.author = $("#Informasi > table > tbody > tr:nth-child(4) > td:nth-child(2)")
      .text()
      .trim();
    obj.status = $(getMeta).children().eq(4).find("td:nth-child(2)").text();

    /* Set Manga Endpoint */
    obj.manga_endpoint = slug;

    /* Get Manga Thumbnail */
    obj.thumb = element.find(".ims > img").attr("src");

    element.find(".genre > li").each((idx, el) => {
      let genre_name = $(el).find("a").text();
      genre_list.push({
        genre_name,
      });
    });

    obj.genre_list = genre_list || [];

    /* Get Synopsis */
    const getSinopsis = element.find("#Sinopsis").first();
    obj.synopsis = $(getSinopsis).find("p").text().trim();

    /* Get Chapter List */
    $("#Daftar_Chapter > tbody")
      .find("tr")
      .each((index, el) => {
        let chapter_title = $(el).find("a").text().trim();
        let chapter_endpoint = $(el).find("a").attr("href");
        if (chapter_endpoint !== undefined) {
          const rep = chapter_endpoint.replace("/ch/", "");
          chapter.push({
            chapter_title,
            chapter_endpoint: rep,
          });
        }
        obj.chapter = chapter;
      });

    res.status(200).send(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
    });
  }
});

//serach manga ------Done-----------
router.get("/search/", async (req, res) => {
  const query = req.query.q;
  const url =  baseApi + `?post_type=manga&s=${query}`;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".bge");
    let manga_list = [];
    let title, thumb, type, endpoint, updated_on;
    element.each((idx, el) => {
      endpoint = $(el)
        .find("a")
        .attr("href")
        .replace(replaceMangaPage, "")
        .replace("/manga/", "");
      thumb = $(el).find("div.bgei > a > img").attr("data-src");
      type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      title = $(el).find(".kan").find("h3").text().trim();
      updated_on = $(el).find("div.kan > p").text().split(".")[0].trim();
      manga_list.push({
        title,
        thumb,
        type,
        endpoint,
        updated_on,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});

//genreList  -----Done-----
router.get("/genres", async (req, res) => {
  try {
    const response = await AxiosService();

    const $ = cheerio.load(response.data);
    let list_genre = [];
    let obj = {};
    $("#Filter > form > select:nth-child(2)")
      .find("option")
      .each((idx, el) => {
        if ($(el).text() !== "Genre 1") {
          const endpoint = $(el)
            .text()
            .trim()
            .split(" ")
            .join("-")
            .toLowerCase();
          list_genre.push({
            genre_name: $(el).text(),
            endpoint,
          });
        }
      });
    obj.status = true;
    obj.message = "success";
    obj.list_genre = list_genre;
    res.json(obj);
  } catch (error) {
    res.send({
      status: false,
      message: error,
    });
  }
});

//genreDetail ----Done-----
router.get("/genres/:slug/:pagenumber", async (req, res) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `genre/${slug}/?orderby=modified&genre2&status&category_name`
      : `manga/page/${pagenumber}/?orderby=modified&category_name&genre=${slug}&genre2&status`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".bge");
    var thumb, title, endpoint, type;
    var manga_list = [];
    element.each((idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      type = $(el).find("div.bgei > a > div").find("b").text();
      thumb = $(el).find("div.bgei > a > img").attr("src");
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
});

//manga popular pagination ----- Done ------
router.get("/manga/popular/:pagenumber", async (req, res) => {
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `other/rekomendasi/`
      : `other/rekomendasi/page/${pagenumber}/`;
  const url = baseApi + path;

  try {
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".bge");
    let thumb, title, endpoint, type, upload_on, sortDesc;
    let manga_list = [];
    element.each((idx, el) => {
      title = $(el).find(".kan").find("h3").text().trim();
      endpoint = $(el)
        .find("a")
        .attr("href")
        .replace(replaceMangaPage, "")
        .replace("/manga/", "");
      type = $(el).find("div.bgei > a > div.tpe1_inf > b").text();
      thumb = $(el).find("div.bgei > a > img").attr("src");
      sortDesc = $(el).find("div.kan > p").text().trim();
      upload_on = $(el).find("div.kan > span.judul2").text().split("•")[1].trim();
      manga_list.push({
        title,
        type,
        thumb,
        endpoint,
        upload_on,
        sortDesc
      });
    });
    res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
});

//recommended ---done---
router.get("/recommended/:pagenumber", async (req, res) => {
  const pagenumber = req.params.pagenumber;
  const path =
    pagenumber === "1"
      ? `other/hot/`
      : `other/hot/page/${pagenumber}/`;
  const url = baseApi + path;
  try {
    const response = await AxiosService(url);

    const $ = cheerio.load(response.data);
    const element = $(".bge");
    let manga_list = [];
    let type, title, chapter, update, endpoint, thumb;
    element.each((idx, el) => {
      title = $(el).find("div.kan > a > h3").text().trim();
      thumb = $(el).find("div.bgei > a > img").attr("src");
      endpoint = $(el)
        .find("div.kan > a")
        .attr("href")
        .replace("/manga/", "")
        .replace(replaceMangaPage, "");
      manga_list.push({
        title,
        chapter,
        type,
        thumb,
        endpoint,
        update,
      });
    });
    return res.json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    res.send({
      message: error.message,
    });
  }
});

//manhua  ------Done------
router.get("/manhua/page/:pagenumber", async (req, res) => {
  await getManhuaManhwa(req, res, `manhua`);
});

//manhwa
router.get("/manhwa/page/:pagenumber", async (req, res) => {
  await getManhuaManhwa(req, res, `manhwa`);
});

const getManhuaManhwa = async (req, res, type) => {
  let pagenumber = req.params.pagenumber;
  let path =
    pagenumber === "1"
      ? `manga/?orderby=&category_name=${type}&genre=&genre2=&status=`
      : `manga/page/${pagenumber}/?orderby&category_name=${type}&genre&genre2&status`;
  const url = baseApi + path;
  try {
    console.log(url);
    const response = await AxiosService(url);
    const $ = cheerio.load(response.data);
    const element = $(".bge");
    var manga_list = [];
    var title, type, updated_on, endpoint, thumb, chapter;

    element.each((idx, el) => {
      title = $(el).find(".kan > a").find("h3").text().trim();
      endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
      type = $(el).find(".bgei > a").find(".tpe1_inf > b").text().trim();
      updated_on = $(el).find(".kan > span").text().split("• ")[1].trim();
      thumb = $(el).find(".bgei > a").find("img").attr("src");
      chapter = $(el)
        .find("div.kan > div:nth-child(5) > a > span:nth-child(2)")
        .text();
      manga_list.push({
        title,
        thumb,
        type,
        updated_on,
        endpoint,
        chapter,
      });
    });

    res.status(200).json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
};

module.exports = router;
