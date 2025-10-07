const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','else','for','on','in','at','to','from','by','of','with','as','is','it','this','that','these','those','be','are','was','were','i','you','he','she','they','we','me','my','our','your','their','has','have','had','do','did','done','not','no','so','too','very','can','will','just'
]);

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[\n\r]+/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/[^a-z0-9\s#@]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  const norm = normalize(text);
  return norm.split(' ').filter(t => t && !STOPWORDS.has(t));
}

function ngrams(tokens, n) {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

function countTerms(texts, { includeBigrams = true, includeTrigrams = true } = {}) {
  const counts = {};
  for (const text of texts) {
    const tokens = tokenize(text);
    for (const t of tokens) counts[t] = (counts[t] || 0) + 1;
    if (includeBigrams) for (const g of ngrams(tokens, 2)) counts[g] = (counts[g] || 0) + 1;
    if (includeTrigrams) for (const g of ngrams(tokens, 3)) counts[g] = (counts[g] || 0) + 1;
  }
  return counts;
}

function topTerms(counts, limit = 100) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .reduce((acc, [term, count]) => { acc[term] = count; return acc; }, {});
}

function buildWordCloud(commentsTexts, captionTexts) {
  const commentsCounts = countTerms(commentsTexts || []);
  const captionsCounts = countTerms(captionTexts || []);
  // Weighted merge: comments weigh 2x compared to captions
  const merged = {};
  for (const [k,v] of Object.entries(captionsCounts)) merged[k] = (merged[k] || 0) + v;
  for (const [k,v] of Object.entries(commentsCounts)) merged[k] = (merged[k] || 0) + v * 2;
  return {
    total_terms: Object.keys(merged).length,
    top_overall: topTerms(merged, 200),
    top_comments: topTerms(commentsCounts, 200),
    top_captions: topTerms(captionsCounts, 200)
  };
}

module.exports = {
  buildWordCloud,
  countTerms,
  topTerms,
  tokenize
};

