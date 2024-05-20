const staticCacheName = "site-static-v10";
const dynamicCacheName = "site-dynamic-v10";
const assets = [
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "css/materialize.min.css",
  "/img/recipe.webp",
  "/img/icons/apple-touch-icon.png",
  "/img/icons/favicon.ico",
  "/img/icons/icon-16x16.png",
  "/img/icons/icon-32x32.png",
  "/img/icons/icon-192x192.png",
  "/img/icons/icon-512x512.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v67/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  "/pages/fallback.html",
];
//cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};
// install service worker
self.addEventListener("install", (evt) => {
  //   console.log("service worker has been installed");
  // deleting old cache if we are creating new one
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(assets);
      console.log("caching shell assets");
    })
  );
});
//activate event
self.addEventListener("activate", (evt) => {
  //   console.log("service worker has been activated");
  evt.waitUntil(
    caches.keys().then((keys) => {
      //   console.log(keys);
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});
//fetch events
self.addEventListener("fetch", (evt) => {
  if (evt.request.url.indexOf("firestore.googleapis.com") === -1) {
    evt.respondWith(
      caches
        .match(evt.request)
        .then((cacheRes) => {
          return (
            cacheRes ||
            fetch(evt.request).then((fetchRes) => {
              return caches.open(dynamicCacheName).then((cache) => {
                cache.put(evt.request.url, fetchRes.clone());
                limitCacheSize(dynamicCacheName, 20);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          if (evt.request.url.indexOf(".html") > -1)
            return caches.match("/pages/fallback.html");
        })
    );
  }
});
