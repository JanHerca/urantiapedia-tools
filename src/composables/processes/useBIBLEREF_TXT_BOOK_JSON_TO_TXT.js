import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { useErrors } from 'src/composables/useErrors.js';

/**
 * Process: Translate Bible Refs (TXT) + UB (JSON) to TXT
 * @param {Ref<string>} language Language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addError Function to add error messages.
 */
export const useBIBLEREF_TXT_BOOK_JSON_TO_TXT = (
	language,
	addLog,
	addError
) => {

	const { readFromJSON } = useReadFromJSON(
		language,
		addLog,
		addError
	);

	const { addErrors } = useErrors(addError);

	/**
	 * Executes the process.
	 * Reads UB (*.json) + 
	 * Reads Bible Refs (*.txt) => 
	 * Writes translation (*.txt)
	 * @param {string} bookFolder Folder with UB in JSON format.
	 * @param {string} biblerefFolder Folder with Bible Refs in TXT format.
	 */
	const executeProcess = async (bookFolder, biblerefFolder) => {
		addLog('Executing process: BIBLEREF_TXT_BOOK_JSON_TO_TXT');

		try {
			const papers = await readFromJSON(bookFolder);
			// await bibleref.readFromTXT(biblerefFolder);
			// await bibleref.translate(biblerefFolder, book);
			console.log(papers);
		} catch (errors) {
			addErrors(errors);
		}
	};

	return { executeProcess };
}