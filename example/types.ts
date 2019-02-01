import gql from 'graphql-tag';
import firegraph from 'firegraph';
import { firestore } from '../firebase';

const userQuery = gql`
    query {
        users {
            id
            hometown
            fullName
            birthdate
            favoriteColor,
            posts {
                id
                message
            }
        }
    }
`;

firegraph.resolve(firestore, userQuery).then(collections => {
    console.log(JSON.stringify(collections, null, 4));
});