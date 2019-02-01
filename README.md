<p align="center">
    <img src="./assets/brand.svg" width="200px"/>
</p>
<h3 align="center">GraphQL Superpowers for Google Cloud Firestore</h3>

> This is **not** an official Google product, nor is it maintained or supported by Google employees. For support with Firebase or Firestore, please [click here](https://firebase.google.com/support/).

___

## Introduction

[Cloud Firestore](https://cloud.google.com/firestore/docs/) is a NoSQL document database built for automatic scaling, high performance, and ease of application development. While the Cloud Firestore interface has many of the same features as traditional databases, as a NoSQL database it differs from them in the way it describes relationships between data objects. It is a part of the Google Cloud platform, and a spiritual successor to the Firebase Real-Time Database.

Firestore makes it easy to securely store and retrieve data, and already has a powerful API for querying data. **Firegraph** builds on that awesome foundation by making it even easier to retrieve data across collections, subcollections, and document references.

## Getting Started

Getting started with Firegraph is very easy! No need to write or host your own GraphQL server, either.

### Installing

``` bash
# npm
npm install --save graphql graphql-tag firegraph

# Yarn
yarn add graphql graphql-tag firegraph
```

### Usage

Right now, `firegraph` has somewhat limited functionality but it can still be very useful when you want a quick way to retrieve values for various collections with arbitrary levels of nesting.

``` typescript
import gql from 'graphql-tag';
import firegraph from 'firegraph';
import { firestore } from '../path/to/my/firebase';

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

firegraph.resolve(firestore, userQuery).then(result => {
    for (let user of users) {
        console.log(user);
    }
});
```

The console log in that for loop at the end would produce something like:

``` typescript
{
    id: 'sZOgUC33ijsGSzX17ybT',
    hometown: GeoPoint { _lat: 40.141832766, _long: -84.242165698 },
    fullName: { family: 'Doe', given: 'John', middle: null },
    birthdate: Timestamp { seconds: 747763200, nanoseconds: 0 },
    favoriteColor: 'blue',
    posts: [
        {
            id: 'i4CWhNXr8qPqaG3KLrZk',
            message: 'Hello world!'
        }
    ]
}
```
