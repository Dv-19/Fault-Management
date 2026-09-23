// The integration doc was written assuming Vite (`VITE_API_BASE_URL`), but
// this project was created with Create React App, which only exposes
// build-time env vars prefixed with REACT_APP_. Add a `.env` file at the
// project root (see .env.example) with:
//
//   REACT_APP_API_BASE_URL=http://localhost:8080
//
// and restart `npm start` after adding/changing it (CRA only reads .env at
// startup, not on hot reload).

export const API_BASE_URL: string =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
