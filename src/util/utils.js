export const toBoolean = val => (typeof val === 'boolean' ? val : ['true', 'TRUE', 'Y', 'True'].includes(val));

export const isNullOrUndefined = val => typeof val === 'undefined' || val === null;

export default {
  isNullOrUndefined,
  toBoolean,
};
