const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.NOIR_ASSET_TOOL_PORT || '4781', 10);
const HOST = '127.0.0.1';
const APP_DIR = __dirname;
const REPO_ROOT = path.resolve(APP_DIR, '..', '..');
const INDEX_HTML = path.join(APP_DIR, 'index.html');
const TARGET_DIR = path.join(REPO_ROOT, 'Theme', 'noir');
const PIXABAY_API = 'https://pixabay.com/api/';
const TOOL_OPTIONS = [
  { id: 'brickbuilder', label: 'Brick Builder' },
  { id: 'moodboards', label: 'Moodboards' },
  { id: 'blobs', label: 'Blobs' },
  { id: 'jigsaws', label: 'Jigsaws' },
  { id: 'iconfactory', label: 'Icon Factory' },
  { id: 'qrcodes', label: 'QR Codes' },
  { id: 'colors', label: 'Palettes / Colors' },
  { id: 'notes', label: 'Notes' },
  { id: 'locator', label: 'Locator' },
  { id: 'signatures', label: 'Signatures' },
  { id: 'svgrecolor', label: 'SVG Recolor' },
  { id: 'any2svg', label: 'Any2SVG' },
  { id: 'bgremover', label: 'BG Remover' },
  { id: 'wordclouds', label: 'Word Clouds' },
  { id: 'sankey', label: 'Sankey' },
  { id: 'mockups', label: 'Mockups' },
];
const TOOL_IDS = new Set(TOOL_OPTIONS.map((tool) => tool.id));
const ALLOWED_IMAGE_HOSTS = new Set(['pixabay.com', 'cdn.pixabay.com']);

fs.mkdirSync(TARGET_DIR, { recursive: true });

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const sendText = (res, statusCode, text, contentType = 'text/plain; charset=utf-8') => {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
};

const notFound = (res) => sendJson(res, 404, { error: 'Not found.' });

const getSavedAssets = () => {
  const saved = {};
  for (const tool of TOOL_OPTIONS) {
    const filePath = path.join(TARGET_DIR, `${tool.id}_noir.png`);
    saved[tool.id] = fs.existsSync(filePath);
  }
  return saved;
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
};

const parseJsonBody = async (req) => {
  const raw = await readBody(req);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('JSON body invalido.');
  }
};

const normalizeApiKey = (candidate) => {
  if (typeof candidate !== 'string') return '';
  return candidate.trim();
};

const resolveApiKey = (req, body = {}) => {
  return normalizeApiKey(
    process.env.PIXABAY_API_KEY
    || req.headers['x-pixabay-key']
    || body.apiKey
  );
};

const fetchJson = (requestUrl) => new Promise((resolve, reject) => {
  https.get(requestUrl, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8');
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Pixabay respondio ${response.statusCode}: ${text.slice(0, 240)}`));
        return;
      }
      try {
        resolve(JSON.parse(text));
      } catch (error) {
        reject(new Error('No se pudo parsear la respuesta de Pixabay.'));
      }
    });
  }).on('error', reject);
});

const isAllowedImageUrl = (rawUrl) => {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(parsed.hostname);
  } catch (error) {
    return false;
  }
};

const proxyImage = (remoteUrl, res) => {
  https.get(remoteUrl, (remoteRes) => {
    if (remoteRes.statusCode < 200 || remoteRes.statusCode >= 300) {
      sendJson(res, 502, { error: `La imagen remota respondio ${remoteRes.statusCode}.` });
      remoteRes.resume();
      return;
    }
    res.writeHead(200, {
      'Content-Type': remoteRes.headers['content-type'] || 'image/jpeg',
      'Cache-Control': 'no-store',
    });
    remoteRes.pipe(res);
  }).on('error', (error) => {
    sendJson(res, 502, { error: `No se pudo descargar la imagen: ${error.message}` });
  });
};

const handleSearch = async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const query = (url.searchParams.get('q') || '').trim();
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const orientation = (url.searchParams.get('orientation') || 'horizontal').trim();
  const apiKey = resolveApiKey(req);

  if (!apiKey) {
    sendJson(res, 400, {
      error: 'Falta la API key de Pixabay. Pegala en la UI o define PIXABAY_API_KEY.',
    });
    return;
  }

  if (!query) {
    sendJson(res, 400, { error: 'Escribe un termino de busqueda.' });
    return;
  }

  const searchUrl = new URL(PIXABAY_API);
  searchUrl.searchParams.set('key', apiKey);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('image_type', 'photo');
  searchUrl.searchParams.set('safesearch', 'true');
  searchUrl.searchParams.set('per_page', '24');
  searchUrl.searchParams.set('page', String(page));
  if (['all', 'horizontal', 'vertical'].includes(orientation)) {
    searchUrl.searchParams.set('orientation', orientation);
  }

  try {
    const payload = await fetchJson(searchUrl.toString());
    const hits = Array.isArray(payload.hits) ? payload.hits : [];
    sendJson(res, 200, {
      total: payload.total || 0,
      totalHits: payload.totalHits || hits.length,
      page,
      hits: hits.map((hit) => ({
        id: hit.id,
        previewURL: hit.previewURL,
        webformatURL: hit.webformatURL,
        largeImageURL: hit.largeImageURL || hit.webformatURL,
        tags: hit.tags,
        user: hit.user,
        userImageURL: hit.userImageURL || '',
        pageURL: hit.pageURL,
        width: hit.imageWidth,
        height: hit.imageHeight,
        downloads: hit.downloads,
        likes: hit.likes,
      })),
    });
  } catch (error) {
    sendJson(res, 502, { error: error.message });
  }
};

const handleSave = async (req, res) => {
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }

  const { toolId, dataUrl } = body;
  if (!TOOL_IDS.has(toolId)) {
    sendJson(res, 400, { error: 'toolId invalido.' });
    return;
  }

  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
    sendJson(res, 400, { error: 'Se esperaba un PNG en data URL.' });
    return;
  }

  const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  const outputPath = path.join(TARGET_DIR, `${toolId}_noir.png`);

  try {
    fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
    sendJson(res, 200, {
      ok: true,
      toolId,
      savedPath: path.relative(REPO_ROOT, outputPath).replace(/\\/g, '/'),
    });
  } catch (error) {
    sendJson(res, 500, { error: `No se pudo guardar el archivo: ${error.message}` });
  }
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    notFound(res);
    return;
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    const html = fs.readFileSync(INDEX_HTML, 'utf8');
    sendText(res, 200, html, 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/config') {
    sendJson(res, 200, {
      apiName: 'Pixabay',
      apiDocs: 'https://pixabay.com/api/docs/',
      hasEnvKey: Boolean(normalizeApiKey(process.env.PIXABAY_API_KEY)),
      targetDir: path.relative(REPO_ROOT, TARGET_DIR).replace(/\\/g, '/'),
      exportSize: 1024,
      tools: TOOL_OPTIONS,
      saved: getSavedAssets(),
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/search') {
    await handleSearch(req, res);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/image') {
    const remoteUrl = url.searchParams.get('url') || '';
    if (!isAllowedImageUrl(remoteUrl)) {
      sendJson(res, 400, { error: 'URL de imagen no permitida.' });
      return;
    }
    proxyImage(remoteUrl, res);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/save') {
    await handleSave(req, res);
    return;
  }

  notFound(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Noir Asset Tool disponible en http://${HOST}:${PORT}`);
  console.log(`Destino de exportacion: ${TARGET_DIR}`);
});
