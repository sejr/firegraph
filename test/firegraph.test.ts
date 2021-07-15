import gql from 'graphql-tag';
import firegraph from '../src';
import {firestore} from './firebase';

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

    describe('DOCUMENT REFERENCES', ()=>{
        it('should be able to resolve document reference', async () => {
        const { posts } = await firegraph.resolve(firestore, gql`
            query {
                posts {
                    id
                    message
                    author{
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

        it('should be able to resolve raw document reference type and parent path', async () => {
          const { posts } = await firegraph.resolve(firestore, gql`
              query {
                  posts {
                      id
                      message
                      comments{
                        id
                        authorId(path:"users/"){   
                          id
                          fullName
                          favoriteColor
                        }
                      }
                  }
              }
          `);
  
          posts.forEach((post: any) => {
              expect(post).toHaveProperty('comments');

              const {comments} = post;

              comments.forEach((comment:any) => {

                expect(comment).toHaveProperty('authorId');

                const {authorId} = comment;
                expect(authorId).toHaveProperty("id");
              });
          });
        });
    });

    describe('WHERE', () => {
        it('can filter with key-value equality', async () => {
            const authorId = 'U7prtqicwDUSKgasXXNv';
            const { posts } = await firegraph.resolve(firestore, gql`
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
            `);
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('author');
                expect(post.author).toHaveProperty('id');
                expect(post.author.id).toEqual('U7prtqicwDUSKgasXXNv');
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

            posts.forEach((post: any) => {
                expect(post).toHaveProperty('score');
                expect(post.score).toBeGreaterThan(6);
            });
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
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('score');
                expect(post.score).toBeGreaterThanOrEqual(6);
            });
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
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('score');
                expect(post.score).toBeLessThan(14);
            });
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
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('score');
                expect(post.score).toBeLessThanOrEqual(14);
            });
        });

        it('can detect array membership with `_contains`', async () => {
            const someUserId = 'U7prtqicwDUSKgasXXNv';
            const { posts } = await firegraph.resolve(firestore, gql`
                query {
                    posts(where: {
                        likes_contains: ${someUserId},
                    }) {
                        id
                        score
                        likes
                    }
                }
            `);
    
            posts.forEach((post: any) => {
                expect(post).toHaveProperty('likes');
                expect(post.likes).toContain(someUserId);
            });
        });
    });

    describe('LIMIT', () => {
      it('Should be able to limit root collection query length', async () => {
        const limit = 1;
        const { posts } = await firegraph.resolve(firestore, gql`
            query {
                posts(limit:${limit}) {
                    id
                }
            }
        `);
  
        expect(posts.length).toBeLessThanOrEqual(limit);
      });
  
      it('Should be able to limit nested collection query length', async () => {
        const root_limit = 1;
        const sub_limit = 1;
        const { posts } = await firegraph.resolve(firestore, gql`
            query {
                posts(limit:${root_limit}){
                    id
                    comments(limit:${sub_limit}){
                      id
                    }
                }
            }
        `);
  
        expect(posts.length).toBeLessThanOrEqual(root_limit);

        posts.forEach((post: any) => {
          expect(post).toHaveProperty('comments');
          expect(post.comments.length).toBeLessThanOrEqual(sub_limit);
        });
      });
    });
});