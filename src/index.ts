import firebase from 'firebase/app';
import 'firebase/firestore';

// Top-level imports related to Firegraph.
import { parseObjectValue } from './firegraph/Where';
import { resolveCollection } from './firegraph/Collection';
import { FiregraphResult } from './types/Firegraph';

/**
 * Runs a GraphQL query against a Google Cloud Firestore instance.
 * @param firestore An initialized Firestore instance.
 * @param query GraphQL query to be run against the Firestore. Use `graphql-tag`
 *        to parse your query, otherwise this will not work.
 */
async function resolve(
    firestore: firebase.firestore.Firestore,
    query: any
): Promise<FiregraphResult> {
    const results: FiregraphResult = {};
    const { definitions } = query;

    for (let definition of definitions) {
        const { selectionSet } = definition;

        // Because we know that the root-level values in a query are collection
        // names, we can define them as collections to be targeted.
        const targetCollections = selectionSet.selections;

        // For each collection we have defined in our query, we want to fetch
        // its name and run the query for the requested values.
        for (let collection of targetCollections) {
            const {
                name: { value: collectionName },
                selectionSet,
                arguments: collectionArguments,
            } = collection;

            // Parse the GraphQL argument AST into something we can use.
            const parsedArgs: any = {};
            collectionArguments.forEach((arg: any) => {
                if (arg.value.kind === 'ObjectValue') {
                    const { fields } = arg.value;
                    parsedArgs[arg.name.value] = parseObjectValue(fields);
                }else{
                    parsedArgs[arg.name.value] = arg.value.value;
                }
            });

            // Now we begin to recursively fetch values defined in GraphQL
            // selection sets. We pass our `firestore` instance to ensure
            // all selections are done from the same database.
            const result = await resolveCollection(
                firestore,
                collectionName,
                parsedArgs,
                selectionSet
            );

            // Push the root query result to our results list.
            results[result.name] = result.docs;
        }
    }

    // All necessary queries have been executed.
    return results;
}

export default {
    resolve
};