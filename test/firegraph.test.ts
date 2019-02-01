import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from './firebase';

describe('firegraph', () => {
    it('should be able to retrieve a collection', async () => {
        const { posts } = await firegraph.resolve(firestore, gql`
            query {
                posts {
                    id
                    message
                }
            }
        `);

        expect(posts).toHaveLength(1);
        posts.map((post: any) => {
            expect(post).toHaveProperty('id');
            expect(post).toHaveProperty('message');
        });
    });

    it('should be able to retrieve nested collections', async () => {
        const { posts } = await firegraph.resolve(firestore, gql`
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
        `);

        posts.forEach((post: any) => {
            expect(post).toHaveProperty('comments');

            const { comments } = post;
            comments.forEach((comment: any) => {
                expect(comment).toHaveProperty('id');
                expect(comment).toHaveProperty('message');
            });
        });
    });

    it('should be able to resolve document references', async () => {
        const { posts } = await firegraph.resolve(firestore, gql`
            query {
                posts {
                    id
                    message
                    author(fromCollection: "users") {
                        id
                        fullName
                        favoriteColor
                    }
                }
            }
        `);

        posts.forEach((post: any) => {
            expect(post).toHaveProperty('author');

            const { author } = post;
            expect(author).toHaveProperty('id');
            expect(author).toHaveProperty('fullName');
            expect(author).toHaveProperty('favoriteColor');
        });
    });
});