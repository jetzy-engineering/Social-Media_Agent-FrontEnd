import { buildAgentServerUrl, readJsonResponse } from "./http.js";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function validateCloudinaryConfiguration() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the frontend .env file."
    );
  }
}

async function uploadSingleFile(file) {
  validateCloudinaryConfiguration();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUD_NAME)}/auto/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error?.message || `Cloudinary upload failed for ${file.name}.`
    );
  }

  if (!data.secure_url) {
    throw new Error(
      `Cloudinary uploaded ${file.name}, but did not return a secure URL.`
    );
  }

  return {
    publicId: data.public_id,
    resourceType: data.resource_type,
    secureUrl: data.secure_url
  };
}

export async function uploadFilesToCloudinary(files) {
  const uploadedResources = [];

  // Upload sequentially so a batch of large videos does not overwhelm the browser.
  for (const file of files) {
    uploadedResources.push(await uploadSingleFile(file));
  }

  return uploadedResources;
}

export async function deleteCloudinaryResources(resources) {
  if (resources.length === 0) {
    return;
  }

  // Deletion requires the Cloudinary API secret, so it must remain on the backend.
  const response = await fetch(
    buildAgentServerUrl("/cloudinary/delete-resources"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ resources })
    }
  );

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(
      data.errorMessage || data.error || "Cloudinary cleanup failed."
    );
  }

  return data;
}
