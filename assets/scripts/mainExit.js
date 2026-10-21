import {
    makeExit
} from "./shared-N736JYUK.js";
import {
    continueInIframePreview,
    isIframePreviewBridgeActive,
    parseConfig
} from "./shared-5NK4CEME.js";
import "./shared-MVF2V5UU.js";
import "./shared-TMCNPBCK.js";
import "./shared-LB7BSKAZ.js";
var CURRENT_QUESTION_KEY = "step";

function removeUrlParameter(paramKey) {
    const url = window.location.href;
    const r = new URL(url);
    r.searchParams.delete(paramKey);
    const newUrl = r.href;
    window.history.replaceState(window.history.state, "", newUrl);
}
var getCurrentStepFromURL = (key = CURRENT_QUESTION_KEY, shouldDeleteKey = true) => {
    const url = new URL(window.location.href);
    const step = url.searchParams.get(key);
    if (shouldDeleteKey) removeUrlParameter(key);
    return step;
};
var tabUnderClick = async (config2, newTabParamValue, key = CURRENT_QUESTION_KEY) => {
    if (isIframePreviewBridgeActive() && !config2.tabUnderClick) return;
    const newTab = new URL(window.location.href);
    newTab.searchParams.set(key, newTabParamValue.toString());
    await makeExit({
            ...config2,
            tabUnderClick: {
                ...config2.tabUnderClick,
                newTab: {
                    url: newTab.toString()
                }
            }
        },
        "tabUnderClick"
    );
    if (isIframePreviewBridgeActive()) {
        window.history.replaceState(window.history.state, "", newTab.toString());
    }
};
var deleteModal = () => {
    const modal = document.querySelector("#modal");
    const overlay = document.querySelector("#overlay");
    modal == null ? void 0 : modal.remove();
    overlay == null ? void 0 : overlay.remove();
};
var config = parseConfig();
var isSecondStep = getCurrentStepFromURL() === "1";
var _a;
var isTabUnderExists = !!((_a = config.tabUnderClick) == null ? void 0 : _a.currentTab);
if (isSecondStep && isTabUnderExists) {
    deleteModal();
    document.addEventListener("DesignContentLoaded", deleteModal);
}
document.addEventListener("click", async () => {
    if (isSecondStep || !isTabUnderExists) {
        makeExit(config, "mainExit");
        return;
    }
    await tabUnderClick(config, "1");
    continueInIframePreview(() => {
        isSecondStep = true;
        deleteModal();
    });
});