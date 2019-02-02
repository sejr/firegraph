import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from '../test/firebase';

const postsQuery = gql`
    query {
        posts {
            id
            message
            author(matchesKeyFromCollection: "users") {
                id
                fullName
            }
            comments {
                id
                message
                author(matchesKeyFromCollection: "users") {
                    id
                    fullName
                }
            }
        }
    }
`;

firegraph.resolve(firestore, postsQuery).then(collections => {
    console.log(JSON.stringify(collections, null, 4));
});