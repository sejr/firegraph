import firebase from 'firebase/app';
import 'firebase/firestore';

type FirestoreMap = { [key: string]: FirestorePrimitive };
type FirestoreGeopoint = { latitude: number; longitude: number };
type FirestoreReference = { path: string };
type FirestorePrimitive = string | number | boolean | null | Date | FirestoreGeopoint | FirestoreMap
type FirestoreArray = Array<FirestorePrimitive>
type FirestoreValue = FirestorePrimitive | FirestoreArray | FirestoreReference
type FiregraphResult = { [key: string]: FirestoreValue };
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

async function selectFromCollection(
    store: firebase.firestore.Firestore,
    collectionName: string,
    selectionSet: GraphQLSelectionSet
): Promise<FiregraphCollectionResult> {
    console.log(`Fetching data from ${collectionName}`);
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
                const fieldName = (field as any).name.value;
                const { selectionSet } = field;
                if (selectionSet && selectionSet.selections) {
                    let nestedPath = `${collectionName}/${doc.id}/${fieldName}`;
                    docResult[fieldName] = await selectFromCollection(
                        store,
                        nestedPath,
                        selectionSet
                    );
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

async function resolve(
    firestore: firebase.firestore.Firestore,
    query: any
): Promise<FiregraphCollectionResult[]> {
    const results: any[] = [];
    const { definitions } = query;
    for (let definition of definitions) {
        const { selectionSet } = definition;
        const targetCollections = selectionSet.selections;
        for (let collection of targetCollections) {
            const {
                name: { value: collectionName },
                selectionSet
            } = collection;
            const result = await selectFromCollection(
                firestore,
                collectionName,
                selectionSet
            );
            results.push(result);
        }
    }

    return results;
}

export default {
    resolve
};