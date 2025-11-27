
/**
 * Composable to handle errors.
 * @param {function} addError Function to add error messages.
 */
export const useErrors = (
	addError
) => {
	const addErrors = (errors) => {
		if (Array.isArray(errors)) {
			errors.forEach(err => {
				addError(err.message);
			});
		} else {
			addError(errors.message);
		}
	};

	return { addErrors };
};