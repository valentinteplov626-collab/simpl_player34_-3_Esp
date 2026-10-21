import {
    translateElements
} from "./shared-YCYBIRTV.js";
import "./shared-LB7BSKAZ.js";
var createDesignContentLoadedEvent = (localePath) => new CustomEvent("DesignContentLoaded", {
    detail: {
        localePath
    }
});
var getSelectedDesign = (queryParamName) => {
    var _a;
    const queryDesign = (_a = new URL(window.location.href).searchParams.get(queryParamName)) == null ? void 0 : _a.trim();
    if (queryDesign === "default") {
        return "";
    }
    return queryDesign || APP_CONFIG.design;
};
var applyDesignFromConfig = async ({
    designRootPath = "./designs",
    queryParamName = "design",
    cssSelector = "#main-css",
    localePathBuilder = (designPath) => `${designPath}/locale`,
    loadFallbackTranslation,
    macroses = {}
} = {}) => {
    var _a;
    const selectedDesign = getSelectedDesign(queryParamName);
    const oldHTML = document.body.innerHTML;
    if (selectedDesign) {
        try {
            const previewBannerNode = document.getElementById("preview_banner");
            const previewBannerStyleNode = document.getElementById("preview_banner_style");
            document.body.innerHTML = "";
            const designPath = `${designRootPath}/${selectedDesign}`;
            const designHTMLResponse = await fetch(`${designPath}/index.html`);
            let designHTMLText = await designHTMLResponse.text();
            if (!designHTMLText || designHTMLResponse.ok === false || designHTMLResponse.status === 404) {
                throw new Error("Design was defined in APP_CONFIG, but there is no such design");
            }
            designHTMLText = designHTMLText.replaceAll("./assets", `${designPath}/assets`);
            const oldDesignCSSLink = document.querySelector(cssSelector);
            oldDesignCSSLink == null ? void 0 : oldDesignCSSLink.remove();
            const script = document.createElement("script");
            script.src = `${designPath}/assets/script.js`;
            document.body.innerHTML = designHTMLText;
            if (previewBannerStyleNode && !document.getElementById("preview_banner_style")) {
                document.body.append(previewBannerStyleNode);
            }
            if (previewBannerNode) {
                document.body.append(previewBannerNode);
            }
            document.body.append(script);
            if (loadFallbackTranslation) {
                await translateElements(
                    async () => {
                            return await loadFallbackTranslation(designPath);
                        },
                        macroses,
                        localePathBuilder(designPath)
                );
            }
            document.dispatchEvent(createDesignContentLoadedEvent(localePathBuilder(designPath)));
            return;
        } catch (err) {
            console.error(err);
            document.body.innerHTML = oldHTML;
            if (err instanceof Error) {
                (_a = window.syncMetric) == null ? void 0 : _a.call(window, {
                    event: "error",
                    errorMessage: err.message,
                    errorType: "CUSTOM",
                    errorSubType: "DesignChange"
                });
            }
        }
    }
    document.dispatchEvent(createDesignContentLoadedEvent());
};
(async () => {
    await applyDesignFromConfig({
        designRootPath: "./designs",
        queryParamName: "design",
        cssSelector: "#main-css",
        localePathBuilder: (designPath) => `${designPath}/locale`,
        loadFallbackTranslation: async (designPath) => {
            return await import(`${designPath}/locale/en.json`).then((m) => m.default);
        }
    });
})();