import gql from 'graphql-tag';
import firegraph from '../src';
import { CacheManager } from '../src/firegraph/CacheManager';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('limit', () => {
    it('Should be able to limit root collection query length', async () => {
      const limit = 1;
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
            query {
                posts(limit:${limit}) {
                    id
                }
            }
        `
      );

      expect(posts.length).toBeLessThanOrEqual(limit);
    });

    it('should be able to limit nested collection query length', async () => {
      const root_limit = 1;
      const sub_limit = 1;
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(limit:${root_limit}){
              id
              comments(limit:${sub_limit}){
                id
              }
            }
          }
        `
      );

      expect(posts.length).toBeLessThanOrEqual(root_limit);

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('comments');
        expect(post.comments.length).toBeLessThanOrEqual(sub_limit);
      });
    });
  });
});
