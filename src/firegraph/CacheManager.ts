export interface CacheManagerListener {
  onCacheHit: (path: string) => void;
  onCacheMiss: (path: string) => void;
  onCacheRequested: (path: string) => void;
  onCacheSaved: (path: string) => void;
}

export class CacheManager {
  private cache = Object.create(null);
  private static listeners: CacheManagerListener[] = [];

  public getDocument(
    path: string
  ): firebase.default.firestore.DocumentSnapshot | undefined {
    const doc: firebase.default.firestore.DocumentSnapshot = this.cache[path];

    // Call listeners
    CacheManager.listeners.forEach((listener) =>
      listener.onCacheRequested(path)
    );
    if (doc == undefined) {
      CacheManager.listeners.forEach((listener) => listener.onCacheMiss(path));
    } else {
      CacheManager.listeners.forEach((listener) => listener.onCacheHit(path));
    }

    return doc;
  }

  public saveDocument(
    path: string,
    document: firebase.default.firestore.DocumentSnapshot
  ) {
    this.cache[path] = document;
    CacheManager.listeners.forEach((listener) => listener.onCacheSaved(path));
  }

  public static addListener(listener: CacheManagerListener) {
    CacheManager.listeners.push(listener);
  }

  public static removeListener(listener: CacheManagerListener) {
    const index = CacheManager.listeners.indexOf(listener);
    CacheManager.listeners.splice(index, 1);
  }

  public static removeAllListeners() {
    CacheManager.listeners = [];
  }
}
