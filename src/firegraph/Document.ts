import firebase from 'firebase/app';
import { GraphQLSelectionSet } from '../types/GraphQL';
import { FiregraphResult } from '../types/Firegraph';
import { resolveCollection } from './Collection';
import { CacheManager } from './CacheManager';

/**
 * Retrieves a single document from a specified document path. Retrieves
 * all fields indicated in the GraphQL selection set, including any nested
 * collections or references that are defined.
 * @param store An initialized Firestore instance.
 * @param documentPath The path of the document we want to retrieve.
 * @param selectionSet The rules for defining the documents we want to get.
 * @param cacheManager An instance of cache manager to use
 */
export async function resolveDocument(
  store: firebase.firestore.Firestore,
  documentPath: string,
  selectionSet: GraphQLSelectionSet,
  cacheManager: CacheManager,
  fetchedDocument?: firebase.firestore.DocumentSnapshot
): Promise<FiregraphResult> {
  let data: any;
  let doc: firebase.firestore.DocumentSnapshot;
  let docResult: FiregraphResult = {};
  let cachedDoc = cacheManager.getDocument(documentPath);

  // If cache is found, use it
  if (cachedDoc != undefined) {
    doc = cachedDoc;
    data = doc.data();
  }
  // If this function is passed with a Firestore document (i.e. from the
  // `resolveCollection` API), we don't need to fetch it again.
  else if (fetchedDocument) {
    doc = fetchedDocument;
    data = fetchedDocument.data();
  } else {
    doc = await store.doc(documentPath).get();
    data = doc.data();

    // Add document to cache
    cacheManager.saveDocument(documentPath, doc);
  }

  if (selectionSet && selectionSet.selections) {
    const fieldsToRetrieve = selectionSet.selections;
    for (let field of fieldsToRetrieve) {
      let args: any = {};
      for (let arg of field.arguments!) {
        args[(arg as any).name.value] = (arg as any).value.value;
      }
      const fieldName = (field as any).name.value;
      const { selectionSet } = field;
      const { alias } = field;

      // Here we handle document references and nested collections.
      // First, we need to determine which one we are dealing with.
      if (selectionSet && selectionSet.selections) {
        let nestedPath: string;

        // If its just raw path of some document
        if (typeof data[fieldName] == 'string') {
          const docId = data[fieldName];

          // If parent path is provided, consider it
          const { path } = args;
          let documentParentPath: string = path ? path : '';

          nestedPath = `${documentParentPath}${docId}`;
          const nestedResult = await resolveDocument(
            store,
            nestedPath,
            selectionSet,
            cacheManager
          );

          if (alias != undefined)
            docResult[(alias as any).value] = nestedResult;
          else docResult[fieldName] = nestedResult;

          // if field is of Document Reference type, use its path to resolve the document
        } else if (
          data[fieldName] != undefined &&
          data[fieldName].constructor!.name! == 'DocumentReference'
        ) {
          nestedPath = `${data[fieldName].path}`;
          const nestedResult = await resolveDocument(
            store,
            nestedPath,
            selectionSet,
            cacheManager
          );

          if (alias != undefined)
            docResult[(alias as any).value] = nestedResult;
          else docResult[fieldName] = nestedResult;

          // Else consider it a nested collection.
        } else {
          nestedPath = `${documentPath}/${fieldName}`;
          const nestedResult = await resolveCollection(
            store,
            nestedPath,
            args,
            selectionSet,
            cacheManager
          );

          if (alias != undefined)
            docResult[(alias as any).value] = nestedResult.docs;
          else docResult[fieldName] = nestedResult.docs;
        }
      } else {
        if (fieldName === 'id') {
          docResult[fieldName] = doc.id;
        } else {
          if (alias != undefined)
            docResult[(alias as any).value] = data[fieldName];
          else docResult[fieldName] = data[fieldName];
        }
      }
    }
  }
  return docResult;
}
