import * as importObject from './rust_relay_bg.js';
const IMPORTS_KEY = './rust_relay_bg.js'
;
const CHUNK_STACK = [
"eNp1kEtOwzAQhsd9UR5SEAjEBtFlq8ghfZIuWXABLmCcdGKFOnZkOy2VkOghOBBHwwUE3bD0zPibb37gtiQAQFrkCaAxI2fRramtYwYl37BURM/2hrF1WqiFQMUKVTiGLw6NMpgzx1OJAK020bDttpsETjuH5I3cb7cfcHwwbXZKLLXZNOBiD/L73/r5vbp13Dgv89BSvEQ4Df5MorUXbV+RfzgHZwQCtgNkS1bpQvkGvB5WRi/qDI1tdCVXouYCSevRQ+HEtzK0Fhc03TTbu0XZ9TBK5lHc64/mk2ScJGPsjeLRlMYJjSeDzppLP9aJo9EsGp7sfOiPyLmvRcPhXa+fp5N4nOWYD+CdBP4cgY7lyF1t0HbD47SWS/odSRjsPaiuXHiZcSmpRxYGM0f1Co3USoRHZS1dseKyxjAo66/MqZA65dKG50orZ3hVFUrQvHK728PAZ4IGVYbUbSq0YdcWQlGf1ydUqZ4V"
].reverse();

async function chunkBytes(base64) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64');
  }
  const res = await fetch("data:application/octet-stream;base64," + base64);
  return res.bytes();
}

export const WASM_PROMISE = (async () => {
  const compressed = new ReadableStream({
    type: 'bytes',
    cancel: () => {
      CHUNK_STACK.length = 0;
    },
    pull: async (ctrl) => {
      if (CHUNK_STACK.length) {
        ctrl.enqueue(await chunkBytes(CHUNK_STACK.pop()));
      } else {
        ctrl.close();
      }
    }
  });
  const body = compressed.pipeThrough(new DecompressionStream('deflate'));
  const response = new Response(body,
  {
    status: 200,
      statusText: 'OK',
        headers: {
      'content-type': 'application/wasm'
    }
  });
  const {instance} = await WebAssembly.instantiateStreaming(response, {
    [IMPORTS_KEY]: importObject
  });
  importObject.__wbg_set_wasm(instance.exports);
  instance.exports.__wbindgen_start();
  return importObject;
})();

export function getWasm() {
  return WASM_PROMISE;
}
