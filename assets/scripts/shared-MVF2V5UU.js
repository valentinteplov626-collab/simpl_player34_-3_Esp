import {
    URL_PARAM
} from "./shared-LB7BSKAZ.js";
var fetchPlatformVersion = async () => {
    const navigatorWithUAData = navigator;
    if (!navigatorWithUAData.userAgentData) {
        return "";
    }
    try {
        const hints = ["platformVersion"];
        return (await navigatorWithUAData.userAgentData.getHighEntropyValues(hints)).platformVersion;
    } catch (error) {
        if (error instanceof Error && window.syncMetric) {
            window.syncMetric({
                event: "error",
                errorMessage: error.message,
                errorType: "CUSTOM",
                errorSubType: "FetchPlatformVersion"
            });
        }
        return "";
    }
};
var getBrowserTimezone = () => {
    if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
        const {
            timeZone
        } = Intl.DateTimeFormat().resolvedOptions();
        if (timeZone) {
            return timeZone;
        }
    }
    return "";
};
var getBrowserTimeOffset = () => {
    return (new Date()).getTimezoneOffset();
};
var setSearchParams = (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
        if (!params[key]) return;
        searchParams.set(key, params[key]);
    });
    return searchParams;
};
var urlParamsUpdateUseParamMapping = ({
    passParamToParams,
    searchParams,
    windowUrl
}) => {
    passParamToParams.forEach((mapping) => {
        const {
            from,
            to,
            joinWith
        } = mapping;
        const value = Array.isArray(from) ? from.map((param) => windowUrl.searchParams.get(param) || "").filter(Boolean).join(joinWith != null ? joinWith : "") : windowUrl.searchParams.get(from) || "";
        if (value) {
            to.forEach((param) => {
                searchParams.set(param, value);
            });
        }
    });
    return searchParams;
};
var dynamicUrlSearchParams = {};

function getKeysWithValues(obj) {
    return Object.keys(obj).filter((key) => Boolean(obj[key]));
}
var setUrlSearchParam = (key, value) => {
    dynamicUrlSearchParams[key] = String(value);
};
var createURLSearchParams = async ({
    zone,
    passParamToParams
}) => {
    var _a, _b, _c, _d;
    const browserTimezone = getBrowserTimezone();
    const browserTimeOffset = getBrowserTimeOffset();
    const dataVer = ((_a = document.querySelector("html")) == null ? void 0 : _a.getAttribute("data-version")) || "";
    const landingName = ((_b = document.querySelector("html")) == null ? void 0 : _b.getAttribute("data-landing-name")) || "";
    const landId = ((_c = document.querySelector("html")) == null ? void 0 : _c.getAttribute("data-land-id")) || "";
    const templateHash = (_d = window.templateHash) != null ? _d : "";
    const landMetadata = JSON.stringify({
        dataVer,
        landingName,
        templateHash
    });
    const cmeta = btoa(landMetadata);
    const optionallySearchParams = {
        ["pz"]: URL_PARAM.pz,
        ["tb"]: URL_PARAM.tb,
        ["tb_reverse"]: URL_PARAM.tb_reverse,
        ["ae"]: URL_PARAM.ae,
        ["ab2r"]: URL_PARAM.abtest || String(APP_CONFIG.abtest || "")
    };
    const defaultParams = {
        ["ymid"]: URL_PARAM.var_1 || URL_PARAM.var,
        ["var"]: URL_PARAM.var_2 || URL_PARAM.z,
        ["var_3"]: URL_PARAM.var_3,
        ["b"]: URL_PARAM.b,
        ["campaignid"]: URL_PARAM.campaignid,
        ["click_id"]: URL_PARAM.s,
        ["rhd"]: URL_PARAM.rhd,
        ["os_version"]: await fetchPlatformVersion(),
        ["btz"]: browserTimezone.toString(),
        ["bto"]: browserTimeOffset.toString(),
        ["cmeta"]: cmeta,
        ["lid"]: landId
    };
    if (zone) defaultParams["zoneid"] = zone;
    Object.entries(optionallySearchParams).forEach(([key, value]) => {
        if (value) defaultParams[key] = value;
    });
    const customSearchParams = typeof(APP_CONFIG == null ? void 0 : APP_CONFIG.customSearchParams) === "object" && APP_CONFIG.customSearchParams !== null ? APP_CONFIG.customSearchParams : {};
    const merged = {
        ...Object.fromEntries(Object.entries(defaultParams).filter(([, value]) => Boolean(value))),
        ...customSearchParams,
        ...dynamicUrlSearchParams
    };
    const keysDefinedInConfigOrApp = new Set([
        ...getKeysWithValues(customSearchParams),
        ...getKeysWithValues(dynamicUrlSearchParams)
    ]);
    const currentUrlParams = new URL(window.location.href).searchParams;
    for (const key of Object.keys(merged)) {
        if (keysDefinedInConfigOrApp.has(key)) continue;
        const valueFromUrl = currentUrlParams.get(key);
        if (valueFromUrl) merged[key] = valueFromUrl;
    }
    if (zone) merged["zoneid"] = zone;
    const searchParams = setSearchParams(merged);
    const effectivePassParamToParams = passParamToParams != null ? passParamToParams : Array.isArray(APP_CONFIG == null ? void 0 : APP_CONFIG.passParamToParams) ? APP_CONFIG.passParamToParams : void 0;
    return effectivePassParamToParams ? urlParamsUpdateUseParamMapping({
        passParamToParams: effectivePassParamToParams,
        searchParams,
        windowUrl: new URL(window.location.href)
    }) : searchParams;
};

export {
    setUrlSearchParam,
    createURLSearchParams
};