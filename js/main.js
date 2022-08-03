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
    "esri/Basemap",
    "esri/widgets/TimeSlider"
], function (promiseUtils, OAuthInfo, esriID, Map, SceneView, GeoJSONLayer, FeatureLayer, TileLayer, ElevationLayer, Basemap, TimeSlider) {

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
            console.log("Sign in successful.")
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
    });

    //airports geojson layer
    const apts = new GeoJSONLayer({
        url: "data/apts.geojson"
    });

    //fixes geojson layer
    const fixes = new GeoJSONLayer({
        url: ""
    });

    //flight paths geojson layer
    const flightPaths = new GeoJSONLayer({
        url: ""
    });

    const currentTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date()
    endTime.setDate(endTime.getDate() + 2);
    endTime.setHours(0, 0, 0, 0);

    const timeSlider = new TimeSlider({
        container: "timeSliderDiv",
        mode: "instant",
        timeVisible: true,
        fullTimeExtent: {
            start: startTime,
            end: endTime
        },
        timeExtent: {
            start: currentTime,
            end: currentTime
        },
        playRate: 100
    });

    //scene.ui.add(timeSlider, "bottom-leading")
    timeSlider.stops = null;
    timeSlider.viewModel.play();

    map.add(apts);
})