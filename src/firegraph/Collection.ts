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
        const fieldsToRetrieve = selectionSet.selections;
        for (let doc of collectionSnapshot.docs) {
            const data = doc.data()!;
            const docResult: any = {};
            for (let field of fieldsToRetrieve) {
                let args: any = {};
                for (let arg of field.arguments!) {
                    args[(arg as any).name.value] = (arg as any).value.value
                }
                const fieldName = (field as any).name.value;
                const { selectionSet } = field;

                // Here we handle document references and nested collections.
                // First, we need to determine which one we are dealing with.
                if (selectionSet && selectionSet.selections) {
                    let nestedPath: string;
                    if (args.fromCollection) {
                        const target = args.fromCollection;
                        const docId = data[fieldName];
                        nestedPath = `${target}/${docId}`;
                        const nestedResult = await resolveDocument(
                            store,
                            nestedPath,
                            selectionSet
                        );
                        docResult[fieldName] = nestedResult;
                    } else {
                        nestedPath = `${collectionName}/${doc.id}/${fieldName}`;
                        const nestedResult = await resolveCollection(
                            store,
                            nestedPath,
                            selectionSet
                        );
                        docResult[fieldName] = nestedResult.docs;
                    }
                } else {
                    if (fieldName === 'id') {
                        docResult[fieldName] = doc.id;
                    } else {
                        docResult[fieldName] = data[fieldName];
                    }
                }
            }
            collectionResult.docs.push(docResult);
        }
    }
    return collectionResult;
}