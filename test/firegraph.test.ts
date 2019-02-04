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
                    author(matchesKeyFromCollection: "users") {
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

    describe('WHERE', () => {
        it('can filter with key-value equality', async () => {
            const authorId = 'sZOgUC33ijsGSzX17ybT';
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        author: ${authorId},
                    }) {
                        id
                        message
                        author(matchesKeyFromCollection: "users") {
                            id
                        }
                    }
                }
            `);
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('author');
                expect(post.author).toHaveProperty('id');
                expect(post.author.id).toEqual('sZOgUC33ijsGSzX17ybT');
            });
        });
        it('can filter with `_gt` operator', async () => {
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        score_gt: 6,
                    }) {
                        id
                        score
                    }
                }
            `);

            expect(posts).toHaveLength(1);
        });

        it('can filter with `_gte` operator', async () => {
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        score_gte: 6,
                    }) {
                        id
                        score
                    }
                }
            `);
    
            expect(posts).toHaveLength(2);
        });

        it('can filter with `_lt` operator', async () => {
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        score_lt: 14,
                    }) {
                        id
                        score
                    }
                }
            `);
    
            expect(posts).toHaveLength(1);
        });

        it('can filter with `_lte` operator', async () => {
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        score_lte: 14,
                    }) {
                        id
                        score
                    }
                }
            `);
    
            expect(posts).toHaveLength(2);
        });

        it('can detect array membership with `_contains`', async () => {
            const someUserId = 'sZOgUC33ijsGSzX17ybT';
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        likes_contains: ${someUserId},
                    }) {
                        id
                        score
                    }
                }
            `);
    
            expect(posts).toHaveLength(1);
        });
    });
});