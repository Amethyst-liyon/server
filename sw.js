// ひとこと家計簿：オフラインで開けるように画面とアイコンを保存しておく
const VER="kakeibo-v2";
const SHELL=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(VER).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.pathname.endsWith("version.json"))return; // 版の確認は毎回ネットから
  // 画面本体：ネットにつながれば最新、だめなら保存分
  if(req.mode==="navigate"||(url.origin===location.origin&&url.pathname.endsWith(".html"))){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VER).then(x=>x.put("./index.html",c));return r}).catch(()=>caches.match("./index.html")));return}
  // フォントと自前ファイル：保存分を先に使う
  if(url.origin===location.origin||url.host.endsWith("fonts.googleapis.com")||url.host.endsWith("fonts.gstatic.com")){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==="opaque"){const c=r.clone();caches.open(VER).then(x=>x.put(req,c))}return r})))}
});
