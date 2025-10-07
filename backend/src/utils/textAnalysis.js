const STOPWORDS = new Set([
  // Articles & determiners
  'the','a','an','this','that','these','those',
  // Conjunctions
  'and','or','but','if','then','else','for','nor','yet','so',
  // Prepositions
  'on','in','at','to','from','by','of','with','as','into','onto','upon','about','above','below','between','through','during','before','after','since','until',
  // Pronouns
  'i','you','he','she','it','we','they','me','my','mine','your','yours','his','her','hers','its','our','ours','their','theirs','them','him',
  // Verbs (common/filler)
  'is','am','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','done','can','could','will','would','should','shall','may','might','must',
  // Adverbs & quantifiers
  'not','no','yes','all','some','any','many','much','more','most','few','less','least','very','too','quite','rather','just','only','even','also','still','yet',
  // Question words
  'what','when','where','which','who','whom','whose','why','how',
  // Other common filler
  'one','two','get','got','go','going','went','gone','make','made','take','took','know','knew','think','thought','see','saw','come','came','want','wanted','like','liked','use','used','work','works','worked','way','time','thing','things','people','person','really','never','ever','always','often','sometimes','maybe','perhaps','probably',
  // Fragments/contractions
  've','ll','re','m','s','t','d'
]);

function normalize(text) {
  return String(text || '').toLowerCase().replace(/[\n\r]+/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/[^a-z0-9\s#@]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  const norm = normalize(text);
  return norm.split(' ').filter(t => {
    // Filter out: empty, stopwords, too short (< 3 chars), or pure numbers
    return t &&
           !STOPWORDS.has(t) &&
           t.length >= 3 &&
           !/^\d+$/.test(t);
  });
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

    // Count single words
    for (const t of tokens) {
      counts[t] = (counts[t] || 0) + 1;
    }

    // Count bigrams (filter out very short ones)
    if (includeBigrams) {
      for (const g of ngrams(tokens, 2)) {
        if (g.length >= 6) { // At least "abc def" length
          counts[g] = (counts[g] || 0) + 1;
        }
      }
    }

    // Count trigrams (filter out very short ones)
    if (includeTrigrams) {
      for (const g of ngrams(tokens, 3)) {
        if (g.length >= 10) { // At least "abc def ghi" length
          counts[g] = (counts[g] || 0) + 1;
        }
      }
    }
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

