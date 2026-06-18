import axios, { AxiosResponse } from "axios";
import axiosCookieJarSupport from "axios-cookiejar-support";
import {baseUrl} from "../constants/urls";

axiosCookieJarSupport(axios);

axios.defaults.baseURL = baseUrl;

const AxiosService = async (url?: string | null): Promise<AxiosResponse> => {
  const _url = url == null ? url : encodeURI(url);
  try {
    const response = await axios.get(_url as string);
    if (response.status === 200) {
      return response;
    }
    throw response;
  } catch (error: any) {
    if (error?.response?.status) {
      throw error;
    }
    throw error;
  }
};

export default AxiosService;