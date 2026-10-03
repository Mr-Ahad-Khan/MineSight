import { translateTexts } from "../services/api";

const CACHE_PREFIX = "minesight-translation-v1";

const readCache = (language) => {
  try {
    return JSON.parse(
      localStorage.getItem(`${CACHE_PREFIX}:${language}`) || "{}",
    );
  } catch {
    return {};
  }
};

const writeCache = (language, cache) => {
  try {
    localStorage.setItem(`${CACHE_PREFIX}:${language}`, JSON.stringify(cache));
  } catch {
    // Translation remains available from the network if storage is unavailable.
  }
};

export const getCachedTranslations = (texts, language) => {
  const cache = readCache(language);
  return texts.map((text) => cache[text] || text);
};

export const warmTranslationCache = async (
  texts,
  targetLanguage,
  sourceLanguage = "en",
) => {
  if (!targetLanguage || targetLanguage === sourceLanguage || !texts.length) {
    return texts;
  }

  const uniqueTexts = [...new Set(texts.map(String))];
  const cache = readCache(targetLanguage);
  const missingTexts = uniqueTexts.filter((text) => !cache[text]);

  for (let index = 0; index < missingTexts.length; index += 50) {
    const batch = missingTexts.slice(index, index + 50);
    try {
      const response = await translateTexts({
        texts: batch,
        sourceLanguage,
        targetLanguage,
      });
      batch.forEach((text, batchIndex) => {
        if (response.data?.data?.[batchIndex]) {
          cache[text] = response.data.data[batchIndex];
        }
      });
      writeCache(targetLanguage, cache);
    } catch {
      // Keep the bundled source text visible when the device is offline.
      return texts;
    }
  }

  return texts.map((text) => cache[text] || text);
};
