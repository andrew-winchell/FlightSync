require([
    "esri/config",
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
    "esri/widgets/TimeSlider",
    "esri/smartMapping/statistics/uniqueValues"
], function (esriConfig, promiseUtils, OAuthInfo, esriID, Map, SceneView, GeoJSONLayer, FeatureLayer, TileLayer, ElevationLayer, Basemap, TimeSlider, uniqueValues) {

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

    esriConfig.request.interceptors.push({
        urls: "data/newFlights.geojson",
        after: function(response) {
            console.log(response.url?.valueOf().toLowerCase())
            if (response.url?.valueOf().toLowerCase().includes("newflights")) {
                const geojson = response.data;
                geojson.features.forEach((feature) => {
                    const unixDate = Date.parse(feature.properties.isoDate);
                    feature.properties.unixDate = unixDate;
                });
            }
        }
    });

    //flights geojson layer
    const flights = new GeoJSONLayer({
        url: "data/flights.geojson",
        fields: [
          {
             "name": "MILLISECONDS",
             "alias": "MILLISECONDS",
             "type": "date"
           }
        ],
        timeInfo: {
            startField: "MILLISECONDS",
            endField: "MILLISECONDS"
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
            start: flights.timeInfo.fullTimeExtent.start,
            end: flights.timeInfo.fullTimeExtent.end
        };

        timeSlider.timeExtent = {
            start: flights.timeInfo.fullTimeExtent.start
        };

        timeSlider.watch("timeExtent", () => {
            flights.definitionExpression = 
                'MILLISECONDS <= ' + (timeSlider.timeExtent.end.getTime() + 15000)
                 + ' AND MILLISECONDS >= ' + (timeSlider.timeExtent.end.getTime() - 15000)
                 + " AND (iif(1=1, true, false))";
        })
    })
})