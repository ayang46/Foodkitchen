// Auto-translation utility using MyMemory Translation API (free, no key required)
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

export const translateText = async (text: string, sourceLang: 'en' | 'zh', targetLang: 'en' | 'zh'): Promise<string> => {
  if (!text || !text.trim()) return '';

  try {
    // MyMemory uses ISO language codes
    const sourceLangCode = sourceLang === 'zh' ? 'zh-CN' : 'en';
    const targetLangCode = targetLang === 'zh' ? 'zh-CN' : 'en';

    const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${sourceLangCode}|${targetLangCode}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error('Translation API error:', response.status);
      throw new Error('Translation failed');
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    } else {
      console.error('Translation API returned error:', data);
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error; // Propagate error so UI can show message
  }
};

export const autoTranslateFields = async (
  fields: { [key: string]: string },
  sourceLang: 'en' | 'zh'
): Promise<{ [key: string]: string }> => {
  const targetLang = sourceLang === 'en' ? 'zh' : 'en';
  const suffix = sourceLang === 'en' ? 'En' : 'Zh';
  const targetSuffix = targetLang === 'en' ? 'En' : 'Zh';

  const translations: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(fields)) {
    if (key.endsWith(suffix) && value) {
      const baseKey = key.replace(suffix, '');
      const targetKey = baseKey + targetSuffix;

      try {
        translations[targetKey] = await translateText(value, sourceLang, targetLang);
      } catch (error) {
        console.error(`Failed to translate ${key}:`, error);
        translations[targetKey] = value; // Fallback to original
      }
    }
  }

  return translations;
};
