<p align="center">
    <img src="https://raw.githubusercontent.com/sejr/firegraph/master/assets/logo.png" width="200px"/>
</p>
<h3 align="center">GraphQL Superpowers for Google Cloud Firestore</h3>

<p align="center">
    <a href="https://badge.fury.io/js/firegraph">
        <img src="https://badge.fury.io/js/firegraph.svg" alt="npm version" />
    </a>
    <a href="https://travis-ci.org/sejr/firegraph">
        <img src="https://travis-ci.org/sejr/firegraph.svg?branch=master" alt="travis build" />
    </a>
</p>

> This is **not** an official Google product, nor is it maintained or supported by Google employees. For support with Firebase or Firestore, please [click here](https://firebase.google.com/support/).

___

# Introduction

[Cloud Firestore](https://cloud.google.com/firestore/docs/) is a NoSQL document database built for automatic scaling, high performance, and ease of application development. While the Cloud Firestore interface has many of the same features as traditional databases, as a NoSQL database it differs from them in the way it describes relationships between data objects. It is a part of the Google Cloud platform, and a spiritual successor to the Firebase Real-Time Database.

Firestore makes it easy to securely store and retrieve data, and already has a powerful API for querying data. **Firegraph** builds on that awesome foundation by making it even easier to retrieve data across collections, subcollections, and document references.

# Getting Started

Getting started with Firegraph is very easy! No need to write or host your own GraphQL server, either.

## Installing

``` bash
# npm
npm install --save graphql graphql-tag firegraph

# Yarn
yarn add graphql graphql-tag firegraph
```

## Usage

**You do not need to host a GraphQL server to use Firegraph.** Your project does require the above dependencies (`firegraph`, `graphql`, and `graphql-tag`), however. You can either write queries inside your JavaScript files with `gql`, or if you use webpack, you can use `graphql-tag/loader` to import GraphQL query files (`*.graphql`) directly.

### Retrieving a Collection

Every top-level name in a `query` is considered a Firestore collection. For
example, in the query below, we are querying every document in the `posts`
collection and retrieving the `id`, `title`, and `body` values from each
document in the response. Note: `id` is a special field that actually retrieves
the document key.

``` typescript
const { posts } = await firegraph.resolve(firestore, gql`
    query {
        posts {
            id
            title
            body
        }
    }
`)
```

### Retrieving Nested Collections

When you have nested values (e.g. in the query below), they are processed
as child collections. To clarify, for each `doc` in the `posts` collection,
we also retrieve the `posts/${doc.id}/comments` collection. This result is
stored in the `comments` key for each document that is returned.

``` typescript
const { posts: postsWithComments } = await firegraph.resolve(firestore, gql`
    query {
        posts {
            id
            title
            body
            comments {
                id
                body
            }
        }
    }
`)
```

### Retrieving Collections with References

Right now, we are assuming that `post.author` is a string that matches the ID of some document in the `users` collection. In the future we will leverage Firestore's `DocumentReference` value type to handle both use cases.

``` typescript
const { posts: postsWithAuthorAndComments } = await firegraph.resolve(firestore, gql`
    query {
        posts {
            id
            title
            body
            author(matchesKeyFromCollection: "users") {
                id
                displayName
            }
            comments {
                id
                body
                author(matchesKeyFromCollection: "users") {
                    id
                    displayName
                }
            }
        }
    }
`)
```

### Filtering Results

One of our primary goals is to wrap the Firestore API in its entirety. Filtering
is one of the areas where GraphQL query syntax will really shine:

``` typescript
const authorId = 'sZOgUC33ijsGSzX17ybT';
const { posts: postsBySomeAuthor } = await firegraph.resolve(firestore, gql`
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
```


# Roadmap

- [x] Querying values from collections
- [x] Querying nested collections
- [ ] GraphQL mutations allowing updates to multiple documents at once
- [ ] Basic search functionality (on par with current Firestore API)
- [ ] More advanced search functionality (GraphQL params, fragments, etc)

# Contributing

Thank you for your interest! You are welcome (and encouraged) to submit Issues and Pull Requests. If you want to add features, check out the roadmap above (which will have more information as time passes). You are welcome to ping me on Twitter as well: [@sjroot](https://twitter.com/sjroot)

## New Features

I am utilizing test-driven development with this repository, because it is extremely easy to describe new features before they are implemented. That said, any feature you want to add must come with appropriate tests. The tests have to pass before any changes will be merged into the master branch.
