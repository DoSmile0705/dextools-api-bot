const http = require("http");
const url = require("url");
const jwt = require("jsonwebtoken");
const spawn = require("child_process").spawn;
const path = require("path");

let serviceProcess = null;

const server = http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);

	const startService = async () => {
		let done = false;
		const processFilePath = path.resolve(__dirname, "index.js");
		serviceProcess = spawn("node", [processFilePath]);
		serviceProcess.stdout.on("data", function (data) {
			const dataString = data.toString();
			if (!done && dataString.indexOf("-----") === -1) {
				done = true;
				return;
			}
			console.log(dataString);
		});
	};

	const serviceEnd = async (req, res) => {
		serviceProcess.kill();
	};

	// Set CORS headers
	res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
	res.setHeader("Access-Control-Allow-Methods", "POST");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	// Check if the request is for the '/login' endpoint
	if (parsedUrl.pathname === "/login" && req.method === "POST") {
		let body = "";

		req.on("data", (chunk) => {
			body += chunk.toString();
		});

		// Parse the request body once it's complete
		req.on("end", () => {
			try {
				const data = JSON.parse(body);

				if (
					data.email == "personal.codemaker@gmail.com" &&
					data.password == "aaaaaa"
				) {
					const secretKey = "abcdefg12345ABCDZZXC!@#";
					const payload = {
						email: "personal.codemaker@gmail.com",
						password: "aaaaaa",
					};
					const options = {
						expiresIn: "1h",
					};
					const token = jwt.sign(payload, secretKey, options);

					console.log("token", token);

					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(
						JSON.stringify({ message: "Success", token: `Bearer ${token}` })
					);
				} else {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ message: "Faild" }));
				}
			} catch (error) {
				console.error("Error parsing JSON:", error);
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Invalid JSON" }));
			}
		});
	} else if (parsedUrl.pathname === "/mainPage" && req.method === "POST") {
		let body = "";

		req.on("data", (chunk) => {
			body += chunk.toString();
		});

		// Parse the request body once it's complete
		req.on("end", async () => {
			try {
				const data = JSON.parse(body);
				console.log("Received parameters:", data);

				if (data.status == "Start") {
					console.log("Started");
					await startService();
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ message: "Success" }));
				} else if (data.status == "Stop") {
					console.log("Stoped");
					await serviceEnd();
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ message: "Success" }));
				} else {
					console.log("Faild");
					res.end(JSON.stringify({ message: "Faild" }));
				}
			} catch (error) {
				console.error("Error parsing JSON:", error);
				res.writeHead(400, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Invalid JSON" }));
			}
		});
	} else {
		res.writeHead(200, { "Content-Type": "text/plain" });
		res.end("Not Allowed");
	}
});

const port = 3001;

server.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
