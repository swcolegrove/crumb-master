const toBoolean = val => (typeof val === 'boolean' ? val : ['true', 'TRUE', 'Y', 'True'].includes(val));

const isNullOrUndefined = val => typeof val === 'undefined' || val === null;

module.exports = {
  isNullOrUndefined,
  toBoolean,
};
