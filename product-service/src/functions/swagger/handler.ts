import swaggerSpec from './swagger.json';

const applicationName = "Products service";

const specJson = JSON.stringify(swaggerSpec)

const body = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${applicationName}</title>
            <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@3/swagger-ui.css">
        </head>
        <body>
            <div id="swagger"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
            <script>
              SwaggerUIBundle({
                dom_id: '#swagger',
                url: './swagger.json'
            });
            </script>
        </body>
        </html>`;

const swaggerHandler = async (event) => {
  if (event.path === "/swagger.json") {
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: specJson,
    };
  }

  return {
    statusCode: 200,
    headers: {
      ["Content-Type"]: "text/html",
    },
    body,
  };
};

export const main = swaggerHandler;
