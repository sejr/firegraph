export const parseObjectValue = (objectFields: any): any => {
    return objectFields.map((field: any) => {
        const { name, value } = field;
        return {
            key: name.value,
            value: value.value
        };
    });
}