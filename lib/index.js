"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("firebase/firestore");
/**
 * Retrieves documents from a specified collection path. Currently retrieves
 * all fields indicated in the GraphQL selection set. Eventually this will
 * allow users to conduct queries with GraphQL syntax.
 * @param store An initialized Firestore instance.
 * @param collectionName The path of the collection we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
function selectFromCollection(store, collectionName, selectionSet) {
    return __awaiter(this, void 0, void 0, function* () {
        let collectionResult = {
            name: collectionName,
            docs: []
        };
        const collectionSnapshot = yield store.collection(collectionName).get();
        if (selectionSet && selectionSet.selections) {
            const fieldsToRetrieve = selectionSet.selections;
            for (let doc of collectionSnapshot.docs) {
                const data = doc.data();
                let docResult = {};
                for (let field of fieldsToRetrieve) {
                    const fieldName = field.name.value;
                    const { selectionSet } = field;
                    if (selectionSet && selectionSet.selections) {
                        let nestedPath = `${collectionName}/${doc.id}/${fieldName}`;
                        const nestedResult = yield selectFromCollection(store, nestedPath, selectionSet);
                        docResult[fieldName] = nestedResult.docs;
                    }
                    else {
                        if (fieldName === 'id') {
                            docResult[fieldName] = doc.id;
                        }
                        else {
                            docResult[fieldName] = data[fieldName];
                        }
                    }
                }
                collectionResult.docs.push(docResult);
            }
        }
        return collectionResult;
    });
}
/**
 * Runs a GraphQL query against a Google Cloud Firestore instance.
 * @param firestore An initialized Firestore instance.
 * @param query GraphQL query to be run against the Firestore. Use `graphql-tag`
 *        to parse your query, otherwise this will not work.
 */
function resolve(firestore, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = {};
        const { definitions } = query;
        for (let definition of definitions) {
            const { selectionSet } = definition;
            // Because we know that the root-level values in a query are collection
            // names, we can define them as collections to be targeted.
            const targetCollections = selectionSet.selections;
            // For each collection we have defined in our query, we want to fetch
            // its name and run the query for the requested values.
            for (let collection of targetCollections) {
                const { name: { value: collectionName }, selectionSet } = collection;
                // Now we begin to recursively fetch values defined in GraphQL
                // selection sets. We pass our `firestore` instance to ensure
                // all selections are done from the same database.
                const result = yield selectFromCollection(firestore, collectionName, selectionSet);
                // Push the root query result to our results list.
                results[result.name] = result.docs;
            }
        }
        // All necessary queries have been executed.
        return results;
    });
}
exports.default = {
    resolve
};
