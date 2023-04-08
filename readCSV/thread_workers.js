const { workerData, parentPort } = require("worker_threads");
const { updateOne } = require('@hdworks/dynamo-db-wrapper')

console.log("IN thread workers")
let counter = 0;
let response;
!!workerData.csvData && console.log("workerData.csvData.length", workerData.csvData.length)

for (let i = 0; i < workerData.csvData.length; i++) {
	counter++;
	console.log("workerData.csvData._id", workerData.csvData._id)
	try {
		updateOne('users',
			{ _id: workerData.csvData._id },
			{
				$set: { mobileVerified: false }
			}
		)
	} catch (e) {
		console.log("users error", e)
	}
	//console.log("responseresponseresponse", response)
}
console.log("WORKER LAST DATA", JSON.stringify(workerData.csvData.slice(-1)))

//console.log("----parentPort", parentPort);

parentPort.postMessage(counter);
