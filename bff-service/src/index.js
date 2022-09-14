const express = require("express");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const app = express();

const port = process.env.PORT || 3000;

app.use("*", (req, res) => {
	const [, recipient, ...restPath] = req.originalUrl.split("/");

	const recipientUrl = process.env[recipient];

	if (!recipientUrl) {
		res.sendStatus(502);
		return;
	}

	fetch(
		recipientUrl
			.replace('https', 'http')
			.concat("/")
			.concat(restPath.join("/"))
			.concat(new URLSearchParams(req.query)),
		{ method: req.method, body: req.body }
	).then((actual) => {
		res.status(actual.status);
		actual.body.pipe(res);
	});
});

app.listen(port);
