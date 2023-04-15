import {parentPort, workerData} from 'worker_threads';

function fibonacci(n: number): number {
    if (n < 2) {
      return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  if (parentPort) {
    parentPort.postMessage(fibonacci(workerData));
  }