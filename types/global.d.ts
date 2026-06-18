declare module 'helmet' {
  import { RequestHandler } from 'express';
  const helmet: () => RequestHandler;
  export default helmet;
}

declare module 'axios-cookiejar-support' {
  import { AxiosStatic } from 'axios';
  const wrapper: (axios: AxiosStatic) => void;
  export default wrapper;
}