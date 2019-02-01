# Firegraph

> GraphQL superpowers for Google Cloud Firestore

``` typescript
import gql from 'graphql-tag';
import firegraph from 'firegraph';
import { firestore } from '../path/to/my/firebase';

const userQuery = gql`
    query {
        users {
            id                  // document id
            hometown            // geopoint
            fullName            // map
            birthdate           // timestamp
            favoriteColor       // string
            posts {             // nested collection
                id
                message
            }
        }
    }
`;

firegraph.resolve(firestore, userQuery).then(result => {
    for (let user of users) {
        console.log(user);
    }
});
```
