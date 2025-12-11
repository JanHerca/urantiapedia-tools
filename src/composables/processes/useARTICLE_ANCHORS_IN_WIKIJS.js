import { useReadIndexFileFromTSV } from '../articles/useReadIndexFileFromTSV.js';
import { useWriteAnchorsToWikijs } from '../articles/useWriteAnchorsToWikijs.js';

/**
 * Add anchors to articles in Wiki.js
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {Ref<boolean>} processing Processing flag.
 * @param {function} addLog Function to add log messages.
 * @param {function} addErrors Function to add error messages.
 * @param {function} addSuccess Function to add success messages.
 */
export const useARTICLE_ANCHORS_IN_WIKIJS = (
  language,
  uiLanguage,
  processing,
  addLog,
  addErrors,
  addSuccess
) => {
  const { readIndexFileFromTSV } = useReadIndexFileFromTSV(language, uiLanguage,
    addLog);
  const { writeAnchorsToWikijs } = useWriteAnchorsToWikijs(language, uiLanguage, 
    addLog);

  /**
   * Reads TSV file for Study Aids
   * Writes anchors in articles (*.md)
   * @param {string} studyAidsFile File with an index of study aids in TSV format.
   * @param {string} outputFolder Output folder.
   */
  const executeProcess = async (
    studyAidsFile,
    outputFolder
  ) => {
    processing.value = true;
    addLog('Executing process: ARTICLE_ANCHORS_IN_WIKIJS');
    try {

      if (language.value === 'en') {
        const { index, items } = await readIndexFileFromTSV(studyAidsFile);
        await writeAnchorsToWikijs(outputFolder, index);
      } else {
        const studyAidsFileEN = studyAidsFile
          .replace(`articles-${language.value}`, 'articles-en');
        let { index, items } = await readIndexFileFromTSV(studyAidsFileEN);
        await readIndexFileFromTSV(studyAidsFile, index, items);
        await writeAnchorsToWikijs(outputFolder, index);
      }

      addSuccess('Process successful: ARTICLE_ANCHORS_IN_WIKIJS');
    } catch (errors) {
      addErrors(errors);
    } finally {
      processing.value = false;
    }
  };

  return { executeProcess };
};