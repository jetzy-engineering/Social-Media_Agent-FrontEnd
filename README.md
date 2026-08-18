# Social Media Agent Frontend

This is the regular standalone React + Vite frontend.

It does not include chat history, chat routes, a sidebar, or a ChatGPT-style
conversation interface.

## Features

- Message/caption textarea
- Multiple image and video selection
- Local media previews
- Maximum file-count validation
- File-size validation
- Direct unsigned Cloudinary uploads from the browser
- Sends `{ message, mediaItems }` to `POST /agent`
- Reads `{ agentResponse }` from the backend
- Requests Cloudinary cleanup after the request finishes

## Run locally

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

## Frontend environment

```env
VITE_AGENT_SERVER_URL=http://localhost:3000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
VITE_MAX_FILES=20
VITE_MAX_FILE_SIZE_MB=250
```

## Required backend routes

```text
POST /agent
POST /cloudinary/delete-resources
```

Files are uploaded directly from the browser to Cloudinary. Cloudinary returns a `secure_url`, and the frontend sends that URL to `/agent`:

```json
{
  "message": "Post these images to Instagram.",
  "mediaItems": [
    {
      "type": "image",
      "url": "https://res.cloudinary.com/..."
    }
  ]
}
```

The frontend expects:

```json
{
  "agentResponse": "The post was published."
}
```

## Build for Vercel

```powershell
npm run build
```

Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_AGENT_SERVER_URL=https://your-agent-server-domain`
  - `VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name`
  - `VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset`

## Cloudinary setup

Create an **unsigned upload preset** in Cloudinary. Do not put the Cloudinary API secret in any `VITE_` variable because Vite exposes those values to the browser. The optional cleanup route stays on the backend because deleting resources requires the API secret.
