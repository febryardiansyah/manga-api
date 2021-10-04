const router = require("express").Router();
const cheerio = require("cheerio");
const axios = require("axios").default
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send({
    message: "chapter"
  });
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const response = await AxiosService(`ch/${slug}/`);
    // const response = await axios.get(`https://komikcast.id/${slug}`)
    const $ = cheerio.load(response.data);
    const content = $("#article");
    let chapter_image = [];
    const obj = {};
    obj.chapter_endpoint = slug + "/";
    obj.chapter_name = slug.split('-').join(' ').trim()

    obj.title = $('#Judul > h1').text().trim()
    /**
     * @Komiku
     */
    const getTitlePages = content.find(".dsk2")
    getTitlePages.filter(() => {
      obj.title = $(getTitlePages).find("h1").text().replace("Komik ", "");
    });

    /**
     * @Komiku
     */
    const getPages = $('#Baca_Komik > img')

    // const getPages = $('#chimg > img')
    obj.chapter_pages = getPages.length;
    getPages.each((i, el) => {
      chapter_image.push({
        chapter_image_link: $(el).attr("src").replace('i0.wp.com/',''),
        image_number: i + 1,
      });
    });
    obj.chapter_image = chapter_image;
    res.json(obj);
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
      chapter_image :[]
    });
  }
});

module.exports = router;