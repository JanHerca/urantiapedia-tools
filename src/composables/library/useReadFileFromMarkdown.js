import { getError } from 'src/core/utils.js';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useReadFileFromMarkdown = (
  uiLanguage,
  addLog
) => {

  /**
   * Reads the information for a book from a Markdown file.
   * @param {string} filePath File path with book definition in Markdown format.
   */
  const readFileFromMarkdown = async (filePath) => {
    try {
      addLog(`Reading definition of a book: ${filePath}`);

      const buf = await window.NodeAPI.readFile(filePath);
      const lines = buf.toString().split('\n');
      if (lines.length === 0) {
        throw getError(uiLanguage.value, 'library_book_no_lines');
      }

      let section = null;
      const book = {
        title: null,
        folder_name: null,
        shelf_name: null,
        tag: null,
        cover: '',
        index: [],
        links: []
      };
      lines.forEach((line, i) => {
        const index = line.indexOf(':');
        if (line.startsWith('## title:')) {
          book.title = line.substring(index + 1).trim();
        } else if (line.startsWith('## folder_name:')) {
          book.folder_name = line.substring(index + 1).trim();
        } else if (line.startsWith('## shelf_name:')) {
          book.shelf_name = line.substring(index + 1).trim();
        } else if (line.startsWith('## tag:')) {
          book.tag = line.substring(index + 1).trim();
        } else if (line.startsWith('## cover:')) {
          section = 'cover';
        } else if (line.startsWith('## index:')) {
          section = 'index';
        } else if (line.startsWith('## links:')) {
          section = 'links';
        }
        if (section === 'cover' && !line.startsWith('## cover:')) {
          book.cover += line;
        }
        if (
          section === 'index' &&
          !line.startsWith('## index:') &&
          line.trim() != ''
        ) {
          book.index.push(
            line
              .split('|')
              .map((n, i) => i === 0
                ? n.trimRight()
                : n.trim()
              )
          );
        }
        if (section === 'links' && !line.startsWith('## links:')) {
          book.links.push(line);
        }
      });

      return book;

    } catch (err) {
      throw err;
    }
  };

  return {
    readFileFromMarkdown
  };
};