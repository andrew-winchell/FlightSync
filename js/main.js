require([
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/GeoJSONLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/ElevationLayer",
    "esri/Basemap"
], function (promiseUtils, OAuthInfo, esriID, Map, SceneView, GeoJSONLayer, FeatureLayer, TileLayer, ElevationLayer, Basemap) {

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

    //world topo basemap layer
    const basemap = new Basemap({
        baseLayers: [
            new TileLayer({
                url: "https://wtb.maptiles.arcgis.com/arcgis/rest/services/World_Topo_Base/MapServer"
            })
        ]
    });

    const map = new Map({
        ground: {
            layers: [
                new ElevationLayer({
                    url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
                })
            ]
        },
        basemap: basemap
    });

    const scene = new SceneView({
        container: "sceneView",
        map: map,
        center: [-98.5795, 39.8283],
        zoom: 5
    })

    //airports geojson layer
    const apts = new GeoJSONLayer({
        url: "data/apts.geojson"
    })

    map.add(apts);
})