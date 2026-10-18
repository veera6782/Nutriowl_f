// Pure helpers for running the NutriVision YOLOv8 food models.
// No browser APIs here, so the same code runs in tests under Node.

// Lowest raw confidence NutriVision accepted from any model.
const MIN_SCORE = 0.15;

// Ultralytics letterbox geometry: scale to fit, centre on a size x size canvas.
export function letterbox(width, height, size) {
  const scale = Math.min(size / width, size / height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  return { x: Math.round((size - w) / 2), y: Math.round((size - h) / 2), w, h };
}

// RGBA pixels (size x size) -> normalised CHW float32 RGB, the model's input layout.
export function toInputData(rgba, size) {
  const area = size * size;
  const data = new Float32Array(3 * area);
  for (let i = 0; i < area; i++) {
    data[i] = rgba[i * 4] / 255;
    data[area + i] = rgba[i * 4 + 1] / 255;
    data[2 * area + i] = rgba[i * 4 + 2] / 255;
  }
  return data;
}

// YOLOv8 output is [1, 4 + classes, anchors]. Returns the best score per class,
// highest first. Only the top labels are used, so no box decoding or NMS is needed.
export function classScores(output, labels) {
  const anchors = output.length / (4 + labels.length);
  const scores = [];
  for (let c = 0; c < labels.length; c++) {
    const row = (4 + c) * anchors;
    let best = 0;
    for (let a = 0; a < anchors; a++) {
      if (output[row + a] > best) best = output[row + a];
    }
    if (best >= MIN_SCORE) scores.push({ label: labels[c], score: best });
  }
  return scores.sort((a, b) => b.score - a.score);
}

// NutriVision's calibration: the small specialist (Indian food) model boosts
// confident guesses and halves unsure ones so they don't beat the general model.
export function rankingScore(score, specialist) {
  if (!specialist) return score;
  if (score >= 0.7) return Math.min(0.95, score + 0.05 + (score - 0.7) * 0.5);
  if (score >= 0.5) return score;
  return score * 0.5;
}

const titleCase = label => label.replace(/\b[a-z]/g, ch => ch.toUpperCase());

// Combines every model's class scores into the scan result the UI expects.
export function buildResult(perModel, manifest) {
  const candidates = perModel
    .flatMap(({ scores, specialist }) =>
      scores.map(s => ({ ...s, rank: rankingScore(s.score, specialist) })))
    .sort((a, b) => b.rank - a.rank);
  if (!candidates.length) return null;

  const top = candidates[0];
  const grams = manifest.servingGrams;
  const per100g = manifest.nutrition[top.label];
  const amount = key => (per100g ? Math.round((per100g[key] * grams) / 100) : null);

  return {
    isSample: false,
    source: 'on-device',
    food: titleCase(top.label),
    confidence: Math.round(top.score * 100),
    servingGrams: grams,
    calories: amount('calories'),
    protein: amount('protein'),
    carbs: amount('carbs'),
    fat: amount('fat'),
    sugar: null,
    sodium: null,
    fiber: null,
    vitamins: [],
    minerals: [],
    healthScore: null
  };
}
