import gql from 'graphql-tag';
import firegraph from '../src';
import { CacheManager } from '../src/firegraph/CacheManager';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('cache', () => {
    it('should be able to use cached documents', async () => {
      let hits = 0;
      const listener = {
        onCacheHit: (path: string) => {
          hits++;
        },
        onCacheMiss: (path: string) => { },
        onCacheSaved: (path: string) => {},
        onCacheRequested: (path: string) => { },
      };

      CacheManager.addListener(listener);

      // Only author documents will overlap with users docs... so total 2 cache hits
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(limit: 2) {
              id
              message
              author {
                id
                fullname
              }
            }
            users {
              id
              fullname
            }
          }
        `
      );

      // Mathematically number of author document read overlaps
      // should be equal to number of posts
      expect(hits).toEqual(posts.length);
      CacheManager.removeListener(listener);
    });

  });
});
