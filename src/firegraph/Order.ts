/**
 * Applies filters to a Firestore query. Basically chains a series of
 * calls to `firestore.collection#orderBy`.
 * @param collectionQuery The query to be made against some collection.
 * @param order Set of filters formatted as `KEY_COMPARATOR: ASC/DESC` pairs
 */
export const setOrders = (
    collectionQuery: any,
    orders: any[]
): firebase.default.firestore.Query => {
    orders.forEach((filter: any) => {
        const field: string = filter['key'];
        const order: any = filter['value'];
        
        collectionQuery = collectionQuery.orderBy(field, order);
    });
    return collectionQuery;
}