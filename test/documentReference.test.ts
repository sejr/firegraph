import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from './firebase';

describe('firegraph', () => {
  describe('document references', () => {
    it('should be able to resolve document reference', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts {
              id
              message
              author {
                id
                fullName
                favoriteColor
              }
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('author');

        const { author } = post;
        expect(author).toHaveProperty('id');
        expect(author).toHaveProperty('fullName');
        expect(author).toHaveProperty('favoriteColor');
      });
    });

    it('should be able to resolve raw document reference type and parent path', async () => {
      const { posts } = await firegraph.resolve(
        firestore,
        gql`
          query {
            posts {
              id
              message
              comments {
                id
                authorId(path: "users/") {
                  id
                  fullName
                  favoriteColor
                }
              }
            }
          }
        `
      );

      posts.forEach((post: any) => {
        expect(post).toHaveProperty('comments');

        const { comments } = post;

        comments.forEach((comment: any) => {
          expect(comment).toHaveProperty('authorId');

          const { authorId } = comment;
          expect(authorId).toHaveProperty('id');
        });
      });
    });
  });
});
