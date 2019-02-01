import firebase from 'firebase/app';
import 'firebase/firestore';
declare type FirestoreMap = {
    [key: string]: FirestorePrimitive;
};
declare type FirestoreGeopoint = {
    latitude: number;
    longitude: number;
};
declare type FirestoreReference = {
    path: string;
};
declare type FirestorePrimitive = string | number | boolean | null | Date | FirestoreGeopoint | FirestoreMap;
declare type FirestoreArray = Array<FirestorePrimitive>;
declare type FirestoreValue = FirestorePrimitive | FirestoreArray | FirestoreReference;
declare type FiregraphResult = {
    [key: string]: FirestoreValue;
};
declare type FiregraphCollectionResult = {
    name: string;
    docs: FiregraphResult[];
};
declare function resolve(firestore: firebase.firestore.Firestore, query: any): Promise<FiregraphCollectionResult[]>;
declare const _default: {
    resolve: typeof resolve;
    test: () => Promise<boolean>;
};
export default _default;
