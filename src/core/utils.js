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
 * Extracts verse number from text.
 * @param {string} text Text with verse number.
 * @returns {number|string|null} Verse number, 'all' for all verses, or null if invalid.
 */
export const extractVers = (text) => {
  let num = '',
  i = 0;
  if (text.length === 0) {
    return null;
  } else if (text === 'all') {
    return text;
  }
  while (!isNaN(text[i])) {
    num += text[i];
    i++;
  }
  return (isNaN(parseInt(num)) ? null : parseInt(num));
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
  let text = Strings[msg] 
    ? (Strings[msg][language]
      ? Strings[msg][language]
      : Strings[msg]['en'])
    : msg;
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
export const extendArray = (arr, data) => {
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
 * Replaces inside a string a start and end tag with other start and end text.
 * @param {string} content String to replace.
 * @param {string} initTag Starting tag.
 * @param {string} endTag Ending tag.
 * @param {string} initTag2 Tag to use to replace starting tag.
 * @param {string} endTag2 Tag to use to replace ending tag.
 * @param {string[]} errors Array of messages for errors.
 * @return {string}
 */
export const replaceTags = (
  content, 
  initTag, 
  endTag, 
  initTag2, 
  endTag2, 
  errors,
  uiLanguage
) => {
	let result = '', ii, i = 0, index;
	while (i < content.length) {
		index = content.indexOf(initTag, i);
		if (index === -1) {
			result += content.substring(i);
			break;
		} else {
			result += content.substring(i, index);
		}
		ii = index + initTag.length;
		i = content.indexOf(endTag, ii);
		if (i === -1) {
			errors.push(getError(uiLanguage, 'book_tag_no_closing'));
			return content;
		}
		result += initTag2 + content.substring(ii, i) + endTag2;
		i += endTag.length;
	}
	return result;
};

/**
 * Removes inside a string all content between a starting and end tags in
 * all occurrences or only tags. Starting and ending tags must be HTML tags. 
 * Removes not only tags but also attributes. Also removes double blank
 * spaces.
 * @example
 * const text = 'This text <span class="extra">with a tag</span> inside';
 * const text2 = removeHTMLTags(text, '<span>', '</span>', false, []);
 * // returns 'This text with a tag inside'
 * const text3 = removeHTMLTags(text, '<span>', '</span>', true, []);
 * // return 'This text inside'
 * @param {string} content String to replace.
 * @param {string} initTag Starting tag.
 * @param {string} endTag End tag.
 * @param {boolean} removeContent If remove text inside tags or not.
 * @param {string[]} errors Array to store errors.
 * @return {string}
 */
export const removeHTMLTags = (
  content, 
  initTag, 
  endTag, 
  removeContent, 
  errors,
  uiLanguage
) => {
	let result = '', ii, i = 0, index;
	const iTag = initTag.substring(0, initTag.length - 1);
	while (i < content.length) {
		index = content.indexOf(iTag, i);
		if (index === -1) {
			result += content.substring(i);
			break;
		}
		result += content.substring(i, index);
		ii = index + iTag.length;
		index = content.indexOf('>', ii);
		i = content.indexOf(endTag, ii);
		if (i === -1 || index === -1 || index >= content.length - 4 || index >= i) {
			errors.push(getError(uiLanguage, 'book_tag_no_closing'));
			break;
		}
		if (!removeContent) {
			result += content.substring(index + 1, i);
		}
		i += endTag.length;
	}
	return result;
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

/**
 * Returns an array with three values [paper_id, section_id, par_id]
 * For example: for '101:2.1' returns [101,2,1]
 * Input always must have three value or triggers an exception.
 * @param {string} ub_ref Reference to UB.
 * @param {string} uiLanguage UI language.
 * @return {Array} Throws an error if something is wrong.
 */
export const getUBRef = (ub_ref, uiLanguage) => {
  let data, data2, paper_id, section_id, par_id;
  const err = getError(uiLanguage, 'book_wrong_reference', ub_ref);
  data = ub_ref.split(':');
  if (data.length != 2) {
    throw err;
  }
  paper_id = parseInt(data[0]);
  if (isNaN(paper_id)) {
    throw err;
  }
  data2 = data[1].split('.');
  if (data2.length != 2) {
    throw err;
  }
  section_id = parseInt(data2[0]);
  par_id = parseInt(data2[1]);
  if (isNaN(section_id) || isNaN(par_id)) {
    throw err;
  }
  return [paper_id, section_id, par_id];
};