import { Strings } from 'src/core/strings';
import { BibleAbbreviations as BibleAbbs } from 'src/core/bibleAbbs';


/** 
 * Translates a text.
 * @param {string} code Code of text to translate.
 * @param {?string} language Language.
 */
export const tr = (code, language) => {
  const t = Strings[code][language];
  const t2 = Strings[code]['en'];
  return t ? t : t2;
};

/**
 * Formats a string using '{x}' pattern where x in a number 0..n.
 * First arg must be the string, and the rest the values.
 * @param {...string} params Strings.
 * @return {string}
 */
export const strformat = (...params) => {
	const str = params[0];
	return str.replace(/{(\d+)}/g, function(match, number) {
		const n = (parseInt(number)+1).toString();
		return typeof params[n] != 'undefined' ? params[n] : match;
	});
};

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
 * Returns all indexes in which a char (or any of several chars) is found.
 * @param {string} content Text to search.
 * @param {string|string[]} chars A char or an array of chars.
 * @param {?boolean} ignoreHtml Ignores the HTML marks when scanning. By default
 * is true.
 * @return {number[]}
 */
export const getAllIndexes = (content, chars, ignoreHtml = true) => {
	if (!content || !chars) return [];
	const targets = Array.isArray(chars) ? chars.map(String) : [String(chars)];
	const set = new Set(targets);
	const indexes = [];
	let inTag = false;
	for (let i = 0; i < content.length; i++) {
		const ch = content[i];
		if (ignoreHtml) {
			if (ch === '<') { inTag = true; continue; }
			if (ch === '>') { inTag = false; continue; }
			if (inTag) continue;
		}
		if (set.has(ch)) indexes.push(i);
	}
	return indexes;
};

/**
 * Returns an error.
 * @param  {...any} params Params.
 * @returns {Error}
 */
export const getError = (...params) => {
  const language = params[0];
  const msg = params[1];
  let text = Strings[msg] ? Strings[msg][language] : msg;
  if (!text) {
    text = Strings[msg]['en'];
  }
  return new Error(strformat(text, ...params.slice(2)));
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
    return { value: value }
  }, (err) => {
    return { error: err }
  });
};

/**
 * Extends an array ignoring nulls/undefineds and spreading arrays.
 * @param {Array.<VALUE>} arr Array to modify.
 * @param {Array.<VALUE>|VALUE|undefined|null} data Array to add.
 * @template VALUE
 */
export const extendArray = function (arr, data) {
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

/**
 * Gets the Bible abbreviation for a reference or null if not found.
 * @param {string} language Language.
 * @param {string} content Bible reference.
 * @return {?string}
 */
export const findBibleAbb = (language, content) => {
  const abbs = Object.keys(BibleAbbs[language]);
  const abbs_filter = abbs.filter(ab => content.startsWith(ab));
  return (abbs_filter.length === 0 ? null :
    abbs_filter.reduce((a, b) => a.length > b.length ? a : b));
};

/**
 * Process an Error object and returns its stack trace as an array of lines.
 * @param {Error} error The Error object.
 * @returns {string[]} An array with the lines of the stack trace.
 */
export const getStackTraceArray = (error) => {
  if (!error || !error.stack) {
    return [];
  }
  const stackLines = error.stack.split('\n');
  const cleanedStack = stackLines
    .slice(1)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return cleanedStack;
};