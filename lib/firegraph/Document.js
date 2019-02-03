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
const Collection_1 = require("./Collection");
/**
 * Retrieves a single document from a specified document path. Retrieves
 * all fields indicated in the GraphQL selection set, including any nested
 * collections or references that are defined.
 * @param store An initialized Firestore instance.
 * @param documentPath The path of the document we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 */
function resolveDocument(store, documentPath, selectionSet) {
    return __awaiter(this, void 0, void 0, function* () {
        let docResult = {};
        const doc = yield store.doc(documentPath).get();
        const data = doc.data();
        if (selectionSet && selectionSet.selections) {
            const fieldsToRetrieve = selectionSet.selections;
            for (let field of fieldsToRetrieve) {
                let args = {};
                for (let arg of field.arguments) {
                    args[arg.name.value] = arg.value.value;
                }
                const fieldName = field.name.value;
                const { selectionSet } = field;
                // Here we handle document references and nested collections.
                // First, we need to determine which one we are dealing with.
                if (selectionSet && selectionSet.selections) {
                    let nestedPath;
                    const { matchesKeyFromCollection } = args;
                    // Document reference.
                    if (matchesKeyFromCollection) {
                        const docId = data[fieldName];
                        nestedPath = `${matchesKeyFromCollection}/${docId}`;
                        const nestedResult = yield resolveDocument(store, nestedPath, selectionSet);
                        docResult[fieldName] = nestedResult;
                        // Nested collection.
                    }
                    else {
                        nestedPath = `${documentPath}/${fieldName}`;
                        const nestedResult = yield Collection_1.resolveCollection(store, nestedPath, args, selectionSet);
                        docResult[fieldName] = nestedResult.docs;
                    }
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
        }
        return docResult;
    });
}
exports.resolveDocument = resolveDocument;
