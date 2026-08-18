export function validateFiles(
  files,
  { currentCount, maxFiles, maxFileSizeMb }
) {
  if (currentCount + files.length > maxFiles) {
    throw new Error(`You can select at most ${maxFiles} files.`);
  }

  const maxBytes = maxFileSizeMb * 1024 * 1024;

  for (const file of files) {
    const isMedia =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/");

    if (!isMedia) {
      throw new Error(`${file.name} is not an image or video.`);
    }

    if (file.size > maxBytes) {
      throw new Error(
        `${file.name} exceeds the ${maxFileSizeMb} MB limit.`
      );
    }
  }
}

export function createSelectedMedia(files) {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    kind: file.type.startsWith("video/") ? "video" : "image",
    previewUrl: URL.createObjectURL(file)
  }));
}

export function revokeMediaPreview(item) {
  URL.revokeObjectURL(item.previewUrl);
}

export function revokeMediaPreviews(items) {
  for (const item of items) {
    revokeMediaPreview(item);
  }
}
