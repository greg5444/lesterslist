"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeImageUrl = normalizeImageUrl;
exports.resolveImageUrl = resolveImageUrl;
exports.parseImageAlignment = parseImageAlignment;
// src/config/imageUtils.js
const constants_js_1 = require("./constants.js");
const IMAGE_BASE_URL = 'https://images.lesterslist.com/media/';
/**
 * Normalizes an image URL by removing WordPress -scaled suffixes and fixing paths.
 * @param {string} url - The raw URL from the database.
 * @returns {string|null} - The normalized URL or null.
 */
function normalizeImageUrl(url) {
    if (!url || typeof url !== 'string' || url.trim() === '')
        return null;
    // Fix old WordPress paths → CDN paths
    let normalized = url.replace('/wp-content/media/', '/media/');
    // Remove WordPress -scaled suffix
    normalized = normalized.replace(/-scaled(\.[a-zA-Z]+)$/, '$1');
    return normalized;
}
/**
 * Resolves a potentially relative image path to a full URL.
 * @param {string} path - The image path or absolute URL.
 * @returns {string} - The full URL or DEFAULT_IMAGE_URL.
 */
function resolveImageUrl(path) {
    const normalized = normalizeImageUrl(path);
    if (!normalized)
        return constants_js_1.DEFAULT_IMAGE_URL;
    if (/^https?:\/\//i.test(normalized))
        return normalized;
    return IMAGE_BASE_URL + normalized;
}
/**
 * Parses an image URL for alignment metadata (e.g. #top, #center, #bottom).
 * @param {string} url - The image URL which might contain a hash fragment.
 * @returns {{url: string, alignment: string}} - The clean URL and the alignment value.
 */
function parseImageAlignment(url) {
    if (!url)
        return { url: constants_js_1.DEFAULT_IMAGE_URL, alignment: 'top' };
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) {
        return { url, alignment: 'top' }; // Default to top alignment
    }
    const cleanUrl = url.substring(0, hashIndex);
    let alignment = url.substring(hashIndex + 1).toLowerCase();
    // Validate alignment
    if (!['top', 'center', 'bottom'].includes(alignment)) {
        alignment = 'top';
    }
    return { url: cleanUrl, alignment };
}
