import { GraphQLSelectionSet } from '../types/GraphQL';
import { FiregraphCollectionResult } from '../types/Firegraph';
import { resolveDocument } from './Document';

/**
 * Retrieves documents from a specified collection path. Currently retrieves
 * all fields indicated in the GraphQL selection set. Eventually this will
 * allow users to conduct queries with GraphQL syntax.
 * @param store An initialized Firestore instance.
 * @param collectionName The path of the collection we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
export async function resolveCollection(
    store: firebase.firestore.Firestore,
    collectionName: string,
    selectionSet: GraphQLSelectionSet
): Promise<FiregraphCollectionResult> {
    let collectionResult: FiregraphCollectionResult = {
        name: collectionName,
        docs: []
    };
    const collectionSnapshot = await store.collection(collectionName).get();
    if (selectionSet && selectionSet.selections) {
        for (let doc of collectionSnapshot.docs) {
            const documentPath = `${collectionName}/${doc.id}`;
            collectionResult.docs.push(await resolveDocument(
                store,
                documentPath,
                selectionSet
            ));
        }
    }
    return collectionResult;
}