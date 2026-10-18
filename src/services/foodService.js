// Recognises food entirely in the browser with the NutriVision YOLOv8 models,
// so scans cost nothing and photos never leave the device.
import { buildResult, classScores, letterbox, toInputData } from './foodDetection';

let modelsPromise;

// Loads the ONNX runtime and models on first use (~60 MB, cached by the browser
// afterwards) so they stay out of the bundle for every other page.
export function preloadFoodModels() {
  modelsPromise ||= (async () => {
    const [ort, wasm, { default: manifest }] = await Promise.all([
      import('onnxruntime-web/wasm'),
      import('onnxruntime-web/ort-wasm-simd-threaded.wasm?url'),
      import('../data/foodModels.json')
    ]);
    ort.env.wasm.wasmPaths = { wasm: wasm.default };
    const sessions = await Promise.all(
      manifest.models.map(model => ort.InferenceSession.create(model.file, { executionProviders: ['wasm'] }))
    );
    return { ort, manifest, sessions };
  })().catch(error => {
    modelsPromise = undefined;
    throw error;
  });
  return modelsPromise;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image.'));
    img.src = src;
  });
}

// Accepts a File/Blob or data URL and returns letterboxed RGBA pixels.
async function toPixels(image, size) {
  const objectUrl = typeof image === 'string' ? null : URL.createObjectURL(image);
  try {
    const img = await loadImage(objectUrl || image);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = 'rgb(114, 114, 114)';
    ctx.fillRect(0, 0, size, size);
    const box = letterbox(img.naturalWidth, img.naturalHeight, size);
    ctx.drawImage(img, box.x, box.y, box.w, box.h);
    return ctx.getImageData(0, 0, size, size).data;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export async function analyzeFood(image) {
  const { ort, manifest, sessions } = await preloadFoodModels();
  const size = manifest.inputSize;
  const input = new ort.Tensor('float32', toInputData(await toPixels(image, size), size), [1, 3, size, size]);
  const perModel = [];
  for (const [i, session] of sessions.entries()) {
    const outputs = await session.run({ [session.inputNames[0]]: input });
    const { labels, specialist } = manifest.models[i];
    perModel.push({ scores: classScores(outputs[session.outputNames[0]].data, labels), specialist });
  }
  const result = buildResult(perModel, manifest);
  if (!result) throw new Error('No food was detected in that photo.');
  return result;
}
