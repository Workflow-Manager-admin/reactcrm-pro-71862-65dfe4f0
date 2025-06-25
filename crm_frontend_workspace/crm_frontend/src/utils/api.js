const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

// Generic API call
export async function api(path, method = "GET", token = "", data = undefined, responseType = "json") {
  let url = BACKEND_URL + path;
  let opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
  if (data && (method !== "GET" && method !== "HEAD")) opts.body = JSON.stringify(data);
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    if (resp.headers.get('content-type') && resp.headers.get('content-type').includes('application/json')) {
      const js = await resp.json();
      return js;
    }
    return { status: "error", message: "HTTP " + resp.status };
  }
  if (responseType === "blob") return await resp.blob();
  return await resp.json();
}
// PUBLIC_INTERFACE
export async function apiLogin(email, password) {
  return api("/auth/login", "POST", "", { email, password });
}
// PUBLIC_INTERFACE
export async function apiSignup(name, email, password) {
  return api("/auth/signup", "POST", "", { name, email, password });
}
// PUBLIC_INTERFACE
export async function getMe(token) {
  return api("/me", "GET", token);
}
// PUBLIC_INTERFACE
export function apiLogout() {
  // No backend for logout, clears local storage on frontend
}
