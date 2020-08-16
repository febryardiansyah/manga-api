const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const { default: Axios } = require("axios");
const AxiosService = require("../helpers/axiosService");
const tunnel = require("tunnel");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
axiosCookieJarSupport(Axios);
const cookiejar = new tough.CookieJar();

const tunnelAgent = tunnel.httpsOverHttp({
  proxy: {
    host: "202.137.25.8",
    port: 8080,
  },
});
router.get("/", (req, res) => {
  res.send("chapter");
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  const url = baseUrl + slug;
  let link;
  try {
    // let pdfResponse = await Axios.get(`https://pdf.komiku.co.id/${slug}`, {
    //   httpsAgent: tunnelAgent,
    //   jar: cookiejar,
    // });
    // const pdf$ = cheerio.load(pdfResponse.data);
    // const element = pdf$(".title");
    // link = element.find("a").attr("href");
    // console.log(link);

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
    // download_link = link;
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
