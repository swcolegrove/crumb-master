export const toBoolean = val => (typeof val === 'boolean' ? val : ['true', 'TRUE', 'Y', 'True'].includes(val));

export const isUndefined = val => typeof val === 'undefined';
