import { getConfig } from '@libs/getConfig';
import { handlerPath } from '@libs/handler-resolver';

const config = getConfig()

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: config.BUCKET_NAME,
        event: "s3:ObjectCreated:*",
        rules: [
          { prefix: `${config.UPLOAD_FOLDER_NAME}/` },
          { suffix: ".csv" },
        ],
        existing: true,
      },
    },
  ],
};
