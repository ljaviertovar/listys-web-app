/** The multipart body of an upload: the photos, plus the trip they were uploaded from when the upload starts on a trip. */
export function buildUploadFormData(files: readonly File[], shoppingSessionId?: string): FormData {
	const formData = new FormData()
	files.forEach(file => formData.append('files', file))
	if (shoppingSessionId) formData.append('shopping_session_id', shoppingSessionId)
	return formData
}
