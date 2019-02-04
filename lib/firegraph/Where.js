"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parses GraphQL AST to get complex parameters to GraphQL queries.
 * @param objectFields Set of key-value pairs in GraphQL AST form.
 */
exports.parseObjectValue = (objectFields) => {
    return objectFields.map((field) => {
        const { name, value } = field;
        if (value.kind === 'IntValue')
            value.value = parseInt(value.value);
        return {
            key: name.value,
            value: value.value
        };
    });
};
/**
 * Applies filters to a Firestore query. Basically chains a series of
 * calls to `firestore.collection#where`.
 * @param collectionQuery The query to be made against some collection.
 * @param where Set of filters formatted as `KEY_COMPARATOR: VALUE` pairs
 */
exports.setQueryFilters = (collectionQuery, where) => {
    where.forEach((filter) => {
        const key = filter['key'];
        const value = filter['value'];
        const splitKey = key.split('_');
        const whereOp = splitKey[splitKey.length - 1];
        const actualKey = key.slice(0, -1 * (whereOp.length + 1));
        switch (whereOp) {
            case 'eq':
                collectionQuery = collectionQuery.where(actualKey, '==', value);
                break;
            case 'gt':
                collectionQuery = collectionQuery.where(actualKey, '>', value);
                break;
            case 'gte':
                collectionQuery = collectionQuery.where(actualKey, '>=', value);
                break;
            case 'lt':
                collectionQuery = collectionQuery.where(actualKey, '<', value);
                break;
            case 'lte':
                collectionQuery = collectionQuery.where(actualKey, '<=', value);
                break;
            default:
                collectionQuery = collectionQuery.where(key, '==', value);
                break;
        }
    });
    return collectionQuery;
};
