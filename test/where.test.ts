import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('where', () => {
    it('can filter with key-value equality', async () => {
      const authorId = 'Beeb3V4VvUdY79imRS1f';
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
                query {
                    posts(where: {
                        authorId: ${authorId},
                    }) {
                        id
                        authorId
                        message
                    }
                }
            `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('authorId');
        expect(post.authorId).toEqual('Beeb3V4VvUdY79imRS1f');
      });
    });

    it('can filter with `_gt` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_gt: 25 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeGreaterThan(25);
      });
    });

    it('can filter with `_gte` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_gte: 25 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeGreaterThanOrEqual(25);
      });
    });

    it('can filter with `_lt` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_lt: 25 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeLessThan(25);
      });
    });

    it('can filter with `_lte` operator', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(where: { score_lte: 25 }) {
              id
              score
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('score');
        expect(post.score).toBeLessThanOrEqual(25);
      });
    });

    it('can detect array membership with `_contains`', async () => {
      const someUserId = 'PBQ4JosAROuqa3YgQrBR';
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


    it('can detect array membership with `_containsAny`', async () => {
      var sample_list = ['dancing', 'sketching'];

      const { users } = await firegraph.resolve(
        firestore,
        gql`
          query {
            users(where: { hobbies_containsAny: ${JSON.stringify(
          sample_list
        )} }) {
              id
              fullname
              hobbies
            }
          }
        `
      );

      users.forEach((user: any) => {
        expect(user).toHaveProperty('hobbies');

        var hasAny: boolean = false;
        sample_list.forEach((e) => {
          hasAny = hasAny || (user.hobbies as String[]).includes(e);
        });
        expect(hasAny).toBeTruthy();
      });
    });

    it('can filter documents with `_in`', async () => {
      var sample_list = ['blue', 'green'];

      const { users } = await firegraph.resolve(
        firestore,
        gql`
        query {
          users(where: { favouriteColor_in: ${JSON.stringify(sample_list)} }) {
            id
            favouriteColor
          }
        }
      `
      );

      users.forEach((user: any) => {
        expect(user).toHaveProperty('favouriteColor');
        expect(sample_list.includes(user.favouriteColor)).toBeTruthy();
      });
    });

    it('can filter documents with `_notIn`', async () => {
      var sample_list = ['red', 'green'];

      const { users } = await firegraph.resolve(
        firestore,
        gql`
        query {
          users(where: { favouriteColor_notIn: ${JSON.stringify(sample_list)} }) {
            id
            favouriteColor
          }
        }
      `
      );

      users.forEach((user: any) => {
        expect(user).toHaveProperty('favouriteColor');
        expect(sample_list.includes(user.favouriteColor)).toBeFalsy();
      });
    });
  });
});
