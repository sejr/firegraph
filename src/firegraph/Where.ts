/**
 * Parses GraphQL AST to get complex parameters to GraphQL queries.
 * @param objectFields Set of key-value pairs in GraphQL AST form.
 */
export const parseObjectValue = (objectFields: any): any => {
  return objectFields.map((field: any) => {
    const { name, value } = field;
    if (value.kind === 'IntValue') value.value = parseInt(value.value);

    if (value.kind === 'ListValue') {
      var itemList: any[] = [];
      value.values.forEach((e: any) => {
        itemList.push(e.value);
      });

      return {
        key: name.value,
        value: itemList,
      };
    }

    return {
      key: name.value,
      value: value.value,
    };
  });
};

/**
 * Applies filters to a Firestore query. Basically chains a series of
 * calls to `firestore.collection#where`.
 * @param collectionQuery The query to be made against some collection.
 * @param where Set of filters formatted as `KEY_COMPARATOR: VALUE` pairs
 */
export const setQueryFilters = (
  collectionQuery: any,
  where: any[]
): firebase.default.firestore.Query => {
  where.forEach((filter: any) => {
    const key: string = filter['key'];
    const value: any = filter['value'];
    const splitKey: string[] = key.split('_');
    const whereOp = splitKey[splitKey.length - 1];
    const actualKey = key.slice(0, -1 * (whereOp.length + 1));
    switch (whereOp) {
      case 'eq':
        collectionQuery = collectionQuery.where(actualKey, '==', value);
        break;
      case 'neq':
        collectionQuery = collectionQuery.where(actualKey, '!=', value);
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
      case 'contains':
        collectionQuery = collectionQuery.where(
          actualKey,
          'array-contains',
          value
        );
        break;
      case 'containsAny':
        collectionQuery = collectionQuery.where(
          actualKey,
          'array-contains-any',
          value
        );
        break;
      case 'in':
        collectionQuery = collectionQuery.where(actualKey, 'in', value);
        break;
      case 'notIn':
        collectionQuery = collectionQuery.where(actualKey, 'not-in', value);
        break;
      default:
        collectionQuery = collectionQuery.where(key, '==', value);
        break;
    }
  });
  return collectionQuery;
};
