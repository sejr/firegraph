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
function selectFromCollection(store, collectionName, selectionSet) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching data from ${collectionName}`);
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
                        docResult[fieldName] = yield selectFromCollection(store, nestedPath, selectionSet);
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
function resolve(firestore, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        const { definitions } = query;
        for (let definition of definitions) {
            const { selectionSet } = definition;
            const targetCollections = selectionSet.selections;
            for (let collection of targetCollections) {
                const { name: { value: collectionName }, selectionSet } = collection;
                const result = yield selectFromCollection(firestore, collectionName, selectionSet);
                results.push(result);
            }
        }
        return results;
    });
}
exports.default = {
    resolve,
    test: () => __awaiter(this, void 0, void 0, function* () {
        return true;
    })
};
