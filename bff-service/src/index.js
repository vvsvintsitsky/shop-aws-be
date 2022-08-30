const express = require("express");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const app = express();

app.use("*", (req, res) => {
	const [, recipient, ...restPath] = req.originalUrl.split("/");

	const recipientUrl = process.env[recipient];

	if (!recipientUrl) {
		res.status(200);
        res.write(`${recipientUrl} | ${recipient}`);
        res.end();
		return;
	}

	fetch(
		recipientUrl
			.concat("/")
			.concat(restPath.join("/"))
			.concat(new URLSearchParams(req.query)),
		{ method: req.method, headers: req.headers, body: req.body, query }
	).then((actual) => {
		res.status(actual.status);
		actual.body.pipe(res);
	});
});

app.listen(4000);
