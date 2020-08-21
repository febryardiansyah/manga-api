const router = require("express").Router();
const cheerio = require("cheerio");
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send("chapter");
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  let link;
  try {
    //download
    let pdfResponse = await AxiosService(`https://pdf.komiku.co.id/${slug}`);
    const pdf$ = cheerio.load(pdfResponse.data);
    const element = pdf$(".title");
    link = element.find("a").attr("href");

    //response
    const response = await AxiosService(slug);
    const $ = cheerio.load(response.data);
    const content = $("#article");
    let chapter_image = [];
    let title,
      chapter_image_link,
      image_number,
      chapter_endpoint,
      download_link;
    chapter_endpoint = slug + "/";
    content.find(".dsk2").filter(function () {
      title = $(this).find("h1").text().replace("Komik ", "");
    });
    download_link = link.split('  ').join('%20%20');
    console.log(download_link);
    content.find(".bc").filter(function () {
      $(this)
        .find("img")
        .each(function (i, el) {
          chapter_image_link = $(el).attr("src");
          image_number = i + 1;
          chapter_image.push({ image_number, chapter_image_link });
        });
    });
    res.json({ title, chapter_endpoint, download_link, chapter_image });
  } catch (error) {
    res.send({ message: error });
  }
});

module.exports = router;
