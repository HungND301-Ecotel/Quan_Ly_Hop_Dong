async function getFile(url: string, fileName?: string): Promise<File> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    const blob = await response.blob();
    const name = fileName || url.split('/').pop() || 'downloaded-file';

    return new File([blob], name, {
      type: blob.type,
      lastModified: new Date().getTime(),
    });
  } catch (error) {
    console.error('Error fetching file from cloud storage:', error);
    throw error;
  }
}

export const cloudStorage = {
  getFile,
};
