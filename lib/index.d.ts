import firebase from 'firebase/app';
import 'firebase/firestore';
import { FiregraphResult } from './types/Firegraph';
/**
 * Runs a GraphQL query against a Google Cloud Firestore instance.
 * @param firestore An initialized Firestore instance.
 * @param query GraphQL query to be run against the Firestore. Use `graphql-tag`
 *        to parse your query, otherwise this will not work.
 */
declare function resolve(firestore: firebase.firestore.Firestore, query: any): Promise<FiregraphResult>;
declare const _default: {
    resolve: typeof resolve;
};
export default _default;
