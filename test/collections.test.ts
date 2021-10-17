import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from './firebase';

describe('firegraph', () => {
  it('should be able to retrieve a collection', async () => {
    const { posts } = await firegraph.resolve(
      firestore,
      gql`
        query {
          posts {
            id
            message
          }
        }
      `
    );

    posts.map((post: any) => {
      expect(post).toHaveProperty('id');
      expect(post).toHaveProperty('message');
    });
  });

  it('should be able to retrieve nested collections', async () => {
    const { posts } = await firegraph.resolve(
      firestore,
      gql`
        query {
          posts {
            id
            message
            comments {
              id
              message
            }
          }
        }
      `
    );

    posts.forEach((post: any) => {
      expect(post).toHaveProperty('comments');

      const { comments } = post;
      comments.forEach((comment: any) => {
        expect(comment).toHaveProperty('id');
        expect(comment).toHaveProperty('message');
      });
    });
  });
});
