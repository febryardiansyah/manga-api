const axios = require("axios").default;
const tunnel = require("tunnel");
const baseUrl = require("../constants/urls");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
axiosCookieJarSupport(axios);
const cookiejar = new tough.CookieJar();
const tunnelAgent = tunnel.httpsOverHttp({
  proxy: {
    host: "103.106.219.121",
    port: 8080,
  },
});
axios.defaults.baseURL = baseUrl;
// axios.defaults.httpsAgent = tunnelAgent;
// axios.defaults.jar = cookiejar;

const AxiosService = async (url) => {
  return new Promise(async (resolve, reject) => {
    const _url = url == null?url:encodeURI(url);
    try {
      const response = await axios.get(_url);
      if (response.status === 200) {
        return resolve(response);
      }
      return reject(response);
    } catch (error) {
      return reject(error.message);
    }
  });
};
module.exports = AxiosService;
