const csvParser = require('csv-parser');
const fs = require('fs');

exports.master_reader = (req, res) => {
	const filepath = "./organizations-2000000.csv"
	let count = 0;
	fs.createReadStream(filepath)
		.on('error', (e) => {
			console.log("ERROR CSV MASTER_READER", e)
		})
		.pipe(csvParser())
		.on('data', (row) => {
			console.log("ROW", row["Name"], ++count)
		})
		.on('end', () => {
			// handle end of CSV
			console.log("END")
			res.status(200).send({count})
		})
	console.log("OUT")
	return { message: "read complete", count }
}