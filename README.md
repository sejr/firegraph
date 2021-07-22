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

---

# Introduction

[Cloud Firestore](https://cloud.google.com/firestore/docs/) is a NoSQL document database built for automatic scaling, high performance, and ease of application development. While the Cloud Firestore interface has many of the same features as traditional databases, as a NoSQL database it differs from them in the way it describes relationships between data objects. It is a part of the Google Cloud platform, and a spiritual successor to the Firebase Real-Time Database.

Firestore makes it easy to securely store and retrieve data, and already has a powerful API for querying data. **Firegraph** builds on that awesome foundation by making it even easier to retrieve data across collections, subcollections, and document references.

## Primary Goals

- **Wrap the Firestore SDK in its entirety.** This means that, in time, we hope to support features like real-time updates, caching, index management, and other APIs available through Firestore's SDK.
- **Leverage features of GraphQL query syntax.** When creating this library, I initially planned to create a "GraphQL-esque" query language specifically for Firestore. I have since decided that is the wrong way to go, and opted to ensure that all Firegraph queries are valid GraphQL. This should make it easier if you decide to roll your own GraphQL backend at some point.
- **Operate as a lightweight wrapper.** As we move toward supporting all Firestore APIs, the goal is to also introduce support for some common (but not directly supported) Firestore use cases. That said, Firegraph should retain a small footprint and avoid depending on other NPM modules as much as possible.

# Getting Started

Getting started with Firegraph is very easy! **You do not need to host a GraphQL server to use Firegraph.** However, your project does require some GraphQL-related dependencies.

## Installing

```bash
# npm
npm install --save graphql graphql-tag firegraph

# Yarn
yarn add graphql graphql-tag firegraph
```

## Queries

You can either write queries inside your JavaScript files with `gql`, or if you use webpack, you can use `graphql-tag/loader` to import GraphQL query files (`*.graphql`) directly.

### Collections

Every top-level name in a `query` is considered a Firestore collection. For
example, in the query below, we are querying every document in the `posts`
collection and retrieving the `id`, `title`, and `body` values from each
document in the response. Note: `id` is a special field that actually retrieves
the document key.

```typescript
const { posts } = await firegraph.resolve(
  firestore,
  gql`
    query {
      posts {
        id
        title
        body
      }
    }
  `
);
```

### Subcollections

When you have nested values (e.g. in the query below), they are processed
as child collections. To clarify, for each `doc` in the `posts` collection,
we also retrieve the `posts/${doc.id}/comments` collection. This result is
stored in the `comments` key for each document that is returned.

```typescript
const { posts: postsWithComments } = await firegraph.resolve(
  firestore,
  gql`
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
  `
);
```

### Document References

If `post.author` is a `DocumentReference` field, it is considered as a complete path to the document from the root of the database.

If `post.author` is a `String` type of field, it is also considered as a complete path to document. However, you can optionally provide a parent path to the document collection using the `path` argument. Note that path argument must end in a `"/"` to be valid.

```typescript
const { posts: postsWithAuthorAndComments } = await firegraph.resolve(
  firestore,
  gql`
    query {
      posts {
        id
        title
        body

        # Here author is either a DocumentReference type of field
        # or is a String field with complete path to the document
        author {
          id
          displayName
        }

        comments {
          id
          body

          # Here author's id is only saved in the field,
          # hence parent path to document is provided
          authorId(path: "users/") {
            id
            displayName
          }
        }
      }
    }
  `
);
```

### Filtering Results

One of our primary goals is to wrap the Firestore API in its entirety. That said, the `where`
clause in Firegraph maps directly to the expected behavior in Firestore:

- `someKey: someValue` maps to `.where(someKey, '==', someValue)`
- `someKey_gt: someValue` maps to `.where(someKey, '>', someValue)`
- `someKey_gte: someValue` maps to `.where(someKey, '>=', someValue)`
- `someKey_lt: someValue` maps to `.where(someKey, '<', someValue)`
- `someKey_lte: someValue` maps to `.where(someKey, '>=', someValue)`
- `someKey_contains: someValue` maps to `.where(someKey, 'array-contains', someValue)`

For the last one, of course, `someKey` would have to use Firestore's array type. All of the restrictions
related to compound queries with Firestore (no logical OR or inequality testing) still apply but those
are some of the first things we are hoping to add support for.

```typescript
const authorId = 'sZOgUC33ijsGSzX17ybT';
const { posts: postsBySomeAuthor } = await firegraph.resolve(
  firestore,
  gql`
    query {
        posts(where: {
            author: ${authorId},
        }) {
            id
            message
            author {
                id
                displayName
            }
        }
    }
`
);
```

### Ordering Results

The result of sub/collections can be ordered by using the `orderBy` clause, with providing an object containing fields and their order type of either `asc`ending or `desc`ending

```typescript
const { posts } = await firegraph.resolve(
  firestore,
  gql`
    query {
      posts(orderBy: { createdOn: "desc", title: "asc" }) {
        id
        title
        createdOn
        body
      }
    }
  `
);
```

**NOTE:** The `indexes` for ordering fields _must be created beforehand_ in firebase console, and those fields _should be part of the query_.

### Limiting Results

To limit the loading of documents to a certain number in a sub/collection query, `limit` argument can be supplied to the query.

```typescript
const { posts } = await firegraph.resolve(
  firestore,
  gql`
    query {
      posts(limit: 10) {
        id
        title
        body
        comments(limit: 10) {
          id
          message
        }
      }
    }
  `
);
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

To submit a new feature, you should follow these steps:

1. Clone the repository and write tests that describe how your new feature is used and the results you would expect.
2. Implement the appropriate changes to our code base. The `test` directory includes a Firestore instance that is ready to go; just provide your Firebase app config as environment variables.
3. Submit a PR once you've implemented changes and ensured that your new tests pass without causing problems with other tests.
