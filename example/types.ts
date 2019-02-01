import firegraph from '../src';
import { firestore } from '../firebase';
import gql from 'graphql-tag';

const userQuery = gql`
    query {
        users {
            id
            hometown
            fullName
            birthdate
            favoriteColor
            posts {
                id
                message
            }
        }
    }
`;

firegraph.resolve(firestore, userQuery).then(collections => {
    for (let user of collections.users) {
        console.log(user);
    }
});