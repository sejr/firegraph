import firebase from 'firebase/app';
import 'firebase/firestore';

type FiregraphResult = { [key: string]: any };
type FiregraphCollectionResult = {
    name: string;
    docs: FiregraphResult[];
};

type GraphQLSelection = {
    kind: string;
    alias?: string;
    arguments?: any[];
    directives?: any[];
    selectionSet?: GraphQLSelectionSet;
}
type GraphQLSelectionSet = {
    kind: string;
    selections?: GraphQLSelection[];
}

/**
 * Retrieves a single document from a specified document path. Retrieves
 * all fields indicated in the GraphQL selection set, including any nested
 * collections or references that are defined.
 * @param store An initialized Firestore instance.
 * @param documentPath The path of the document we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
async function selectDocument(
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
                    const nestedResult = await selectDocument(
                        store,
                        nestedPath,
                        selectionSet
                    );
                    docResult[fieldName] = nestedResult;
                } else {
                    nestedPath = `${documentPath}/${fieldName}`;
                    const nestedResult = await selectFromCollection(
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

/**
 * Retrieves documents from a specified collection path. Currently retrieves
 * all fields indicated in the GraphQL selection set. Eventually this will
 * allow users to conduct queries with GraphQL syntax.
 * @param store An initialized Firestore instance.
 * @param collectionName The path of the collection we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
async function selectFromCollection(
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
            const data = doc.data();
            let docResult: any = {};
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
                        const nestedResult = await selectDocument(
                            store,
                            nestedPath,
                            selectionSet
                        );
                        docResult[fieldName] = nestedResult;
                    } else {
                        nestedPath = `${collectionName}/${doc.id}/${fieldName}`;
                        const nestedResult = await selectFromCollection(
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
                selectionSet
            } = collection;

            // Now we begin to recursively fetch values defined in GraphQL
            // selection sets. We pass our `firestore` instance to ensure
            // all selections are done from the same database.
            const result = await selectFromCollection(
                firestore,
                collectionName,
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