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
    collectionArgs: { [key:string]: any },
    selectionSet: GraphQLSelectionSet
): Promise<FiregraphCollectionResult> {
    let collectionQuery: any = store.collection(collectionName);
    let collectionResult: FiregraphCollectionResult = {
        name: collectionName,
        docs: []
    };
    if (collectionArgs) {
        if (collectionArgs['where']) {
            const where = collectionArgs['where'];
            where.forEach((filter: any) => {
                collectionQuery = collectionQuery.where(
                    filter['key'], '==', filter['value']
                );
            });
        }
    }
    
    const collectionSnapshot = await collectionQuery.get();
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