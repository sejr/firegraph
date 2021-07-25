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
        onCacheMiss: (path: string) => {},
        onCacheSaved: (path: string) => {},
        onCacheRequested: (path: string) => {},
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
                fullName
              }
            }
            users {
              id
              fullName
            }
          }
        `
      );

      // Mathematically number of author document read overlaps
      // should be equal to number of posts
      expect(hits).toEqual(posts.length);
      CacheManager.removeListener(listener);
    });

    it('should be able to use alias for collection names and document field names', async () => {
      const result = await firegraph.resolve(
        firestore,
        gql`
          query {
            postsAlias1: posts(limit: 1) {
              id
              body: message
            }
            postsAlias2: posts(limit: 1) {
              id
            }
          }
        `
      );

      // Check root collections
      expect(result).toHaveProperty('postsAlias1');
      expect(result).toHaveProperty('postsAlias2');

      // Check field names
      const { postsAlias1 } = result;
      postsAlias1.forEach((post: any) => {
        expect(post).toHaveProperty('body');
      });
    });
  });
});
