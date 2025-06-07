
function jaroWinkler(s1: string, s2: string): number {
  const scaling = 0.1

  // Normalize: lowercase, trim
  const str1 = s1.trim().toLowerCase();
  const str2 = s2.trim().toLowerCase();
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = Array(len1).fill(false);
  const str2Matches = Array(len2).fill(false);

  // Count matches
  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (str2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      str1Matches[i] = str2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  // Count transpositions
  let t = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) t++;
    k++;
  }
  const transpositions = t / 2;

  // Jaro similarity
  const jaro = ((matches / len1) + (matches / len2) + ((matches - transpositions) / matches)) / 3;

  // Winkler adjustment: common prefix up to 4
  let prefix = 0;
  const maxPrefix = 4;
  for (let i = 0; i < Math.min(maxPrefix, len1, len2); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + prefix * scaling * (1 - jaro);
}


function nameSimilarityPercent(name1: string, name2: string): number {
  const score = jaroWinkler(name1, name2);
  return Math.round(score * 10000) / 100;
}

function normalizeUrl(urlStr: string): URL {
  const url = new URL(urlStr);
  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();

  // Remove default ports
  if ((url.protocol === 'http:' && url.port === '80') ||
    (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }

  // Decode unreserved characters in path
  try {
    url.pathname = decodeURIComponent(url.pathname);
  } catch {
    // leave encoded if decode fails
  }

  // Sort query params alphabetically
  const params = Array.from(url.searchParams.entries());
  params.sort(([k1], [k2]) => k1.localeCompare(k2));
  url.search = '';
  for (const [key, val] of params) {
    url.searchParams.append(key, val);
  }

  return url;
}

export function urlSimilarity(urlStr1: string, urlStr2: string): number {
  const u1 = normalizeUrl(urlStr1);
  const u2 = normalizeUrl(urlStr2);

  // Host comparison (exact match = 1, else 0)
  const hostScore = u1.hostname === u2.hostname ? 1 : 0;

  // Path segments Jaccard
  const segs1 = u1.pathname.split('/').filter(Boolean);
  const segs2 = u2.pathname.split('/').filter(Boolean);
  const pathScore = jaccardSimilarityUrl(segs1, segs2);

  // Query keys Jaccard
  const keys1 = Array.from(u1.searchParams.keys());
  const keys2 = Array.from(u2.searchParams.keys());
  const queryScore = jaccardSimilarityUrl(keys1, keys2);

  // Weighted aggregate
  const weights = { host: 0.5, path: 0.3, query: 0.2 };
  const score = (
    hostScore * weights.host +
    pathScore * weights.path +
    queryScore * weights.query
  ) / (weights.host + weights.path + weights.query);

  return score;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  // early exits
  if (m === 0) return n;
  if (n === 0) return m;

  // initialize 2-row DP table
  let prev = Array(n + 1).fill(0).map((_, i) => i);
  let curr = Array(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,        // deletion
        curr[j - 1] + 1,    // insertion
        prev[j - 1] + cost  // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function jaccardSimilarityUrl(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersectionSize = [...setA].filter(x => setB.has(x)).length;
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 1 : intersectionSize / unionSize;
}
function jaccardSimilarity(s1: string, s2: string): number {
  const tokenize = str =>
    str
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^\p{L}\p{N}_]/gu, '')) // strip punctuation
      .filter(Boolean);

  const a = new Set(tokenize(s1));
  const b = new Set(tokenize(s2));

  const intersectionSize = [...a].filter(x => b.has(x)).length;
  const unionSize = new Set([...a, ...b]).size;
  return unionSize === 0 ? 1 : intersectionSize / unionSize;
}

function sentenceSimilarityPercent(s1: string, s2: string): number {

  // Levenshtein-based ratio
  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  const levRatio = maxLen === 0 ? 1 : 1 - dist / maxLen;

  // Jaccard ratio
  const jacRatio = jaccardSimilarity(s1, s2);

  // final score
  const combined = (levRatio + jacRatio) / 2;

  return Math.round(combined * 100 * 100) / 100; // e.g. 83.33%
}


export { sentenceSimilarityPercent, nameSimilarityPercent, levenshteinDistance };
