import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('alias', () => {
    it('Should be able to use alias for collection names and document field names', async () => {
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
