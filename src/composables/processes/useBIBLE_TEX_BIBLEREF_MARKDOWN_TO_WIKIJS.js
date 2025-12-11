import { useReadForBible } from '../paramony/useReadForBible.js';
import { useReadFromLaTeX } from '../bible/useReadFromLaTeX.js';
import { useWriteToWikijs } from '../bible/useWriteToWikijs.js';

/**
 * Convert Bible (LaTeX) + Refs (MARKDOWN) to Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useBIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess,
  addWarning
) => {
  const { readForBible } = useReadForBible(language, uiLanguage, addLog);
  const { readFromLaTeX } = useReadFromLaTeX(language, uiLanguage, addLog);
  const { writeToWikijs } = useWriteToWikijs(language, uiLanguage, addLog);

  /**
	 * Reads Bible Refs (*.md) + 
   * Reads Bible (*.tex) => 
   * Writes (*.html)
   * @param {string} paramonyFolder Folder with Bible Refs in Markdown format.
   * @param {string} bibleFolder Folder with Bible in LaTeX format.
   * @param {string} outputFolder Output folder for HTML files.
   */
  const executeProcess = async (
    paramonyFolder, 
    bibleFolder, 
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: BIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS');
    try {
      const { biblebooks: biblerefs, noTranslated } = readForBible(paramonyFolder);

      noTranslated.forEach(nt => {
        const { titleEN, bible_ref, lu_ref, text } = nt;
        const warn = `Not translated: ${titleEN}|${bible_ref}|${lu_ref}|${text}`;
        addWarning(warn);
      });

      const bible = await readFromLaTeX(bibleFolder);

      await writeToWikijs(outputFolder, bible, biblerefs);

      addSuccess('Process successful: BIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};