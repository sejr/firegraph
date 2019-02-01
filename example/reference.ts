import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from '../firebase';

const postsQuery = gql`
    query {
        posts {
            id
            message
            author(fromCollection: "users") {
                id
                fullName
            }
        }
    }
`;

firegraph.resolve(firestore, postsQuery).then(collections => {
    for (let post of collections.posts) {
        console.log(post);
    }
});