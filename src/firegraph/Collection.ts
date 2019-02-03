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
                const key: string = filter['key'];
                const value: string = filter['value'];
                const splitKey: string[] = key.split('_');
                const whereOp = splitKey[splitKey.length - 1];
                switch (whereOp) {
                    case 'neq':
                        collectionQuery = collectionQuery
                            .where(key, '>', value)
                            .where(key, '<', value);
                        break;
                    case 'gt':
                        collectionQuery = collectionQuery
                            .where(key, '>', value);
                        break;
                    case 'gte':
                        collectionQuery = collectionQuery
                            .where(key, '>', value)
                            .where(key, '==', value);
                        break;
                    case 'lt':
                        collectionQuery = collectionQuery
                            .where(key, '<', value);
                        break;
                    case 'lte':
                        collectionQuery = collectionQuery
                            .where(key, '<', value)
                            .where(key, '==', value);
                        break;
                    default: 
                        collectionQuery = collectionQuery
                            .where(key, '==', value);
                        break;
                }
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