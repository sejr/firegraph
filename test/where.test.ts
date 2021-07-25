import gql from 'graphql-tag';
import firegraph from '../src';
import { CacheManager } from '../src/firegraph/CacheManager';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('where', () => {
    it('can filter with key-value equality', async () => {
      const authorId = 'U7prtqicwDUSKgasXXNv';
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
                query {
                    posts(where: {
                        author: ${authorId},
                    }) {
                        id
                        message
                        author{
                            id
                        }
                    }
                }
            `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('author');
        expect(post.author).toHaveProperty('id');
        expect(post.author.id).toEqual('U7prtqicwDUSKgasXXNv');
      });
    });

    it('can filter with `_gt` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_gt: 6 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeGreaterThan(6);
      });
    });

    it('can filter with `_gte` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_gte: 6 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeGreaterThanOrEqual(6);
      });
    });

    it('can filter with `_lt` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_lt: 14 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeLessThan(14);
      });
    });

    it('can filter with `_lte` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_lte: 14 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeLessThanOrEqual(14);
      });
    });

    it('can detect array membership with `_contains`', async () => {
      const someUserId = 'U7prtqicwDUSKgasXXNv';
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: {
              likes_contains: ${someUserId},
            }) {
              id
              score
              likes
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('likes');
        expect(post.likes).toContain(someUserId);
      });
    });
  });
});
