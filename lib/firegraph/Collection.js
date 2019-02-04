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
const Document_1 = require("./Document");
/**
 * Retrieves documents from a specified collection path. Currently retrieves
 * all fields indicated in the GraphQL selection set. Eventually this will
 * allow users to conduct queries with GraphQL syntax.
 * @param store An initialized Firestore instance.
 * @param collectionName The path of the collection we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
function resolveCollection(store, collectionName, collectionArgs, selectionSet) {
    return __awaiter(this, void 0, void 0, function* () {
        let collectionQuery = store.collection(collectionName);
        let collectionResult = {
            name: collectionName,
            docs: []
        };
        if (collectionArgs) {
            if (collectionArgs['where']) {
                const where = collectionArgs['where'];
                where.forEach((filter) => {
                    const key = filter['key'];
                    const value = filter['value'];
                    const splitKey = key.split('_');
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
        const collectionSnapshot = yield collectionQuery.get();
        if (selectionSet && selectionSet.selections) {
            for (let doc of collectionSnapshot.docs) {
                const documentPath = `${collectionName}/${doc.id}`;
                collectionResult.docs.push(yield Document_1.resolveDocument(store, documentPath, selectionSet));
            }
        }
        return collectionResult;
    });
}
exports.resolveCollection = resolveCollection;
