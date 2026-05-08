/* ═══════════════════════════════════════
   POLARIS by Zink Solutions — app.js
   ═══════════════════════════════════════ */

/* ── Config ──────────────────────────── */
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url=';
const CACHE_TTL = 30 * 60 * 1000; // 30 min

const SOURCES = [
  {
    id: 'ft',
    name: 'Financial Times',
    badge: 'badge-ft',
    label: 'FT',
    icon: '📰',
    url: 'https://www.ft.com/rss/home/uk',
  },
  {
    id: 'nyt',
    name: 'New York Times',
    badge: 'badge-nyt',
    label: 'NYT',
    icon: '🗞️',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
  },
  {
    id: 'expansion',
    name: 'Expansión',
    badge: 'badge-expansion',
    label: 'EXP',
    icon: '📈',
    url: 'https://e00-expansion.uecdn.es/rss/portada.xml',
  },
  {
    id: 'confidencial',
    name: 'El Confidencial',
    badge: 'badge-confidencial',
    label: 'EC',
    icon: '💼',
    url: 'https://rss.elconfidencial.com/mercados/',
  },
  {
    id: 'brew',
    name: 'Morning Brew',
    badge: 'badge-brew',
    label: 'Brew',
    icon: '☕',
    url: 'https://www.morningbrew.com/daily/rss.xml',
  },
];

/* ── State ───────────────────────────── */
let allArticles = [];
let currentFilter = 'all';
let currentSection = 'home';

/* ── Zink Logo SVG ───────────────────── */
const ZINK_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 123.017 26.339" role="img" aria-label="ZINK IS" style="height:100%;width:auto;display:block;">
  <g transform="translate(-1150.011 -6060.754)">
    <g transform="translate(1165.15 6073.464)">
      <path class="zink-text-path" d="M5.749,4.812c.037.037.073.073.037.146L4.212,13.592H4.065l-.036-.036H-11.444v.036h-3.695L2.127-12.38H-4.129A10.033,10.033,0,0,0-13.054-7l-1.61,3.037c-.036.073-.073.109-.146.109-.036,0-.073-.036-.109-.073s-.037-.073-.037-.146l1.61-8.6H6.079L-11.189,13.263h6.183a10.022,10.022,0,0,0,8.89-5.378L5.492,4.85c.037-.073.073-.11.146-.11.037,0,.11.037.11.073"/>
    </g>
    <g transform="translate(1180.905 6079.658)">
      <path class="zink-text-path" d="M2.286,7.178a.168.168,0,0,1-.146.184H-5.871a.168.168,0,0,1-.148-.184.159.159,0,0,1,.148-.146h.439A2.069,2.069,0,0,0-3.385,4.983V-16.563a2.069,2.069,0,0,0-2.048-2.049h-.439a.159.159,0,0,1-.148-.146.159.159,0,0,1,.148-.146H2.139a.157.157,0,0,1,.146.146.157.157,0,0,1-.146.146h-.4A2.045,2.045,0,0,0-.311-16.563V4.983A2.045,2.045,0,0,0,1.736,7.032h.4a.157.157,0,0,1,.146.146"/>
    </g>
    <g transform="translate(1205.223 6060.791)">
      <path class="zink-text-path" d="M6.977,0a.134.134,0,0,1,.146.146.134.134,0,0,1-.146.146h-.8A3.029,3.029,0,0,0,3.136,3.329v22.9L1.2,26.266-14.057,3.11V22.937a3.013,3.013,0,0,0,3,3h.842a.157.157,0,0,1,.146.146.134.134,0,0,1-.146.146h-8.012a.134.134,0,0,1-.146-.146.157.157,0,0,1,.146-.146h.842a3.013,3.013,0,0,0,3-3V3.329a3.021,3.021,0,0,0-3-3.037h-.842a.157.157,0,0,1-.146-.146A.157.157,0,0,1-18.228,0h5.817L2.844,23.12V3.329A3.029,3.029,0,0,0-.193.293H-1A.168.168,0,0,1-1.181.146.168.168,0,0,1-1,0Z"/>
    </g>
    <g transform="translate(1215.013 6079.579)">
      <path class="zink-text-path" d="M.04,7.148h.4A2.068,2.068,0,0,0,2.491,5.1V-16.446A2.044,2.044,0,0,0,.443-18.5H.04c-.037,0-.073-.037-.11-.073a.137.137,0,0,1-.036-.11.157.157,0,0,1,.146-.146H8.051c.037,0,.073.037.11.073a.134.134,0,0,1,.037.11.159.159,0,0,1-.148.146h-.4A2.046,2.046,0,0,0,5.6-16.446V-5.29l9.218-10.791a1.394,1.394,0,0,0,.221-1.573,1.414,1.414,0,0,0-1.318-.842h-.585a.168.168,0,0,1-.146-.184.157.157,0,0,1,.146-.146h8.011a.168.168,0,0,1,.146.184.157.157,0,0,1-.146.146,8.488,8.488,0,0,0-6.4,2.964l-6.73,7.9c6.878.073,8.451,3.914,9.548,8.2.8,3,1.976,6.511,4.244,6.547.109,0,.146.073.146.184a.157.157,0,0,1-.146.146l-2.268.073c-1.207,0-2.452-.146-3.183-1.316a17.465,17.465,0,0,1-1.792-4.866l-.11-.439C13.319-3.5,12.368-7.266,7.723-7.3L5.6-4.814V5.1A2.069,2.069,0,0,0,7.649,7.148h.4a.137.137,0,0,1,.11.036.156.156,0,0,1-.11.257H.04c-.146,0-.146-.073-.146-.146A.157.157,0,0,1,.04,7.148"/>
    </g>
    <g transform="translate(1250.892 6080.322)">
      <path class="zink-blue-path" d="M0,6.771C8.07,4.575,14.989-1.688,18.971-10.7l3.165-7.129v24.6Z"/>
    </g>
    <g transform="translate(1262.699 6060.754)">
      <path class="zink-blue-path" d="M6.079,0C-2.02,2.2-8.769,8.459-12.814,17.474l-3.194,7.166V0H6.079"/>
    </g>
  </g>
