const VERSION = '2026-08-07-v19';
const CACHE = 'quiz-' + VERSION;

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // HTML은 항상 네트워크 우선 (최신 버전 보장)
  if (e.request.destination === 'document' || e.request.url.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Supabase API 요청(랭킹/문제/설정 등 동적 데이터)은 절대 캐싱하지 않고 항상 네트워크로 직접 호출
  if (e.request.url.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // 교육 PDF는 용량이 크므로 기기 캐시에 쌓지 않고 필요할 때 불러온다.
  if (new URL(e.request.url).pathname.toLowerCase().endsWith('.pdf')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // 나머지 정적 리소스는 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
