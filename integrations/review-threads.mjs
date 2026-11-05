// Review threads for the local review site (docs/claude-code-instructions-review-threads.md). Dev only: the endpoint is
// a Vite middleware added in `astro:server:setup`, a hook that only runs in `astro dev`, so the build never has it.
// The threads live in docs/review/inso-threads.json (gitignored), which Claude reads and writes too: every write
// re-reads the file and merges by id, never overwriting it blindly.
//   GET  /__review/threads?page=/work/…/   the threads of that page (all of them without ?page)
//   POST /__review/threads                 { action: 'create', page, section, rid, quote, selection?, version, text }
//                                          { action: 'reply', id, text } · { action: 'status', id, status }
//                                          { action: 'import', items: [{ page, section, rid, quote, version, text }] }
import fs from 'node:fs/promises';
import path from 'node:path';

const FILE = path.resolve('docs/review/inso-threads.json');
const AUTHOR = 'Zakaria'; // the only one writing from the page; Claude writes straight into the file

// localhost and the private LAN ranges only
const local = (a = '') => {
  const ip = a.replace(/^::ffff:/, '');
  return ip === '127.0.0.1' || ip === '::1' || /^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) || /^fe80:/i.test(ip);
};

const read = async () => {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch (e) {
    if (e.code === 'ENOENT') return { threads: [] };
    throw e; // a file Claude is halfway through writing, or broken JSON: don't touch it
  }
};
const write = async (data) => {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await fs.rename(tmp, FILE);
};
// local time with its offset, e.g. 2026-11-05T13:10:00+01:00
const now = () => {
  const d = new Date(), off = -d.getTimezoneOffset(), p = (n) => String(Math.abs(n)).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${off >= 0 ? '+' : '-'}${p(Math.trunc(off / 60))}:${p(off % 60)}`;
};
const nextId = (threads) => `t-${String(threads.reduce((m, t) => Math.max(m, Number(String(t.id).replace(/\D/g, '')) || 0), 0) + 1).padStart(3, '0')}`;
const str = (v, max = 4000) => (typeof v === 'string' ? v.slice(0, max) : '');
const thread = (threads, b) => ({
  id: nextId(threads),
  page: str(b.page, 300).split('?')[0],
  section: str(b.section, 200),
  rid: str(b.rid, 120),
  quote: str(b.quote, 300),
  ...(b.selection ? { selection: str(b.selection, 300) } : {}),
  version: ['a', 'b'].includes(b.version) ? b.version : 'both',
  status: 'open',
  messages: [{ author: AUTHOR, at: now(), text: str(b.text) }],
});

let queue = Promise.resolve(); // one write at a time
const change = (fn) => (queue = queue.then(async () => { const data = await read(); data.threads ??= []; const out = fn(data); await write(data); return out; }));

const body = (req) => new Promise((ok, fail) => {
  let s = '';
  req.on('data', (c) => { s += c; if (s.length > 1e6) req.destroy(); });
  req.on('end', () => { try { ok(JSON.parse(s || '{}')); } catch (e) { fail(e); } });
  req.on('error', fail);
});

export default function reviewThreads() {
  return {
    name: 'review-threads',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use('/__review/threads', async (req, res) => {
          const send = (code, data) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(data)); };
          if (!local(req.socket.remoteAddress)) return send(403, { error: 'local only' });
          try {
            if (req.method === 'GET') {
              const page = new URL(req.url ?? '/', 'http://x').searchParams.get('page');
              const { threads = [] } = await read();
              return send(200, { threads: page ? threads.filter((t) => t.page === page) : threads });
            }
            if (req.method !== 'POST') return send(405, { error: 'GET or POST' });
            const b = await body(req);
            const out = await change((data) => {
              const t = data.threads;
              if (b.action === 'create') { const n = thread(t, b); t.push(n); return n; }
              if (b.action === 'import') return (Array.isArray(b.items) ? b.items : []).map((it) => { const n = thread(t, it); t.push(n); return n; });
              const found = t.find((x) => x.id === b.id);
              if (!found) throw Object.assign(new Error('no such thread'), { code: 404 });
              if (b.action === 'reply') { (found.messages ??= []).push({ author: AUTHOR, at: now(), text: str(b.text) }); return found; }
              if (b.action === 'status' && ['open', 'resolved'].includes(b.status)) { found.status = b.status; return found; }
              throw Object.assign(new Error('unknown action'), { code: 400 });
            });
            return send(200, { ok: true, result: out });
          } catch (e) {
            return send(typeof e.code === 'number' ? e.code : 500, { error: String(e.message ?? e) });
          }
        });
      },
    },
  };
}