</svg>`;

function injectLogos() {
  document.querySelectorAll('.zink-logo-placeholder').forEach(el => {
    el.innerHTML = ZINK_LOGO_SVG;
  });
}

/* ── Init ────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectLogos();
  setNavDate();
  setupHamburger();
});

/* ── Date helpers ────────────────────── */
function setNavDate() {
  const el = document.getElementById('navDate');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function setHeroDate() {
  const el = document.getElementById('heroDayDate');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

/* ── Navigation ──────────────────────── */
function showSection(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });

  const target = document.getElementById('section-' + id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  currentSection = id;

  document.querySelectorAll('.nav-a[data-section]').forEach(a => {
    a.classList.toggle('active', a.dataset.section === id);
  });

  closeMobileMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Hamburger (mobile) ──────────────── */
function setupHamburger() {
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    links.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) closeMobileMenu();
  });
}

function closeMobileMenu() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.remove('open');
}

/* ── News loading ────────────────────── */
async function loadAllNews() {
  showLoading(true);
  hideError();
  allArticles = [];

  // Try cache first
  const cached = loadCache();
  if (cached) {
    allArticles = cached;
    renderNews();
    return;
  }

  let anyError = false;

  const fetches = SOURCES.map(src =>
    fetchFeed(src).catch(() => { anyError = true; return []; })
  );

  const results = await Promise.all(fetches);
  results.forEach(arts => allArticles.push(...arts));

  // Sort by date descending
  allArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  if (anyError && allArticles.length === 0) {
    showLoading(false);
    showError();
    return;
  }
  if (anyError) showError();

  saveCache(allArticles);
  renderNews();
}

async function fetchFeed(src) {
  const apiUrl = RSS2JSON + encodeURIComponent(src.url) + '&count=12';
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (data.status !== 'ok' || !data.items) throw new Error('bad response');

  return data.items.map(item => ({
    source: src.id,
    sourceName: src.name,
    badge: src.badge,
    label: src.label,
    icon: src.icon,
    title: strip(item.title || ''),
    description: strip(item.description || item.content || ''),
    link: item.link || '#',
    pubDate: item.pubDate || '',
    image: extractImage(item),
  }));
}

/* ── Render ──────────────────────────── */
function renderNews(filter) {
  if (filter !== undefined) currentFilter = filter;
  showLoading(false);

  const articles = currentFilter === 'all'
    ? allArticles
    : allArticles.filter(a => a.source === currentFilter);

  if (articles.length === 0) {
    document.getElementById('newsFeatured').classList.add('hidden');
    document.getElementById('newsGrid').classList.add('hidden');
    document.getElementById('newsFooter').classList.add('hidden');
    return;
  }

  const [featured, ...rest] = articles;
  renderFeatured(featured);
  renderGrid(rest.slice(0, 11));

  const el = document.getElementById('lastUpdated');
  if (el) el.textContent = 'Actualizado: ' + new Date().toLocaleTimeString('es-ES');

  document.getElementById('newsFooter').classList.remove('hidden');
}

function renderFeatured(art) {
  const el = document.getElementById('newsFeatured');
  el.innerHTML = `
    <div class="featured-img">
      ${art.image
        ? `<img src="${art.image}" alt="" onerror="this.parentNode.innerHTML='<div class=\\"no-img\\">${art.icon}</div>'" />`
        : `<div class="no-img">${art.icon}</div>`}
    </div>
    <div class="featured-body">
      <span class="source-badge ${art.badge}">${art.label}</span>
      <h2>${art.title}</h2>
      <p>${art.description.slice(0, 280)}${art.description.length > 280 ? '…' : ''}</p>
      <div class="art-meta">${art.sourceName} · ${formatDate(art.pubDate)}</div>
      <a href="${art.link}" target="_blank" rel="noopener" class="read-link">Leer artículo →</a>
    </div>`;
  el.classList.remove('hidden');
}

function renderGrid(articles) {
  const el = document.getElementById('newsGrid');
  if (articles.length === 0) { el.classList.add('hidden'); return; }

  el.innerHTML = articles.map(art => `
    <div class="news-card">
      <div class="card-img">
        ${art.image
          ? `<img src="${art.image}" alt="" onerror="this.parentNode.innerHTML='<div class=\\"no-img\\">${art.icon}</div>'" />`
          : `<div class="no-img">${art.icon}</div>`}
      </div>
      <div class="card-body">
        <span class="source-badge ${art.badge}">${art.label}</span>
        <h3>${art.title}</h3>
        <p>${art.description.slice(0, 160)}${art.description.length > 160 ? '…' : ''}</p>
        <div class="art-meta">${art.sourceName} · ${formatDate(art.pubDate)}</div>
        <a href="${art.link}" target="_blank" rel="noopener" class="read-link">Leer →</a>
      </div>
    </div>`).join('');
  el.classList.remove('hidden');
}

function filterNews(src, btn) {
  currentFilter = src;

  // Update tab styles
  document.querySelectorAll('.src-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  renderNews(src);
}

/* ── UI helpers ──────────────────────── */
function showLoading(on) {
  const el = document.getElementById('newsLoading');
  if (el) el.style.display = on ? 'block' : 'none';
}

function showError() {
  const el = document.getElementById('newsError');
  if (el) el.classList.remove('hidden');
}

function hideError() {
  const el = document.getElementById('newsError');
  if (el) el.classList.add('hidden');
}

/* ── Helpers ─────────────────────────── */
function strip(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
}

function extractImage(item) {
  // Try enclosure
  if (item.enclosure && item.enclosure.link && item.enclosure.type && item.enclosure.type.startsWith('image')) {
    return item.enclosure.link;
  }
  // Try thumbnail
  if (item.thumbnail && item.thumbnail.startsWith('http')) return item.thumbnail;
  // Try content
  const match = (item.content || item.description || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];
  return null;
}

function formatDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d)) return str;
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1)  return 'Ahora mismo';
    if (diff < 60) return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch { return str; }
}

/* ── Cache ───────────────────────────── */
function saveCache(articles) {
  try {
    localStorage.setItem('polaris_news', JSON.stringify({ ts: Date.now(), articles }));
  } catch (e) { /* storage full */ }
}

function loadCache() {
  try {
    const raw = localStorage.getItem('polaris_news');
    if (!raw) return null;
    const { ts, articles } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return articles;
  } catch { return null; }
}
