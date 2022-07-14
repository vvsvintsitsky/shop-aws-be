import { BASE_URL } from '@functions/consts';
import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: BASE_URL,
        cors: true,
      },
    },
  ],
};
