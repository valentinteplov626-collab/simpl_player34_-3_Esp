var readAppConfig = () => {
    if (typeof APP_CONFIG === "undefined") {
        return {};
    }
    return APP_CONFIG;
};

export {
    readAppConfig
};