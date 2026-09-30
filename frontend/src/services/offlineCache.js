const DB_NAME = "minesight-offline-data";
const DB_VERSION = 2;
const STORE_NAME = "api-responses";
const OUTBOX_STORE = "mutation-outbox";
const MAX_CACHED_RESPONSES = 200;

let databasePromise;

function openDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is unavailable"));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
        if (!database.objectStoreNames.contains(OUTBOX_STORE)) {
          database.createObjectStore(OUTBOX_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function getOfflineCacheScope() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const identity = user?._id || user?.id || user?.email;

    if (identity) return `user:${encodeURIComponent(identity)}`;
    if (localStorage.getItem("token")) return null;
    return "guest";
  } catch {
    return null;
  }
}

export function getApiCacheKey(config) {
  const scope = getOfflineCacheScope();
  if (!scope) return null;

  const params = config.params ? stableSerialize(config.params) : "";
  return `${scope}::${config.baseURL || ""}${config.url || ""}?${params}`;
}

export async function readApiCache(key) {
  if (!key) return null;

  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, "readonly")
      .objectStore(STORE_NAME)
      .get(key);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveApiResponse(response) {
  const key = response.config?.__offlineCacheKey;
  if (!key || response.status < 200 || response.status >= 300) return;

  const database = await openDatabase();
  const record = {
    key,
    scope: key.slice(0, key.indexOf("::")),
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers?.toJSON?.() || response.headers || {},
    updatedAt: Date.now(),
  };

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put(record);

    const allRecords = store.getAll();
    allRecords.onsuccess = () => {
      allRecords.result
        .sort((first, second) => second.updatedAt - first.updatedAt)
        .slice(MAX_CACHED_RESPONSES)
        .forEach((staleRecord) => store.delete(staleRecord.key));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function clearOfflineCache(scope) {
  if (!scope) return;

  const database = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const allRecords = store.getAll();

    allRecords.onsuccess = () => {
      allRecords.result
        .filter((record) => record.scope === scope)
        .forEach((record) => store.delete(record.key));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function notifyCachedResponse(type, detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export async function queueOfflineMutation(config) {
  const scope = getOfflineCacheScope();
  if (!scope) throw new Error("Sign in online before saving changes offline.");

  const url = config.url || "";
  const excludedPath = /(^|\/)auth\//i.test(url)
    || /(^|\/)attendance\//i.test(url)
    || /(^|\/)workers\/attendance/i.test(url)
    || /(^|\/)support\//i.test(url);
  if (excludedPath) throw new Error("This action requires a live connection.");

  const isFormData = config.data instanceof FormData;
  const data = isFormData
    ? Array.from(config.data.entries(), ([name, value]) => ({
        name,
        value,
        filename: value instanceof File ? value.name : undefined,
      }))
    : config.data;
  const headers = config.headers?.toJSON?.() || config.headers || {};
  delete headers.Authorization;
  delete headers.authorization;
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  const record = {
    id: crypto.randomUUID(),
    scope,
    url,
    method: config.method,
    params: config.params || null,
    data,
    isFormData,
    headers,
    createdAt: Date.now(),
  };
  const database = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(OUTBOX_STORE, "readwrite");
    transaction.objectStore(OUTBOX_STORE).add(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  notifyCachedResponse("minesight:offline-queue-updated", {
    scope,
    count: await countOfflineMutations(scope),
  });
  return record;
}

export async function getOfflineMutations(scope = getOfflineCacheScope()) {
  if (!scope) return [];
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(OUTBOX_STORE, "readonly")
      .objectStore(OUTBOX_STORE)
      .getAll();
    request.onsuccess = () => resolve(
      request.result
        .filter((record) => record.scope === scope)
        .sort((first, second) => first.createdAt - second.createdAt),
    );
    request.onerror = () => reject(request.error);
  });
}

export async function countOfflineMutations(scope = getOfflineCacheScope()) {
  return (await getOfflineMutations(scope)).length;
}

export async function removeOfflineMutation(id) {
  const database = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(OUTBOX_STORE, "readwrite");
    transaction.objectStore(OUTBOX_STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}