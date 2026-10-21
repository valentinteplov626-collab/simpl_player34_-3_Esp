var url = new URL(window.location.href);
var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
var URL_PARAM = {
    pz: (_a = url.searchParams.get("pz")) != null ? _a : "",
    tb: (_b = url.searchParams.get("tb")) != null ? _b : "",
    tb_reverse: (_c = url.searchParams.get("tb_reverse")) != null ? _c : "",
    ae: (_d = url.searchParams.get("ae")) != null ? _d : "",
    z: (_e = url.searchParams.get("z")) != null ? _e : "",
    var: (_f = url.searchParams.get("var")) != null ? _f : "",
    var_1: (_g = url.searchParams.get("var_1")) != null ? _g : "",
    var_2: (_h = url.searchParams.get("var_2")) != null ? _h : "",
    var_3: (_i = url.searchParams.get("var_3")) != null ? _i : "",
    b: (_j = url.searchParams.get("b")) != null ? _j : "",
    campaignid: (_k = url.searchParams.get("campaignid")) != null ? _k : "",
    abtest: (_l = url.searchParams.get("abtest")) != null ? _l : "",
    rhd: (_m = url.searchParams.get("rhd")) != null ? _m : "1",
    s: (_n = url.searchParams.get("s")) != null ? _n : "",
    ymid: (_o = url.searchParams.get("ymid")) != null ? _o : "",
    wua: (_p = url.searchParams.get("wua")) != null ? _p : "",
    use_full_list_or_browsers: (_q = url.searchParams.get("use_full_list_or_browsers")) != null ? _q : "",
    cid: (_r = url.searchParams.get("cid")) != null ? _r : "",
    geo: (_s = url.searchParams.get("geo")) != null ? _s : ""
};
var getUTCFormattedTime = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const microseconds = String(now.getUTCMilliseconds() * 1e3).padStart(6, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds} +00:00`;
};
var EVENTS_HISTORY_KEY = "events_history";
var getEventsHistory = () => {
    try {
        const history = sessionStorage.getItem(EVENTS_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        if (error instanceof Error && window.syncMetric) {
            window.syncMetric({
                event: "error",
                errorMessage: error.message,
                errorType: "CUSTOM",
                errorSubType: "EventsHistoryGet"
            });
        }
        return [];
    }
};
var saveEventsHistory = (history) => {
    try {
        sessionStorage.setItem(EVENTS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        if (error instanceof Error && window.syncMetric) {
            window.syncMetric({
                event: "error",
                errorMessage: error.message,
                errorType: "CUSTOM",
                errorSubType: "EventsHistorySave"
            });
        }
    }
};
var LANGUAGE_ALIASES = {
    nb: "no",
    nn: "no"
};
var getCurrentLanguage = () => {
    var _a2;
    const urlParams = window.location.search;
    const paramLang = new URLSearchParams(urlParams).get("lang");
    const userBrowserLang = navigator.language.split("-")[0];
    const lang = paramLang || userBrowserLang || "en";
    return (_a2 = LANGUAGE_ALIASES[lang]) != null ? _a2 : lang;
};
var getJsVersion = () => {
    var _a2, _b2;
    return typeof document !== "undefined" && ((_b2 = (_a2 = document.documentElement) == null ? void 0 : _a2.dataset) == null ? void 0 : _b2.jsVersion) || "";
};
var EVENT_MAPPING = {
    ["start"]: "start",
    ["ageExit"]: "age_exit",
    ["mainExit"]: "main_exit",
    ["push"]: "push",
    ["autoexit"]: "autoexit",
    ["back"]: "back",
    ["reverse"]: "reverse",
    ["tabUnderClick"]: "tab_under_click",
    ["error"]: "error",
    ["unhandledRejection"]: "unhandled_rejection",
    ["template_hash_ready"]: "template_hash_ready",
    ["template_hashes_ready"]: "template_hashes_ready"
};
var landingLoadDateTime = getUTCFormattedTime();
var getAb2rValue = () => {
    if (URL_PARAM.abtest) return URL_PARAM.abtest;
    return APP_CONFIG.abtest ? String(APP_CONFIG.abtest) : void 0;
};
var collectMetricsData = ({
    event,
    exitZoneId,
    errorMessage,
    errorSubType,
    errorType,
    skipHistory,
    contextExtra
}) => {
    var _a2, _b2, _c2, _d2;
    const docAttrs = (_a2 = document.querySelector("html")) == null ? void 0 : _a2.dataset;
    const landingName = (docAttrs == null ? void 0 : docAttrs.landingName) || "";
    const dataVer = (docAttrs == null ? void 0 : docAttrs.version) || "";
    const dataEnv = (docAttrs == null ? void 0 : docAttrs.env) || "";
    const ag = (docAttrs == null ? void 0 : docAttrs.ag) === "true";
    const landingDomain = window.location.host;
    const serverEvent = EVENT_MAPPING[event] || event;
    const landingLanguage = getCurrentLanguage();
    const eventsHistorySize = 30;
    const currentTs = Date.now();
    const eventHistory = getEventsHistory();
    const lastEvent = eventHistory[eventHistory.length - 1];
    const delta = lastEvent ? currentTs - lastEvent.currentTs : 0;
    if (!skipHistory) {
        eventHistory.push({
            currentTs,
            eventName: serverEvent,
            delta
        });
        if (eventHistory.length >= eventsHistorySize) {
            eventHistory.shift();
        }
        saveEventsHistory(eventHistory);
    }
    const eventData = [{
        app: "landings-constructor",
        event: serverEvent,
        language: landingLanguage,
        landing_name: landingName,
        build_version: dataVer,
        landing_domain: landingDomain,
        landing_url: window.location.href,
        exit_zone_id: exitZoneId ? Number(exitZoneId) : void 0,
        template_hash: (_b2 = window.templateHash) != null ? _b2 : "",
        request_var: URL_PARAM.var_3,
        source_zone_id: Number.isNaN(Number(URL_PARAM.var_2)) ? null : Number(URL_PARAM.var_2),
        sub_id: URL_PARAM.var_1,
        landing_load_date_time: landingLoadDateTime,
        error_message: errorMessage != null ? errorMessage : "",
        ab2r: getAb2rValue(),
        event_history: (_c2 = JSON.stringify({
            event_history: JSON.parse(JSON.stringify(getEventsHistory()))
        })) != null ? _c2 : null,
        // The built landing computes no hashes itself. protector owns template
        // hashing at serve time; its injected client reports the runtime
        // comparison by passing `contextExtra: { template_hashes: … }` on the
        // `template_hashes_ready` event. We merge that opaque extra into `context`
        // (where hash_integrity reads it). Other events pass no contextExtra, so
        // their context stays `{ ag }`.
        context: JSON.stringify({
            ag,
            ...contextExtra != null ? contextExtra : {}
        }),
        error_sub_type: errorSubType,
        error_type: errorType,
        env: dataEnv,
        // it's propush publisher id (read from data-js-version in run time)
        js_version: getJsVersion()
    }];
    const isAnalyticEnabled = (_d2 = APP_CONFIG.isAnalyticEnabled) != null ? _d2 : true;
    return {
        eventData,
        isAnalyticEnabled
    };
};

export {
    getCurrentLanguage,
    URL_PARAM,
    collectMetricsData
};