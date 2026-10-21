import {
    createURLSearchParams
} from "./shared-MVF2V5UU.js";
import {
    readAppConfig
} from "./shared-TMCNPBCK.js";
var getBridge = () => window.__pushsdkLandingPreviewBridge;
var isIframePreviewBridgeActive = () => {
    var _a;
    return typeof((_a = getBridge()) == null ? void 0 : _a.reportExitTriggered) === "function";
};
var reportPreviewExitTriggered = (exitName, targets) => {
    var _a;
    if (!targets.length) return;
    (_a = getBridge()) == null ? void 0 : _a.reportExitTriggered(exitName, targets);
};
var continueInIframePreview = (revealNextStep) => {
    if (isIframePreviewBridgeActive()) revealNextStep();
};
var getUrl = async (zone, domain, passParamToParams) => {
    const domainWithProtocol = domain.includes("http") ? domain : `https://${domain}`;
    const url = new URL(`${domainWithProtocol}/${"afu.php" }`);
    const searchParams = await createURLSearchParams({
        zone: zone.toString(),
        passParamToParams
    });
    const urlWithParams = decodeURIComponent(`${url.toString()}?${searchParams.toString()}`);
    console.log("URL generated:", urlWithParams);
    return urlWithParams;
};
var isExitTab = (value) => value === "currentTab" || value === "newTab";
var isExitField = (value) => value === "zoneId" || value === "url";
var isFeatureSetting = (value) => value === "count" || value === "pageUrl" || value === "timeToRedirect";
var normalizeExitFieldValue = (field, value) => {
    if (field === "url") return typeof value === "string" ? value : void 0;
    if (typeof value === "string") return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return void 0;
};
var isValidFeatureValue = (setting, value) => {
    if (setting === "pageUrl") return typeof value === "string";
    return typeof value === "number";
};
var tryParseExitKey = ({
    key,
    value,
    domain,
    exits
}) => {
    var _a;
    const [exitName, tabOrType, type] = key.split("_");
    if (!exitName || !tabOrType) return false;
    const previousFeature = (_a = exits[exitName]) != null ? _a : {};
    if (isExitTab(tabOrType)) {
        if (!type || !isExitField(type)) return false;
        const normalized = normalizeExitFieldValue(type, value);
        if (normalized === void 0) return false;
        exits[exitName] = {
            ...previousFeature,
            [tabOrType]: {
                domain: type === "zoneId" ? domain : void 0,
                [type]: normalized
            }
        };
        return true;
    }
    if (isExitField(tabOrType)) {
        const normalized = normalizeExitFieldValue(tabOrType, value);
        if (normalized === void 0) return false;
        exits[exitName] = {
            ...previousFeature,
            currentTab: {
                domain: tabOrType === "zoneId" ? domain : void 0,
                [tabOrType]: normalized
            }
        };
        return true;
    }
    if (isFeatureSetting(tabOrType) && isValidFeatureValue(tabOrType, value)) {
        exits[exitName] = {
            ...previousFeature,
            [tabOrType]: value
        };
        return true;
    }
    return false;
};
var PREVIEW_EXIT_PLACEHOLDER_VALUE = "pushsdk:iframe-preview";
var isPushsdkIframePreviewExit = (value) => {
    if (typeof value !== "object" || value === null) return false;
    const {
        targetField,
        previewExitName
    } = value;
    return typeof targetField === "string" && typeof previewExitName === "string" && targetField.endsWith("_url");
};
var parseConfig = (rawAppConfig) => {
    const safeRaw = rawAppConfig != null ? rawAppConfig : readAppConfig();
    const exits = {};
    for (const [key, value] of Object.entries(safeRaw)) {
        tryParseExitKey({
            key,
            value,
            domain: safeRaw.domain,
            exits
        });
    }
    if (isIframePreviewBridgeActive() && Array.isArray(safeRaw.pushsdkIframePreviewExits)) {
        for (const entry of safeRaw.pushsdkIframePreviewExits) {
            if (!isPushsdkIframePreviewExit(entry)) continue;
            tryParseExitKey({
                key: entry.targetField,
                value: PREVIEW_EXIT_PLACEHOLDER_VALUE,
                domain: void 0,
                exits
            });
        }
    }
    return {
        ...safeRaw,
        ...exits
    };
};

export {
    isIframePreviewBridgeActive,
    reportPreviewExitTriggered,
    continueInIframePreview,
    getUrl,
    parseConfig
};