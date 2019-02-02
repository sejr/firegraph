export type FiregraphResult = { [key: string]: any };

export type FiregraphCollectionResult = {
    name: string;
    docs: FiregraphResult[];
};