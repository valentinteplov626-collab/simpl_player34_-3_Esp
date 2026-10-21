import {
    translateElements
} from "./shared-YCYBIRTV.js";
import {
    readAppConfig
} from "./shared-TMCNPBCK.js";
import "./shared-LB7BSKAZ.js";
var loadFallbackTranslation = async () => {
    return await import("./shared-XGLWI5K5.js").then((m) => m.default);
};
translateElements(loadFallbackTranslation, {
    install_app_and_continue_watching: {
        macros: "{app_name}",
        macrosValue: readAppConfig().appName,
        fallbackTranslationKey: "our_app"
    }
});