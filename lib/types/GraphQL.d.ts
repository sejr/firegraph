export declare type GraphQLSelection = {
    kind: string;
    alias?: string;
    arguments?: any[];
    directives?: any[];
    selectionSet?: GraphQLSelectionSet;
};
export declare type GraphQLSelectionSet = {
    kind: string;
    selections?: GraphQLSelection[];
};
