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
// Top-level imports related to Firegraph.
const Where_1 = require("./firegraph/Where");
const Collection_1 = require("./firegraph/Collection");
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
                const { name: { value: collectionName }, selectionSet, arguments: collectionArguments, } = collection;
                // Parse the GraphQL argument AST into something we can use.
                const parsedArgs = {};
                collectionArguments.forEach((arg) => {
                    if (arg.value.kind === 'ObjectValue') {
                        const { fields } = arg.value;
                        parsedArgs[arg.name.value] = Where_1.parseObjectValue(fields);
                    }
                });
                // Now we begin to recursively fetch values defined in GraphQL
                // selection sets. We pass our `firestore` instance to ensure
                // all selections are done from the same database.
                const result = yield Collection_1.resolveCollection(firestore, collectionName, parsedArgs, selectionSet);
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
