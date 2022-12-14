require([
    "esri/Map",
    "esri/Basemap",
    "esri/config",
    "esri/core/promiseUtils",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/views/SceneView",
    "esri/layers/GeoJSONLayer",
    "esri/layers/FeatureLayer",
    "esri/layers/TileLayer",
    "esri/layers/ElevationLayer",
    "esri/widgets/TimeSlider",
    "esri/symbols/WebStyleSymbol"
], function (Map, Basemap, esriConfig, promiseUtils, OAuthInfo, esriID, SceneView, GeoJSONLayer, FeatureLayer, TileLayer, ElevationLayer, TimeSlider, WebStyleSymbol) {

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
        renderer: {
            type: "web-style",
            styleName: "EsriRealisticTransportationStyle",
            name: "Aiplane_Large_Passenger"
        },
        fields: [
            {
             "name": "MILLISECONDS",
             "alias": "MILLISECONDS",
             "type": "date"
            },
            {
             "name": "ID",
             "alias": "ID",
             "type": "string"
            }
        ],
        timeInfo: {
            startField: "MILLISECONDS",
            endField: "MILLISECONDS"
        },
        definitionExpression: "1=0"
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
        stops: {
            interval: {
                value: 1,
                unit: "seconds"
            }
        },
        playRate: 1000,
        loop: true
    });

    scene.whenLayerView(flights).then((flightView) => {
        timeSlider.fullTimeExtent = {
            start: Math.round(flights.timeInfo.fullTimeExtent.start),
            end: Math.round(flights.timeInfo.fullTimeExtent.end)
        };

        timeSlider.timeExtent = {
            start: Math.round(flights.timeInfo.fullTimeExtent.start)
        };

        timeSlider.watch("timeExtent", () => {
            flights.definitionExpression = 
                "MILLISECONDS <= " + (timeSlider.timeExtent.end.getTime() + 30000)
                + " AND MILLISECONDS >= " + (timeSlider.timeExtent.end.getTime() - 30000);
        })
    })
})