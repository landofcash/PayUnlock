/**
 * Generate a compact, URL-safe 22-character base64-encoded UUID.
 */
export function encodeBase64Uuid(uuid: string): string {
    const hex = uuid.replace(/-/g, ""); // 32 hex chars = 16 bytes
    const bytes = Uint8Array.from(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const binary = String.fromCharCode(...bytes);
    const base64 = btoa(binary);
    // Convert to base64url and remove padding
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decode a URL-safe 22-character base64-encoded UUID
 * back into a standard 36-character UUID string.
 */
export function decodeBase64Uuid(base64Uuid: string): string {
    // Convert from base64url to standard base64
    const base64 = base64Uuid.replace(/-/g, "+").replace(/_/g, "/") + "==";
    const binary = atob(base64);
    const hex = [...binary].map((c) =>
        c.charCodeAt(0).toString(16).padStart(2, "0")
    ).join("");

    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20)
    ].join("-");
}
