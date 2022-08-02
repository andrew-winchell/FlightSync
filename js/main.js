requestAnimationFrame([
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/FeatureLayer"
], function (promiseUtils, OAuthInfo, esriID, Map, SceneView, FeatureLayer) {

    //OAuth certification process
    //Required to access secure content from AGOL
    const info = new OAuthInfo({
        appId: "2cO9hZ1rTqtESUZc",
        portalUrl: "https://cobecconsulting.maps.arcgis.com",
        authNamespace: "portal_oauth_inline",
        flowtype: "auto",
        popup: false
    });
    esriID.registerOAuthInfos([info]);
    esriID.getCredential(info.portalUrl + "/sharing");
    esriID.checkSignInStatus(info.portalUrl + "/sharing")
        .then(() => {
            console.log("Sign in completed.")
        });
})