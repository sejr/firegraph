import { GraphQLSelectionSet } from '../types/GraphQL';
import { FiregraphResult } from '../types/Firegraph';
import { resolveCollection } from './Collection';

/**
 * Retrieves a single document from a specified document path. Retrieves
 * all fields indicated in the GraphQL selection set, including any nested
 * collections or references that are defined.
 * @param store An initialized Firestore instance.
 * @param documentPath The path of the document we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
export async function resolveDocument(
    store: firebase.firestore.Firestore,
    documentPath: string,
    selectionSet: GraphQLSelectionSet
): Promise<FiregraphResult> {
    let docResult: FiregraphResult = {};
    const doc = await store.doc(documentPath).get();
    const data = doc.data()!;
    if (selectionSet && selectionSet.selections) {
        const fieldsToRetrieve = selectionSet.selections;
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
                    nestedPath = `${documentPath}/${fieldName}`;
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
    }
    return docResult;
}