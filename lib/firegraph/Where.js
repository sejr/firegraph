"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseObjectValue = (objectFields) => {
    return objectFields.map((field) => {
        const { name, value } = field;
        return {
            key: name.value,
            value: value.value
        };
    });
};
