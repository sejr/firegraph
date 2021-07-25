import gql from 'graphql-tag';
import firegraph from '../src';
import { CacheManager } from '../src/firegraph/CacheManager';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('order', () => {
    it('Should order root collection documents', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(orderBy: { message: "desc" }) {
              id
              message
            }
          }
        `
      );

      let messages: string[] = [];
      let messagesSorted: string[] = [];
      posts.forEach((post: any) => {
        expect(post).toHaveProperty('message');
        messages.push(post.message);
      });

      // copy & sort the messages
      messagesSorted = messages.splice(0);
      messagesSorted = messagesSorted.sort().reverse();

      // test for messages field order
      if (messages.length > 1) {
        for (let i = 1; i < messages.length; i++) {
          expect(messages[i]).toEqual(messagesSorted[i]);
        }
      }
    });

    it('Should order collection documents by multiple fields', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts(orderBy: { category: "desc", score: "asc" }) {
              id
              category
              score
            }
          }
        `
      );

      let categories: string[] = [];
      let categoriesSorted: string[] = [];
      let postScores = new Map();

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('category');
        expect(post).toHaveProperty('score');

        const category: string = post.category;
        const score: number = post.score;

        categories.push(category);

        if (postScores.has(category)) {
          const nums: number[] = postScores.get(category);
          nums.push(score);
          postScores.set(category, nums);
        } else {
          const nums: number[] = [];
          nums.push(score);
          postScores.set(category, nums);
        }
      });

      // copy & sort the messages
      categoriesSorted = categories.splice(0);
      categoriesSorted = categoriesSorted.sort().reverse();

      // test for messages field order
      if (categories.length > 1) {
        for (let i = 1; i < categories.length; i++) {
          expect(categories[i]).toEqual(categoriesSorted[i]);
        }
      }

      // Test for score field sort
      postScores.forEach((value: number[], key: string) => {
        if (value.length > 1) {
          for (let i = 1; i < value.length; i++) {
            expect(value[i]).toBeGreaterThanOrEqual(value[i - 1]);
          }
        }
      });
    });
  });
});
