import gql from 'graphql-tag';
import firegraph from '../src';
import { firestore } from '../test/firebase';

const whereQuery = gql`
    query {
        posts(where: {
            id: "x"
        }) {
            id
            message
        }
    }
`;

console.log(whereQuery);