export type GraphQLSelection = {
    kind: string;
    alias?: string;
    arguments?: any[];
    directives?: any[];
    selectionSet?: GraphQLSelectionSet;
};

export type GraphQLSelectionSet = {
    kind: string;
    selections?: GraphQLSelection[];
};