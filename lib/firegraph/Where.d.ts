/**
 * Parses GraphQL AST to get complex parameters to GraphQL queries.
 * @param objectFields Set of key-value pairs in GraphQL AST form.
 */
export declare const parseObjectValue: (objectFields: any) => any;
/**
 * Applies filters to a Firestore query. Basically chains a series of
 * calls to `firestore.collection#where`.
 * @param collectionQuery The query to be made against some collection.
 * @param where Set of filters formatted as `KEY_COMPARATOR: VALUE` pairs
 */
export declare const setQueryFilters: (collectionQuery: any, where: any[]) => import("firebase").firestore.Query;
