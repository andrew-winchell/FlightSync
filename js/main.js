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
    map.add(apts);

    //fixes geojson layer
    const fixes = new GeoJSONLayer({
        url: ""
    });

    //flights geojson layer
    const flights = new GeoJSONLayer({
        url: "data/flights.geojson",
        timeInfo: {
            startField: "TIME_INST",
            interval: {
                unit: "seconds",
                value: 1
            }
        }
    });
    map.add(flights);

    //time extent variables for time slider widget
    //72hr window from the current day; day before and day after to midnight
    const currentTime = new Date();

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date()
    endTime.setDate(endTime.getDate() + 2);
    endTime.setHours(0, 0, 0, 0);
    
    //time slider widget
    const timeSlider = new TimeSlider({
        container: "timeSliderDiv",
        mode: "instant",
        timeVisible: true,
        playRate: 50,
        stops: {
          interval: {
            value: 1,
            unit: "minutes"
          }
        }
    });

    scene.whenLayerView(flights).then((flightsLV) => {
        const start = new Date(2015, 7, 1);
        timeSlider.fullTimeExtent = {
            start: start,
            end: layer.timeInfo.fullTimeExtent.end
        };

        timeSlider.timeExtent = {
            start: start,
            end: start
        };

        timeSlider.watch("timeExtent", () => {
            flights.definitionExpression = 
                "TIME_INST <= " + timeSlider.timeExtent.end.getTime();
        })
    })
})