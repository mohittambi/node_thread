const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  // This is the main thread
  const numThreads = 4;
  const inputData = [...Array(1000000)].map((_, i) => i); // Generate an array of input data
  
  // Divide the input data into chunks to be processed by each worker thread
  const chunkSize = Math.ceil(inputData.length / numThreads);
  const chunks = [...Array(numThreads)].map((_, i) =>
    inputData.slice(i * chunkSize, (i + 1) * chunkSize)
  );
  
  // Create and start the worker threads
  const workers = [];
  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker(__filename, { workerData: chunks[i] });
    worker.on('message', result => console.log(result));
    workers.push(worker);
  }
  
  // Wait for all worker threads to finish
  Promise.all(workers.map(worker => new Promise(resolve => worker.on('exit', resolve))))
    .then(() => console.log('All worker threads finished'));
} else {
  // This is a worker thread
  const result = workerData.reduce((sum, val) => sum + val, 0); // Perform a CPU-intensive task
  parentPort.postMessage(result); // Send the result back to the main thread
}
