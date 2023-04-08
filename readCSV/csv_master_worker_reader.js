const { Worker } = require("worker_threads");
const fs = require("fs");
const csvParser = require('csv-parser');

const THREAD_COUNT = 8;

function createWorker(csvData) {
	return new Promise(function (resolve, reject) {
		const worker = new Worker("./readCSV/thread_workers.js", {
			workerData: {
				thread_count: THREAD_COUNT,
				csvData: csvData
			},
		});

		worker.on("message", (data) => {
			resolve({ data, message: "createWorker resolved" });
		});
		worker.on("error", (msg) => {
			reject(`An error ocurred: ${ msg }`);
		});
	});
}

const csv_master = async (csvData) => {
	try {
		const workerPromises = [];
		const len = csvData.length
		console.log("csvData size", len)
		let startAt = 0;
		const theadLen = len / THREAD_COUNT

		for (let i = 0; i < THREAD_COUNT; i++) {
			let updatedCSV = csvData.slice(startAt, startAt + theadLen)
			workerPromises.push(createWorker(updatedCSV));
			startAt += theadLen
		}

		const thread_results = await Promise.all(workerPromises);
		const total = thread_results.reduce((x, y) => x + y);
		return { message: "Success result is " + total, thread_results }
	} catch (error) {
		console.log("csv_master error: ", error)
		throw new Error(error)
	}
}

const fetchCSVData = async (filepath) => {
	return new Promise((res, rej) => {
		let count = 0;
		let csvData = []
		fs.createReadStream(filepath)
			.on('error', (e) => {
				rej("ERROR CSV MASTER_READER", e)
				console.log("ERROR CSV MASTER_READER", e)
			})
			.pipe(csvParser())
			.on('data', (row) => {
				csvData.push(row)
				// console.log("ROW", row["Name"], ++count)
			})
			.on('end', async () => {
				console.log("END")
				const resp = await csv_master(csvData)
				console.log("RESPONSE fetchCSVData", JSON.stringify(resp))
				res({ status: 200, message: "csv fetch complete and processing done" })
			})
	}
	)
}

exports.csv_master_worker_reader = async (req, res) => {
	try {
		const finalRes = await fetchCSVData("./results.csv")
		console.log("FINAL RESPONSE ", finalRes)
		if (finalRes.status == 200) {
			res.status(200).send("csv_master_worker_reader run complete")
		} else {
			res.status(400).send("BAD RESPONSE")
		}
	} catch (e) {
		console.log("ERROR csv_master_worker_reader", e)
	}
}