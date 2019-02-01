import gql from 'graphql-tag';
import { firestore } from '../firebase';
import firegraph from '../src';

describe('firegraph', () => {
    it('can retrieve data from a collection', async () => {
        const usersQuery = gql`
            query {
                users {
                    id
                    fullName
                    favoriteColor
                }
            }
        `;
        const result = await firegraph.resolve(firestore, usersQuery);
        expect(result).not.toBeNull();
    });
});