const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

const connection = mysql.createConnection({
	host: "server2.bsthun.com",
	port: "6105",
	user: "lab_kjiut",
	password: "w1NptYf2cq2t8PO4",
	database: "lab_todo02_k5tbti",
});

connection.connect(() => {
	console.log("Database is connected");
});

app.use(bodyParser.json({ type: "application/json" }));

app.listen(port);

// POST /login
app.post("/basic/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ?",
		[username]
	);

	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, async (err, rows) => {
		if(err){
			return res.json({
				success: false,
				data: null,
				error: err.message
			});
		} 
		numRows = rows.length;		
		if(numRows == 0){
			res.json({
				success: false,
				message: "User not found",
			});
		} else {
			authenticated = await bcrypt.compare(password, rows[0].hashed_password);
			if(authenticated){
				res.json({
					success: true,
					message: "User authentification is successful",
					user: rows[0],
				});
			} else {
				res.json({
					success: false,
					message: "User authentification failed",
				});
			}
		}
	});
});

// POST /register
app.post("/basic/register", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	const regex = new RegExp(/^(?=.*?[A-Z]+)(?=.*?[a-z]+)(?=.*?[0-9]+).{8,}$/);
	if(regex.test(password)){
		const salt = await bcrypt.genSalt(10);
		const hashed_password = await bcrypt.hash(password, salt);

		var sql = mysql.format(
			"INSERT INTO users (username, password, hashed_password) VALUES (?, ?, ?)",
			[username, password, hashed_password]
		);

		console.log("DEBUG: /basic/register => " + sql);
		connection.query(sql, (err, rows) => {
			if (err) {
				res.json({
				  success: false,
				  error: err.message,
				});
			  } else {
				if(rows){
					res.json({
						success: true,
						message: "registration success",
					  });
				}
			  }
		});
	} else {
		res.json({
			success: false,
			message: "Invalid password."
		})
	}
});

