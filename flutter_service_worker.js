'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "c7b66ef17f4a324d4d40f395a08fe68c",
"assets/assets/1.PNG": "5b03e95d4d41ef2709884048e7e65209",
"assets/assets/10.PNG": "9ca4691f6ad7e8104ad5cef3c522b9b1",
"assets/assets/11.PNG": "8e7da70b16fb96695195cea474022516",
"assets/assets/13.png": "4b36f9b02404dac00c24a10da79bbc58",
"assets/assets/14.png": "d301a6c725dceb6eaa7011e0de3c25a7",
"assets/assets/15.png": "7e9df016334ca13e3da44cdff966460e",
"assets/assets/16.png": "9204c8e90e28d3a39e9ecba653dff820",
"assets/assets/17.png": "0c5a93fe2e3e45ff20f45b8712c5db3e",
"assets/assets/18.png": "1973c526c30dd68608e58bf44a6fa2a8",
"assets/assets/19.png": "b2842d313339779227f13ac640fbf344",
"assets/assets/2.PNG": "a49489cc2098c06ce7129573e954a8a3",
"assets/assets/20.png": "1b797bc9e99f62bd4e92db656e9aecb9",
"assets/assets/21.png": "e12b103551790465ed027b7b4424a466",
"assets/assets/3.PNG": "2cb3882279241463d44f327c91c9aeb9",
"assets/assets/4.PNG": "05e283226589613fe1465719421306de",
"assets/assets/5.PNG": "19da6ad05f5e19cd7b95ad6181db46e8",
"assets/assets/6.PNG": "b3d9f07636472005b42c012dd5ccccee",
"assets/assets/7.PNG": "0549573010006c81f2273915886b1c4a",
"assets/assets/8.PNG": "4e7dc04613dce5ead681d00002062c31",
"assets/assets/9.PNG": "ed92762f990e5142864903e2f76ab409",
"assets/assets/new.jpg": "5cede1d02cfba7bc293110d5920c7f59",
"assets/assets/new2.jpg": "6fb281acd0db1d9c371c60ce6302ede1",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/NOTICES": "ce937c7a9a906226c5b6a388b188629b",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"favicon.png": "50697457ebaf23252fd1b1faa6eb113c",
"flutter.js": "eb2682e33f25cd8f1fc59011497c35f8",
"icons/Icon-192.png": "fa38e72ed7e711083e280b4733c2d1e9",
"icons/Icon-512.png": "fcbe67fc47e0671e33787ac8932b033c",
"icons/Icon-maskable-192.png": "fa38e72ed7e711083e280b4733c2d1e9",
"icons/Icon-maskable-512.png": "fcbe67fc47e0671e33787ac8932b033c",
"index.html": "c27529e526467b2952ac4655377e571e",
"/": "c27529e526467b2952ac4655377e571e",
"main.dart.js": "2e9a166401dc3ecfd6051a6802126f32",
"manifest.json": "1046394ca1d2d7fc9beb00b62118f232",
"version.json": "980547175e325fe622a3362b84d55b6a"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
