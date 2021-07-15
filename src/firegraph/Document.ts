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
    store: firebase.default.firestore.Firestore,
    documentPath: string,
    selectionSet: GraphQLSelectionSet,
    fetchedDocument?: firebase.default.firestore.DocumentSnapshot
): Promise<FiregraphResult> {
    let data: any;
    let doc: firebase.default.firestore.DocumentSnapshot;
    let docResult: FiregraphResult = {};

    // If this function is passed with a Firestore document (i.e. from the 
    // `resolveCollection` API), we don't need to fetch it again.
    if (fetchedDocument) {
        doc = fetchedDocument;
        data = fetchedDocument.data();
    } else {
        doc = await store.doc(documentPath).get();
        data = doc.data();
    }

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
                const { path } = args;

                // If its just raw path of some document
                if ((typeof data[fieldName]) == "string") { 
                    const docId = data[fieldName];

                    // If parent path is provided, consider it
                    let documentParentPath:string = path ? path : "";

                    nestedPath = `${documentParentPath}${docId}`;
                    const nestedResult = await resolveDocument(
                      store,
                      nestedPath,
                      selectionSet
                    );
                    docResult[fieldName] = nestedResult;
                
                // if field is of Document Reference type, use its path to resolve the document
                } else if (data[fieldName] != undefined && data[fieldName].constructor!.name! == "DocumentReference") {
                    nestedPath = `${data[fieldName].path}`;
                    const nestedResult = await resolveDocument(
                        store,
                        nestedPath,
                        selectionSet
                    );
                    docResult[fieldName] = nestedResult;

                // Else consider it a nested collection.
                } else {
                    nestedPath = `${documentPath}/${fieldName}`;
                    const nestedResult = await resolveCollection(
                        store,
                        nestedPath,
                        args,
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