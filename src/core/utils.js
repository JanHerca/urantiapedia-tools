import { Strings } from 'src/core/strings';

/**
 * Extracts part of a text enclosed in two other texts. It is extracted the 
 * first appearance, the rest are ignored.
 * @param {string} content Text from which extract.
 * @param {string} start Starting text.
 * @param {string} end Ending text.
 * @return {?string}
 */
export const extractStr = (content, start, end) => {
	const index = content.indexOf(start);
	if (index === -1) return null;
	const index2 = content.indexOf(end, index);
	if (index2 === -1) return null;
	return content.substring(index + start.length, index2);
};

/**
 * Returns an error.
 * @param  {...any} params Params.
 * @returns {Error}
 */
export const getError = (...params) => {
	const language = params[0];
	const msg = params[1];
	let text = Strings[msg][language];
	if (!text) {
		text = Strings[msg]['en'];
	}
	return new Error(exports.strformat(text, ...params.slice(2)));
};

/**
 * Returns a new promise using the one passed that is always set and never
 * rejects, returning an object with `value` if promise is resolved or 
 * `error` if promise is rejected.
 * This new type of promise is useful to execute a Promise.all that iterates
 * through all promises even if some are rejected.
 * @param {Promise} promise Promise to reflect.
 * @return {Promise}
 */
export const reflectPromise = (promise) => {
	return promise.then((value) => {
		return {value: value}
	}, (err) => {
		return {error: err}
	});
};

/**
 * Extends an array.
 * @param {Array.<VALUE>} arr Array to modify.
 * @param {Array.<VALUE>|VALUE|undefined} data Array to add.
 * @template VALUE
 */
export const extendArray = function(arr, data) {
	if (data == null) {
		return;
	}
	var i;
	var extension = Array.isArray(data) ? data : [data];
	var length = extension.length;
	for (i = 0; i < length; i++) {
		arr[arr.length] = extension[i];
	}
};