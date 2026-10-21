import {
    getCurrentLanguage
} from "./shared-LB7BSKAZ.js";
var translationsCache = {};
var isFallbackCache = {};
var localePathCache;
var localeUrl = (lang, localePath) => localePath ? `${localePath}/${lang}.json` : `./locales/${lang}.json`;
var LocaleNotFoundError = class extends Error {};
var fetchLocale = async (lang, localePath) => {
    const url = localeUrl(lang, localePath);
    const response = await fetch(url);
    if (response.status === 404) {
        throw new LocaleNotFoundError(`Locale file not found: ${url}`);
    }
    if (!response.ok) {
        throw new Error(`Locale file request failed with status ${response.status}: ${url}`);
    }
    return await response.json();
};
var reportLocaleError = (error, lang, localePath) => {
    if (error instanceof Error && window.syncMetric) {
        window.syncMetric({
            event: "error",
            errorMessage: error.message,
            errorType: "CUSTOM",
            errorSubType: "GetTranslations"
        });
        console.error(
            `Error while loading translations: ${error.message}. Check the content of ${localeUrl(lang, localePath)} file`
        );
    }
};
var getTranslations = async (loadFallbackTranslation, localePath) => {
    const lang = getCurrentLanguage();
    if (!translationsCache[lang] || localePathCache !== localePath) {
        localePathCache = localePath;
        translationsCache[lang] = (async () => {
            try {
                const translations = await fetchLocale(lang, localePath);
                isFallbackCache[lang] = false;
                return translations;
            } catch (error) {
                let fallbackError = error;
                if (lang !== "en") {
                    if (!(error instanceof LocaleNotFoundError)) {
                        reportLocaleError(error, lang, localePath);
                    }
                    try {
                        const translations = await fetchLocale("en", localePath);
                        isFallbackCache[lang] = true;
                        return translations;
                    } catch (enError) {
                        fallbackError = enError;
                    }
                }
                reportLocaleError(fallbackError, "en", localePath);
                isFallbackCache[lang] = true;
                return await loadFallbackTranslation();
            }
        })();
    }
    return translationsCache[lang];
};
var isFallbackTranslation = (localePath) => {
    var _a;
    const lang = getCurrentLanguage();
    if (localePathCache !== localePath) {
        return false;
    }
    return (_a = isFallbackCache[lang]) != null ? _a : false;
};
var translateElements = async (loadFallbackTranslation, macroses, localePath) => {
    const lang = getCurrentLanguage();
    document.documentElement.setAttribute("lang", lang);
    const translations = await getTranslations(loadFallbackTranslation, localePath);
    if (["ar", "he", "fa", "ur", "ku", "ff", "dv"].includes(lang)) {
        const isFallback = isFallbackTranslation(localePath);
        if (!isFallback) {
            document.documentElement.setAttribute("dir", "rtl");
        }
    }
    const nonTranslatedKeys = [];
    Object.entries(translations).forEach((translation) => {
        var _a;
        const key = translation[0];
        let value = translation[1];
        const macros = macroses == null ? void 0 : macroses[key];
        if (macros) {
            const macrosFallbackValue = macros.fallbackTranslationKey ? translations[macros.fallbackTranslationKey] : void 0;
            const macrosValue = (_a = macros.macrosValue) != null ? _a : macrosFallbackValue;
            value = macrosValue ? value.replaceAll(macros.macros, macrosValue) : value;
        }
        const elementToTranslate = document.querySelectorAll(
            `[data-translate="${key}"]`
        );
        if (elementToTranslate == null ? void 0 : elementToTranslate.length) {
            elementToTranslate.forEach((element) => {
                if (element) {
                    const useHTML = element.hasAttribute("data-translate-html");
                    if (useHTML) {
                        element.innerHTML = value;
                    } else {
                        if (!element.childNodes.length) element.textContent = value;
                        element.childNodes.forEach((node) => {
                            if (node.nodeType === Node.TEXT_NODE) {
                                node.nodeValue = value;
                            }
                        });
                    }
                }
            });
            return;
        }
        nonTranslatedKeys.push(key);
    });
    if (nonTranslatedKeys.length) {
        console.warn(
            `Some keys from locales folder weren't used for translation when loading the landing page for the first time:`,
            nonTranslatedKeys.join(", ")
        );
    }
};

export {
    translateElements
};