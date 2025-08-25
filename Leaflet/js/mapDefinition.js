var highlightLayer;
//min and max values for attributes
//SST WS2m Rh2M Prectotorr, t2mmin, t2m, t2mmax
var mins = [8.194286, 0.04, 14.7, 0, -2.47, -2.47, -2.47];
var maxs = [19.474772, 14, 91, 3.37, 40.361, 40.361, 40.361];
var steps = [5, 5, 5, 5, 5, 5, 5];
var maxCols = [[255, 0, 0],[39, 216, 35],[164, 63, 177],[8, 48, 107],[255, 0, 0],[255, 0, 0],[255, 0, 0]]; 
var minCols = [[255, 255, 255],[255, 255, 255],[255, 235, 255],[255, 255, 255],[255, 255, 255],[255, 255, 255],[255, 255, 255]];
var averages = [0, 0, 0, 0, 0];
var counters = [0, 0, 0, 0, 0];
//total, sst, wind speed, humidity, precipitation, temp
var starterData = [Object.create({}), Object.create({}), Object.create({}), Object.create({}), Object.create({}), Object.create({}), Object.create({}), Object.create({})];
var penguinCountToday;
var layers = new Map();
var totalLayers = [];
var starterPenguinCount = Object.create({});
var isVisible;
var firstLoad = true;
document.getElementById("RemoveLayerForm").reset(); 
document.getElementById("AddLayerForm").reset(); 
document.getElementById("ChangeLimitsForm").reset(); 
document.getElementById("CreateChartForm").reset(); 
function highlightFeature(e) {
    highlightLayer = e.target;

    if (e.target.feature.geometry.type === 'LineString' || e.target.feature.geometry.type === 'MultiLineString') {
        highlightLayer.setStyle({
        color: '#ffff00',
        });
    } else {
        highlightLayer.setStyle({
        fillColor: '#ffff00',
        fillOpacity: 1
        });
    }
    highlightLayer.openPopup();
}
var map = L.map('map', {
    zoomControl: false, 
    center: [-39, 144],
    zoom: 14,
    fullscreenControl: true,
    timeDimension: true,
    timeDimensionOptions: {
        timeInterval: "2000-01-01/2005-12-31",
        period: "P1DT"
    },
    timeDimensionControl: true,
});

L.control.resetView({
    position: "topleft",
    title: "Reset view",
    latlng: L.latLng([-39, 144.4]),
    zoom: 8,
}).addTo(map);

var hash = L.hash(map);
map.attributionControl.setPrefix('<a href="https://github.com/tomchadwin/qgis2web" target="_blank">qgis2web</a> &middot; <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> &middot; <a href="https://qgis.org">QGIS</a>');
var autolinker = new Autolinker({truncate: {length: 30, location: 'smart'}});
// remove popup's row if "visible-with-data"
function removeEmptyRowsFromPopupContent(content, feature) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    var rows = tempDiv.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        var td = rows[i].querySelector('td.visible-with-data');
        var key = td ? td.id : '';
        if (td && td.classList.contains('visible-with-data') && feature.properties[key] == null) {
            rows[i].parentNode.removeChild(rows[i]);
        }
    }
    return tempDiv.innerHTML;
}
// add class to format popup if it contains media
function addClassToPopupIfMedia(content, popup) {
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (tempDiv.querySelector('td img')) {
        popup._contentNode.classList.add('media');
            // Delay to force the redraw
            setTimeout(function() {
                popup.update();
            }, 10);
    } else {
        popup._contentNode.classList.remove('media');
    }
}
var zoomControl = L.control.zoom({
    position: 'topleft'
}).addTo(map);
var bounds_group = new L.featureGroup([]);
function setBounds() {
    if (bounds_group.getLayers().length) {
        map.fitBounds(bounds_group.getBounds());
    }
}

map.createPane('pane_OpenStreetMap_0');
map.getPane('pane_OpenStreetMap_0').style.zIndex = 400;
var layer_OpenStreetMap_0 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    pane: 'pane_OpenStreetMap_0',
    opacity: 1.0,
    attribution: '',
    minZoom: 1,
    maxZoom: 28,
    minNativeZoom: 0,
    maxNativeZoom: 19
});
layer_OpenStreetMap_0;
map.addLayer(layer_OpenStreetMap_0);
function pop_Geo_Penguin_Count(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <th scope="row">PenguinNum</th>\
                <td>' + (feature.properties['PATHWAYS_COUNT'] !== null ? autolinker.link(String(feature.properties['PATHWAYS_COUNT']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['PATHWAY'] !== null ? autolinker.link(String(feature.properties['PATHWAY']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_Penguin_Count_0() {
    if(firstLoad)
        return;
    return {
        pane: 'pane_Geo_Penguin_Count',
        opacity: 1,
        color: 'rgba(141,90,153,1.0)',
        dashArray: '',
        lineCap: 'round',
        lineJoin: 'round',
        weight: 6.0,
        fillOpacity: 0,
        interactive: true,
    }
}
map.createPane('pane_Geo_Penguin_Count');
map.getPane('pane_Geo_Penguin_Count').style.zIndex = 401;
map.getPane('pane_Geo_Penguin_Count').style['mix-blend-mode'] = 'normal';
var layer_Geo_Penguin_Count = new L.geoJson(PenguinCount, {
    attribution: '',
    interactive: true,
    dataVar: 'PenguinCount',
    layerName: 'layer_Geo_Penguin_Count',
    pane: 'pane_Geo_Penguin_Count',
    onEachFeature: pop_Geo_Penguin_Count,
    style: style_Geo_Penguin_Count_0,
});
bounds_group.addLayer(layer_Geo_Penguin_Count);

map.createPane('pane_Geo_Penguin_Count_Timed');
map.getPane('pane_Geo_Penguin_Count_Timed').style.zIndex = 459;
map.getPane('pane_Geo_Penguin_Count_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_Penguin_Count_Timed = L.timeDimension.layer.geoJson(layer_Geo_Penguin_Count, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_Penguin_Count_Timed);
map.addLayer(layer_Geo_Penguin_Count_Timed);
function pop_Paths_Combined_2(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[0], feature.properties["time"], {value: feature.properties["NIGHTLY_PENGUIN_COUNT"], configurable: true, enumerable: true});
    penguinCountToday = feature.properties['NIGHTLY_PENGUIN_COUNT'];
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <th scope="row">PenguinNum</th>\
                <td>' + (feature.properties['NIGHTLY_PENGUIN_COUNT'] !== null ? autolinker.link(String(feature.properties['NIGHTLY_PENGUIN_COUNT']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Paths_Combined_2_0(feature) {
    if(firstLoad)
        return;
    if (isVisible){
        console.log("returning invisible and uninteractive");
        return {
            pane: 'pane_Paths_Combined_2',
            opacity: 1,
            color: 'rgba(0, 0, 0, 0)',
            dashArray: '',
            lineCap: 'round',
            lineJoin: 'round',
            weight: 3.0,
            fillOpacity: 0,
            interactive: false,
        }
    }
    else{
        console.log("returning visible and interactive");
        return {
            pane: 'pane_Paths_Combined_2',
            opacity: 1,
            color: 'rgba(141,90,153,1.0)',
            dashArray: '',
            lineCap: 'round',
            lineJoin: 'round',
            weight: 3.0,
            fillOpacity: 0,
            interactive: true,
        }
    }
}
map.createPane('pane_Paths_Combined_2');
map.getPane('pane_Paths_Combined_2').style.zIndex = 402;
map.getPane('pane_Paths_Combined_2').style['mix-blend-mode'] = 'normal';
var layer_Paths_Combined_2 = new L.geoJson(PenguinTotals, {
    attribution: '',
    interactive: true,
    dataVar: 'PenguinTotals',
    layerName: 'layer_Paths_Combined_2',
    pane: 'pane_Paths_Combined_2',
    onEachFeature: pop_Paths_Combined_2,
    style: style_Paths_Combined_2_0,
});
bounds_group.addLayer(layer_Paths_Combined_2);
//map.addLayer(layer_Paths_Combined_2);

map.createPane('pane_Paths_Combined_2_Timed');
map.getPane('pane_Paths_Combined_2_Timed').style.zIndex = 459;
map.getPane('pane_Paths_Combined_2_Timed').style['mix-blend-mode'] = 'normal';
var layer_Paths_Combined_2_Timed = L.timeDimension.layer.geoJson(layer_Paths_Combined_2, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union',
});

bounds_group.addLayer(layer_Paths_Combined_2_Timed);
map.addLayer(layer_Paths_Combined_2_Timed);
var phillipContent = new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0] + " Penguin Count: " + penguinCountToday;
function pop_Phillip_Island_Whole_3(feature, layer) {
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            layer.closePopup();
        },
        mouseover: function(e){
            layer.bindPopup(new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0] + " Penguin Count: " + penguinCountToday, { maxHeight: 400 });
            highlightFeature(e);
        }
    });
    layer.on('popupopen', function(e){
        addClassToPopupIfMedia(new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0] + " Penguin Count: " + penguinCountToday, e.popup);
    });
    layer.on('popupclose', function(e){
        layer.unbindPopup();
    });
    layer.bindPopup(new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0] + " Penguin Count: " + penguinCountToday, { maxHeight: 400 });
}

function style_Phillip_Island_Whole_3(feature) {
    switch(String(feature.properties[' aggregate(\'Penguin Data - Total\', \'array_agg\', "NIGHTLY_PENGUIN_COUNT")'])) {
        case '0-500':
            return {
        pane: 'pane_Phillip_Island_Whole_3',
        opacity: 1,
        color: 'rgba(35,35,35,0.896)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(247,252,245,0.896)',
        interactive: true,
    }
            break;
        default:
            return {
        pane: 'pane_Phillip_Island_Whole_3',
        opacity: 1,
        color: 'rgba(35,35,35,0.896)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1.0, 
        fill: true,
        fillOpacity: 1,
        fillColor: 'rgba(0,68,27,0.896)',
        interactive: true,
    }
            break;
    }
}
map.createPane('pane_Phillip_Island_Whole_3');
map.getPane('pane_Phillip_Island_Whole_3').style.zIndex = 403;
map.getPane('pane_Phillip_Island_Whole_3').style['mix-blend-mode'] = 'normal';
var layer_Phillip_Island_Whole_3 = new L.geoJson(json_Phillip_Island_Whole_3, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Phillip_Island_Whole_3',
    layerName: 'layer_Phillip_Island_Whole_3',
    pane: 'pane_Phillip_Island_Whole_3',
    onEachFeature: pop_Phillip_Island_Whole_3,
    style: style_Phillip_Island_Whole_3,
});
bounds_group.addLayer(layer_Phillip_Island_Whole_3);
map.addLayer(layer_Phillip_Island_Whole_3);

map.timeDimension.on('timeload', function(data){
    map.addLayer(layer_Paths_Combined_2_Timed);
    document.getElementById("headerPenguinCount").innerHTML = "Penguin Count: " + penguinCountToday;
    averages = [0, 0, 0, 0, 0];
    counters = [0, 0, 0, 0, 0];
    console.log("timeload running " + new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0]);
});

function pop_Geo_WEEKLY_SSTweekly_sstcopy_4(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[1], feature.properties["time"], {value: feature.properties["SST"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['SST'] !== null ? autolinker.link(String(feature.properties['SST']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_WEEKLY_SSTweekly_sstcopy_4_0(feature) {
    if(firstLoad)
        return;
    averages[0] += feature.properties['SST'];
    counters[0]++;
    if(counters[0] == 66){
        document.getElementById("headerPenguinCount").innerHTML += " | Av. Sea Surface Temperature: " + Math.round((averages[0] / 66) * 100) / 100;
    }
    return {
        pane: 'pane_Geo_WEEKLY_SSTweekly_sstcopy_4',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'SST', mins[0], maxs[0], steps[0], maxCols[0], minCols[0].filter(() => true)),
        interactive: true,
    }
}

map.createPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4');
map.getPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4').style.zIndex = 404;
map.getPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4').style['mix-blend-mode'] = 'normal';
var layer_Geo_WEEKLY_SSTweekly_sstcopy_4 = new L.geoJson(json_Geo_WEEKLY_SSTweekly_sstcopy_4, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_WEEKLY_SSTweekly_sstcopy_4',
    layerName: 'layer_Geo_WEEKLY_SSTweekly_sstcopy_4',
    pane: 'pane_Geo_WEEKLY_SSTweekly_sstcopy_4',
    onEachFeature: pop_Geo_WEEKLY_SSTweekly_sstcopy_4,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.125, latlng.lng - 0.125], [latlng.lat + 0.125, latlng.lng + 0.125]);
        return L.rectangle(bounds, style_Geo_WEEKLY_SSTweekly_sstcopy_4_0(feature));
    },
});
bounds_group.addLayer(layer_Geo_WEEKLY_SSTweekly_sstcopy_4);

map.createPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed');
map.getPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed').style.zIndex = 459;
map.getPane('pane_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed = L.timeDimension.layer.geoJson(layer_Geo_WEEKLY_SSTweekly_sstcopy_4, {
    updateTimeDimension: true,
    duration: 'P6DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed);

function pop_Geo_WS2Mws2mcopy_5(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[2], feature.properties["time"], {value: feature.properties["WS2M"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['WS2M'] !== null ? autolinker.link(String(feature.properties['WS2M']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_WS2Mws2mcopy_5_0(feature) {
    if(firstLoad)
        return;
    averages[1] += feature.properties['WS2M'];
    counters[1]++;
    if(counters[1] == 25){
        document.getElementById("headerPenguinCount").innerHTML += " | Av. Wind Speed: " + Math.round((averages[1] / 25) * 100) / 100;
    }
    console.log("Style Running " + new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0]);
    return {
        pane: 'pane_Geo_WS2Mws2mcopy_5',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'WS2M', mins[1], maxs[1], steps[1], maxCols[1], minCols[1].filter(() => true)),
        interactive: true,
    }
}

map.createPane('pane_Geo_WS2Mws2mcopy_5');
map.getPane('pane_Geo_WS2Mws2mcopy_5').style.zIndex = 405;
map.getPane('pane_Geo_WS2Mws2mcopy_5').style['mix-blend-mode'] = 'normal';
var layer_Geo_WS2Mws2mcopy_5 = new L.geoJson(json_Geo_WS2Mws2mcopy_5, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_WS2Mws2mcopy_5',
    layerName: 'layer_Geo_WS2Mws2mcopy_5',
    pane: 'pane_Geo_WS2Mws2mcopy_5',
    onEachFeature: pop_Geo_WS2Mws2mcopy_5,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_WS2Mws2mcopy_5_0(feature));
    },
});
bounds_group.addLayer(layer_Geo_WS2Mws2mcopy_5);

map.createPane('pane_Geo_WS2Mws2mcopy_5_Timed');
map.getPane('pane_Geo_WS2Mws2mcopy_5_Timed').style.zIndex = 459;
map.getPane('pane_Geo_WS2Mws2mcopy_5_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_WS2Mws2mcopy_5_Timed = L.timeDimension.layer.geoJson(layer_Geo_WS2Mws2mcopy_5, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
map.timeDimension.registerSyncedLayer(layer_Geo_WS2Mws2mcopy_5_Timed);
layer_Geo_WS2Mws2mcopy_5_Timed.on("timeload", function(data){
    console.log("Layer Timeload Running " + new Date(map.timeDimension.getCurrentTime()).toISOString().split('T')[0]);
});
bounds_group.addLayer(layer_Geo_WS2Mws2mcopy_5_Timed);

function pop_Geo_RH2Mrh2mcopy_6(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[3], feature.properties["time"], {value: feature.properties["RH2M"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['RH2M'] !== null ? autolinker.link(String(feature.properties['RH2M']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_RH2Mrh2mcopy_6_0(feature) {
    if(firstLoad)
        return;
    averages[2] += feature.properties['RH2M'];
    counters[2]++;
    if(counters[2] == 25){
        document.getElementById("headerPenguinCount").innerHTML += " | Av. Humidity: " + Math.round((averages[2] / 25) * 100) / 100;
    }
    return {
        pane: 'pane_Geo_RH2Mrh2mcopy_6',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'RH2M', mins[2], maxs[2], steps[2], maxCols[2], minCols[2].filter(() => true)),
        interactive: true,
    }
}

map.createPane('pane_Geo_RH2Mrh2mcopy_6');
map.getPane('pane_Geo_RH2Mrh2mcopy_6').style.zIndex = 406;
map.getPane('pane_Geo_RH2Mrh2mcopy_6').style['mix-blend-mode'] = 'normal';
var layer_Geo_RH2Mrh2mcopy_6 = new L.geoJson(json_Geo_RH2Mrh2mcopy_6, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_RH2Mrh2mcopy_6',
    layerName: 'layer_Geo_RH2Mrh2mcopy_6',
    pane: 'pane_Geo_RH2Mrh2mcopy_6',
    onEachFeature: pop_Geo_RH2Mrh2mcopy_6,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_RH2Mrh2mcopy_6_0(feature));
    },
});
bounds_group.addLayer(layer_Geo_RH2Mrh2mcopy_6);
//map.addLayer(layer_Geo_RH2Mrh2mcopy_6);

map.createPane('pane_Geo_RH2Mrh2mcopy_6_Timed');
map.getPane('pane_Geo_RH2Mrh2mcopy_6_Timed').style.zIndex = 459;
map.getPane('pane_Geo_RH2Mrh2mcopy_6_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_RH2Mrh2mcopy_6_Timed = L.timeDimension.layer.geoJson(layer_Geo_RH2Mrh2mcopy_6, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_RH2Mrh2mcopy_6_Timed);

function pop_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[4], feature.properties["time"], {value: feature.properties["PRECTOTCORR"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['PRECTOTCORR'] !== null ? autolinker.link(String(feature.properties['PRECTOTCORR']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_0(feature) {
    if(firstLoad)
        return;
    averages[3] += feature.properties['PRECTOTCORR'];
    counters[3]++;
    if(counters[3] == 25){
        document.getElementById("headerPenguinCount").innerHTML += " | Av. Precipitation: " + Math.round((averages[3] / 25) * 100) / 100;
    }
    return {
        pane: 'pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'PRECTOTCORR', mins[3], maxs[3], steps[3], maxCols[3], minCols[3].filter(() => true)),
        interactive: true,
    }
}

map.createPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7');
map.getPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7').style.zIndex = 407;
map.getPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7').style['mix-blend-mode'] = 'normal';
var layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7 = new L.geoJson(json_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
    layerName: 'layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
    pane: 'pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
    onEachFeature: pop_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_0(feature));
    },
});
bounds_group.addLayer(layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7);

map.createPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed');
map.getPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed').style.zIndex = 459;
map.getPane('pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed = L.timeDimension.layer.geoJson(layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed);

function pop_Geo_T2M_MINt2m_mincopy_8(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[5], feature.properties["time"], {value: feature.properties["T2M_MIN"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['T2M_MIN'] !== null ? autolinker.link(String(feature.properties['T2M_MIN']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_T2M_MINt2m_mincopy_8_0(feature) {
    if(firstLoad)
        return;
    return {
        pane: 'pane_Geo_T2M_MINt2m_mincopy_8',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'T2M_MIN', mins[4], maxs[4], steps[4], maxCols[4], minCols[4].filter(() => true)),
        interactive: true,
    }
}

function getCol(feature, attribute, min, max, step, maxCol, minCol){
    const interval = (max - min) / step;
    const rInterval = (maxCol[0] - minCol[0]) / step - 1;
    const gInterval = (maxCol[1] - minCol[1]) / step - 1;
    const bInterval = (maxCol[2] - minCol[2]) / step - 1;
    var value = min;
    while(value <= max){
        if(feature.properties[attribute] >= value && feature.properties[attribute] <= (value + interval)){
            //return color
            return 'rgba(' + parseFloat(minCol[0]) + ',' + parseFloat(minCol[1]) + ',' + parseFloat(minCol[2]) + ',1.0)';
        }
        minCol[0] = (minCol[0] + parseFloat(rInterval.toFixed(2)));
        minCol[1] = (minCol[1] + parseFloat(gInterval.toFixed(2)));
        minCol[2] = (minCol[2] + parseFloat(bInterval.toFixed(2)));
        value = (value + parseFloat(interval.toFixed(2)));
    }
    //return max color
    return 'rgba(' + maxCol[0] + ',' + maxCol[1] + ',' + maxCol[2] + ',1.0)';
}

map.createPane('pane_Geo_T2M_MINt2m_mincopy_8');
map.getPane('pane_Geo_T2M_MINt2m_mincopy_8').style.zIndex = 408;
map.getPane('pane_Geo_T2M_MINt2m_mincopy_8').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2M_MINt2m_mincopy_8 = new L.geoJson(json_Geo_T2M_MINt2m_mincopy_8, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_T2M_MINt2m_mincopy_8',
    layerName: 'layer_Geo_T2M_MINt2m_mincopy_8',
    pane: 'pane_Geo_T2M_MINt2m_mincopy_8',
    onEachFeature: pop_Geo_T2M_MINt2m_mincopy_8,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_T2M_MINt2m_mincopy_8_0(feature));
    },
});
bounds_group.addLayer(layer_Geo_T2M_MINt2m_mincopy_8);
//map.addLayer(layer_Geo_T2M_MINt2m_mincopy_8);

map.createPane('pane_Geo_T2M_MINt2m_mincopy_8_Timed');
map.getPane('pane_Geo_T2M_MINt2m_mincopy_8_Timed').style.zIndex = 459;
map.getPane('pane_Geo_T2M_MINt2m_mincopy_8_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2M_MINt2m_mincopy_8_Timed = L.timeDimension.layer.geoJson(layer_Geo_T2M_MINt2m_mincopy_8, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_T2M_MINt2m_mincopy_8_Timed);

function pop_Geo_T2Mt2mcopy_9(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[6], feature.properties["time"], {value: feature.properties["T2M"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['T2M'] !== null ? autolinker.link(String(feature.properties['T2M']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_T2Mt2mcopy_9_0(feature) {
    if(firstLoad)
        return;
    averages[4] += feature.properties['T2M'];
    counters[4]++;
    if(counters[4] == 25){
        document.getElementById("headerPenguinCount").innerHTML += " | Average Temperature: " + Math.round((averages[4] / 25) * 100) / 100;
    }
    return {
        pane: 'pane_Geo_T2Mt2mcopy_9',
        opacity: 0.25,
        color: 'rgba(35,35,35,0.97)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'T2M', mins[5], maxs[5], steps[5], maxCols[5], minCols[5].filter(() => true)),
        interactive: true,
    }
}
map.createPane('pane_Geo_T2Mt2mcopy_9');
map.getPane('pane_Geo_T2Mt2mcopy_9').style.zIndex = 409;
map.getPane('pane_Geo_T2Mt2mcopy_9').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2Mt2mcopy_9 = new L.geoJson(json_Geo_T2Mt2mcopy_9, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_T2Mt2mcopy_9',
    layerName: 'layer_Geo_T2Mt2mcopy_9',
    pane: 'pane_Geo_T2Mt2mcopy_9',
    onEachFeature: pop_Geo_T2Mt2mcopy_9,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_T2Mt2mcopy_9_0(feature));
    },
});

map.createPane('pane_Geo_T2Mt2mcopy_9_Timed');
map.getPane('pane_Geo_T2Mt2mcopy_9_Timed').style.zIndex = 459;
map.getPane('pane_Geo_T2Mt2mcopy_9_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2Mt2mcopy_9_Timed = L.timeDimension.layer.geoJson(layer_Geo_T2Mt2mcopy_9, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_T2Mt2mcopy_9_Timed);

function pop_Geo_T2M_MAXt2m_maxcopy_10(feature, layer) {
    if(firstLoad)
        Object.defineProperty(starterData[7], feature.properties["time"], {value: feature.properties["T2M_MAX"], configurable: true, enumerable: true});
    layer.on({
        mouseout: function(e) {
            for (var i in e.target._eventParents) {
                if (typeof e.target._eventParents[i].resetStyle === 'function') {
                    e.target._eventParents[i].resetStyle(e.target);
                }
            }
            if (typeof layer.closePopup == 'function') {
                layer.closePopup();
            } else {
                layer.eachLayer(function(feature){
                    feature.closePopup()
                });
            }
        },
        mouseover: highlightFeature,
    });
    var popupContent = '<table>\
            <tr>\
                <td colspan="2">' + (feature.properties['T2M_MAX'] !== null ? autolinker.link(String(feature.properties['T2M_MAX']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
            <tr>\
                <td colspan="2">' + (feature.properties['time'] !== null ? autolinker.link(String(feature.properties['time']).replace(/'/g, '\'').toLocaleString()) : '') + '</td>\
            </tr>\
        </table>';
    var content = removeEmptyRowsFromPopupContent(popupContent, feature);
    layer.on('popupopen', function(e) {
        addClassToPopupIfMedia(content, e.popup);
    });
    layer.bindPopup(content, { maxHeight: 400 });
}

function style_Geo_T2M_MAXt2m_maxcopy_10_0(feature) {
    if(firstLoad)
        return;
    return {
        pane: 'pane_Geo_T2M_MAXt2m_maxcopy_10',
        opacity: 0.25,
        color: 'rgba(35,35,35,1.0)',
        dashArray: '',
        lineCap: 'butt',
        lineJoin: 'miter',
        weight: 1,
        fill: true,
        fillOpacity: 0.25,
        fillColor: getCol(feature, 'T2M_MAX', mins[6], maxs[6], steps[6], maxCols[6], minCols[6].filter(() => true)),
        interactive: true,
    }
}
map.createPane('pane_Geo_T2M_MAXt2m_maxcopy_10');
map.getPane('pane_Geo_T2M_MAXt2m_maxcopy_10').style.zIndex = 410;
map.getPane('pane_Geo_T2M_MAXt2m_maxcopy_10').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2M_MAXt2m_maxcopy_10 = new L.geoJson(json_Geo_T2M_MAXt2m_maxcopy_10, {
    attribution: '',
    interactive: true,
    dataVar: 'json_Geo_T2M_MAXt2m_maxcopy_10',
    layerName: 'layer_Geo_T2M_MAXt2m_maxcopy_10',
    pane: 'pane_Geo_T2M_MAXt2m_maxcopy_10',
    onEachFeature: pop_Geo_T2M_MAXt2m_maxcopy_10,
    pointToLayer: function (feature, latlng) {
        var context = {
            feature: feature,
            variables: {}
        };
        var bounds = L.latLngBounds([latlng.lat - 0.25, latlng.lng - 0.3125], [latlng.lat + 0.25, latlng.lng + 0.3125]);
        return L.rectangle(bounds, style_Geo_T2M_MAXt2m_maxcopy_10_0(feature));
    },
});

map.createPane('pane_Geo_T2M_MAXt2m_maxcopy_10_Timed');
map.getPane('pane_Geo_T2M_MAXt2m_maxcopy_10_Timed').style.zIndex = 459;
map.getPane('pane_Geo_T2M_MAXt2m_maxcopy_10_Timed').style['mix-blend-mode'] = 'normal';
var layer_Geo_T2M_MAXt2m_maxcopy_10_Timed = L.timeDimension.layer.geoJson(layer_Geo_T2M_MAXt2m_maxcopy_10, {
    updateTimeDimension: true,
    duration: 'P0DT23H',
    updateTimeDimensionMode: 'union'
});
bounds_group.addLayer(layer_Geo_T2M_MAXt2m_maxcopy_10_Timed);

layers = new Map([
    ["Maximum Temperature", [layer_Geo_T2M_MAXt2m_maxcopy_10_Timed, starterData[7], "maxTemp"]],
    ["Average Temperature", [layer_Geo_T2Mt2mcopy_9_Timed, starterData[6], "averageTemp"]],
    ["Minimum Temperature", [layer_Geo_T2M_MINt2m_mincopy_8_Timed, starterData[5], "minTemp"]],
    ["Precipitation", [layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed, starterData[4], "precipitation"]],
    ["Humidity", [layer_Geo_RH2Mrh2mcopy_6_Timed, starterData[3], "humidity"]],
    ["Wind Speed", [layer_Geo_WS2Mws2mcopy_5_Timed, starterData[2], "windSpeed"]],
    ["Sea Surface Temperature", [layer_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed, starterData[1], "seaSurfaceTemp"]],
    ["Phillip Island", [layer_Phillip_Island_Whole_3, starterData[0], "island"]],
    ["Paths Combined Penguin Count", [layer_Paths_Combined_2_Timed, starterData[0], "total"]],
    ["Path Seperated Penguin Count", [layer_Geo_Penguin_Count_Timed, starterData[0], "paths"]]
]);
var control = new L.control.layers({},{
    "Maximum Temp.": layer_Geo_T2M_MAXt2m_maxcopy_10_Timed,
    "Average Temp.": layer_Geo_T2Mt2mcopy_9_Timed,
    "Minimum Temp.": layer_Geo_T2M_MINt2m_mincopy_8_Timed,
    "Precipitation": layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_Timed,
    "Humidity": layer_Geo_RH2Mrh2mcopy_6_Timed,
    "Wind Speed": layer_Geo_WS2Mws2mcopy_5_Timed,
    "Sea Surface Temp.": layer_Geo_WEEKLY_SSTweekly_sstcopy_4_Timed,
}).addTo(map);
addToRemoveList("Maximum Temperature");
addToRemoveList("Average Temperature");
addToRemoveList("Minimum Temperature");
addToRemoveList("Precipitation");
addToRemoveList("Humidity");
addToRemoveList("Wind Speed");
addToRemoveList("Sea Surface Temperature");
pathLayers = [layer_Geo_Penguin_Count_Timed];
totalLayers.push(layer_Paths_Combined_2_Timed);
firstLoad = false;
map.on("zoomend", function(e) {
    if (map.getZoom() > 18 || map.getZoom() < 14)
        isVisible = true;
    else
        isVisible = false;
    console.log("Zoom: " + map.getZoom());
    pathLayers.forEach(path =>{
        if (map.getZoom() <= 19 && map.getZoom() >= 17) {
            map.addLayer(path);
        } else if (map.getZoom() > 19 || map.getZoom() < 17) {
            map.removeLayer(path);
        }
    });
    totalLayers.forEach(path =>{
        if (map.getZoom() <= 17 && map.getZoom() >= 14) {
            map.addLayer(path);
        } else if (map.getZoom() > 17 || map.getZoom() < 14) {
            map.removeLayer(path);
        }
    });
    if (map.getZoom() <= 13 && map.getZoom() >= 2) {
        map.addLayer(layer_Phillip_Island_Whole_3);
    } else if (map.getZoom() > 13 || map.getZoom() < 2) {
        map.removeLayer(layer_Phillip_Island_Whole_3);
    }
});
setBounds();
var i = 0;
layer_Geo_Penguin_Count.eachLayer(function(layer) {
    var context = {
        feature: layer.feature,
        variables: {}
    };
    layer.bindTooltip((exp_label_Geo_Penguin_Count_eval_expression(context) !== null?String('<div style="color: #323232; font-size: 12pt; font-weight: bold; font-family: \'Open Sans\', sans-serif;">' + exp_label_Geo_Penguin_Count_eval_expression(context)) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_Geo_Penguin_Count'});
    labels.push(layer);
    totalMarkers += 1;
        layer.added = true;
        addLabel(layer, i);
        i++;
});
var i = 0;
layer_Paths_Combined_2_Timed.eachLayer(function(layer) {
    var context = {
        feature: layer.feature,
        variables: {}
    };
    layer.bindTooltip((exp_label_Paths_Combined_2_eval_expression(context) !== null?String('<div style="color: #323232; font-size: 10pt; font-weight: bold; font-family: \'Open Sans\', sans-serif;">' + exp_label_Paths_Combined_2_eval_expression(context)) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_Paths_Combined_2'});
    labels.push(layer);
    totalMarkers += 1;
        layer.added = true;
        addLabel(layer, i);
        i++;
});
var i = 0;
layer_Phillip_Island_Whole_3.eachLayer(function(layer) {
    var context = {
        feature: layer.feature,
        variables: {}
    };
    layer.bindTooltip((exp_label_Phillip_Island_Whole_3_eval_expression(context) !== null?String('<div style="color: #323232; font-size: 10pt; font-family: \'Open Sans\', sans-serif;">' + exp_label_Phillip_Island_Whole_3_eval_expression(context)) + '</div>':''), {permanent: true, offset: [-0, -16], className: 'css_Phillip_Island_Whole_3'});
    labels.push(layer);
    totalMarkers += 1;
        layer.added = true;
        addLabel(layer, i);
        i++;
});
resetLabels([layer_Geo_Penguin_Count,layer_Paths_Combined_2_Timed,layer_Phillip_Island_Whole_3]);
map.on("zoomend", function(){
    resetLabels([layer_Geo_Penguin_Count,layer_Paths_Combined_2_Timed,layer_Phillip_Island_Whole_3]);
});
map.on("layeradd", function(){
    resetLabels([layer_Geo_Penguin_Count,layer_Paths_Combined_2_Timed,layer_Phillip_Island_Whole_3]);
});
map.on("layerremove", function(){
    resetLabels([layer_Geo_Penguin_Count,layer_Paths_Combined_2_Timed,layer_Phillip_Island_Whole_3]);
});


async function uploadFile(){
    const radioButtons = document.querySelectorAll('input[name="File_Type"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            var type = radioButton.value;
            break;
        }
    }
    var newLayer;
    try {
        file = document.getElementById('data').files[0];
        var name = document.getElementById('layername').value;
        var latSize = document.getElementById('latInput').value / 100;
        var lonSize = document.getElementById('lonInput').value / 100;
        const content = await file.text();
        const lines = content.split('\n');
        var out;
        var graphData = Object.create({});
        switch(type){
            case "total":
                out = {
                    "type": "FeatureCollection",
                    "name": "Geo_PenguinTotal",
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[0].trim(), {value: line.split(',')[1], configurable: true, enumerable: true});
                    console.log("Adding Data: " + line);
                    out.features.push({ "type": "Feature", "properties": { "time": line.split(',')[0], "NIGHTLY_PENGUIN_COUNT": line.split(',')[1] }, "geometry":{"type":"MultiLineString","coordinates":[[[145.150762586954954,-38.511360743832689],[145.149400694832991,-38.510479519518491],[145.14916036092913,-38.509830617978025],[145.147724283228712,-38.508961175662847]]]} });
                });
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, layer_Paths_Combined_2.options), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "paths":
                out = {
                    "type": "FeatureCollection",
                    "name": "Geo_Penguin_Count",
                    "features": []
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[0].trim(), {value: line.split(',')[1], configurable: true, enumerable: true});
                    var path = null;
                    switch(line.split(',')[2].trim()){
                        case "Center":
                            path = [[[145.150964452199105,-38.51112999535394],[145.150701329105743,-38.510719523328262],[145.150301382003789,-38.510340626073784]]];
                            break;
                        case "East":
                            path = [[[145.151590262439839,-38.510743533736907],[145.151105591958071,-38.510357775598365],[145.150977005911898,-38.509882996350932],[145.150591247773349,-38.50955658561832]]];
                            break;
                        case "Far West":
                            path = [[[145.150502849664633,-38.512080671584776],[145.149175812612981,-38.511576338873255],[145.148969242570132,-38.511028928259712],[145.148958914067975,-38.510202648088331]]];
                            break;
                        case "West":
                            path = [[[145.150648704487054,-38.51149836768468],[145.150059308757875,-38.511414168294792],[145.149817235511961,-38.511024746116583],[145.149227455123679,-38.510667430684734]]];
                            break;
                        default:
                            console.log(line.split(',')[2]);
                            //error
                    }
                    out.features.push({ "type": "Feature", "properties": { "time": line.split(',')[0].trim(), "PATHWAYS_COUNT": parseInt(line.split(',')[1].trim()), "PATHWAY": line.split(',')[2].trim() }, "geometry":{"type":"MultiLineString","coordinates":path} });
                });
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, layer_Geo_Penguin_Count.options), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "averageTemp":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_T2Mt2mcopy_9",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"173476","LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"T2M":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var avOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_T2Mt2mcopy_9',
                    layerName: 'layer_Geo_T2Mt2mcopy_9',
                    pane: 'pane_Geo_T2Mt2mcopy_9',
                    onEachFeature: pop_Geo_T2Mt2mcopy_9,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - longSize], [latlng.lat + latSize, latlng.lng + longSize]);
                        return L.rectangle(bounds, style_Geo_T2Mt2mcopy_9_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, avOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "maxTemp":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_T2M_MAXt2m_maxcopy_10",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"173478","LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"T2M_MAX":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var maxOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_T2M_MAXt2m_maxcopy_10',
                    layerName: 'layer_Geo_T2M_MAXt2m_maxcopy_10',
                    pane: 'pane_Geo_T2M_MAXt2m_maxcopy_10',
                    onEachFeature: pop_Geo_T2M_MAXt2m_maxcopy_10,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_T2M_MAXt2m_maxcopy_10_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, maxOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "minTemp":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_T2M_MINt2m_mincopy_8",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"173478","LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"T2M_MIN":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var minOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_T2M_MINt2m_mincopy_8',
                    layerName: 'layer_Geo_T2M_MINt2m_mincopy_8',
                    pane: 'pane_Geo_T2M_MINt2m_mincopy_8',
                    onEachFeature: pop_Geo_T2M_MINt2m_mincopy_8,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_T2M_MINt2m_mincopy_8_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, minOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "precipitation":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                }
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"173476","LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"PRECTOTCORR":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var precOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
                    layerName: 'layer_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
                    pane: 'pane_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7',
                    onEachFeature: pop_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_PRECTOTCORRpenguin_data__prectotcorr_1copy_7_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, precOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "humidity":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_RH2Mrh2mcopy_6",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    console.log("Line: " + line.split(',')[0]);
                    out.features.push({"type":"Feature","properties":{"fid":"173481","LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"RH2M":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var humidityOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_RH2Mrh2mcopy_6',
                    layerName: 'layer_Geo_RH2Mrh2mcopy_6',
                    pane: 'pane_Geo_RH2Mrh2mcopy_6',
                    onEachFeature: pop_Geo_RH2Mrh2mcopy_6,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_RH2Mrh2mcopy_6_0(feature));
                    }
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, humidityOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "windSpeed":
                out = {
                "type": "FeatureCollection",
                "name": "Geo_PenguinTotal",
                "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                "features": []
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[3].trim(), {value: line.split(',')[2], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"173482","field_1":173481.0,"LAT":parseFloat(line.split(',')[0]),"LON":parseFloat(line.split(',')[1]),"WS2M":parseFloat(line.split(',')[2]),"time":line.split(',')[3]},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[1]),parseFloat(line.split(',')[0])]}});
                });
                var wsOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_WS2Mws2mcopy_5',
                    layerName: 'layer_Geo_WS2Mws2mcopy_5',
                    pane: 'pane_Geo_WS2Mws2mcopy_5',
                    onEachFeature: pop_Geo_WS2Mws2mcopy_5,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_WS2Mws2mcopy_5_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, wsOptions), {
                    updateTimeDimension: true,
                    duration: 'P0DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            case "seaSurfaceTemp":
                out = {
                    "type":"FeatureCollection",
                    "name":"Geo_WEEKLY_SSTweekly_sstcopy_4",
                    "crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},
                    "features":[]
                };
                lines.forEach((line, index) => {
                    if(index == 0 || line === "") return;
                    Object.defineProperty(graphData, line.split(',')[0].trim(), {value: line.split(',')[1], configurable: true, enumerable: true});
                    out.features.push({"type":"Feature","properties":{"fid":"957","field_1":956.0,"time":line.split(',')[0],"SST":parseFloat(line.split(',')[1]),"LON":parseFloat(line.split(',')[2]),"LAT":parseFloat(line.split(',')[3])},"geometry":{"type":"Point","coordinates":[parseFloat(line.split(',')[2]),parseFloat(line.split(',')[3])]}});
                });
                var sstOptions = {
                    attribution: '',
                    interactive: true,
                    dataVar: 'json_Geo_WEEKLY_SSTweekly_sstcopy_4',
                    layerName: 'layer_Geo_WEEKLY_SSTweekly_sstcopy_4',
                    pane: 'pane_Geo_WEEKLY_SSTweekly_sstcopy_4',
                    onEachFeature: pop_Geo_WEEKLY_SSTweekly_sstcopy_4,
                    pointToLayer: function (feature, latlng) {
                        var context = {
                            feature: feature,
                            variables: {}
                        };
                        var bounds = L.latLngBounds([latlng.lat - latSize, latlng.lng - lonSize], [latlng.lat + latSize, latlng.lng + lonSize]);
                        return L.rectangle(bounds, style_Geo_WEEKLY_SSTweekly_sstcopy_4_0(feature));
                    },
                }
                var newLayer = L.timeDimension.layer.geoJson(L.geoJson(out, sstOptions), {
                    updateTimeDimension: true,
                    duration: 'P6DT23H',
                    updateTimeDimensionMode: 'union'
                });
                break;
            default:
                //error
        }   
        bounds_group.addLayer(newLayer);
        addToRemoveList(name);
        layers.set(name, [newLayer, graphData, type]);
        if(type != "total" && type != "paths")
            control.addOverlay(newLayer, name);
        else
            pathLayers.push(newLayer);
    } catch (error) {
        console.error(error);
    }
    document.getElementById("AddLayerForm").reset(); 
}

function fillLimits(i){
    document.getElementById('minIn').value = mins[i];
    document.getElementById('maxIn').value = maxs[i];
    document.getElementById('stepsIn').value = steps[i];
    document.getElementById('minColIn').value = rgbToHex(minCols[i][0], minCols[i][1], minCols[i][2]);
    document.getElementById('maxColIn').value = rgbToHex(maxCols[i][0], maxCols[i][1], maxCols[i][2]);
}

function fillSizes(i){
    var x = 25, y = 31.25
    if(i == 0){
        x = 0;
        y = 0;
    }
    else if(i == 1){
        x = 12.5;
        y = 12.5;
    }
    document.getElementById('latInput').value = x;
    document.getElementById('lonInput').value = y;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function changeLimits(){
    const radioButtons = document.querySelectorAll('input[name="Limit_Change"]');
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            var layerIn = radioButton.value;
            break;
        }
    }
    const newMin = parseFloat(document.getElementById('minIn').value);
    const newMax = parseFloat(document.getElementById('maxIn').value);
    const newSteps = parseInt(document.getElementById('stepsIn').value);
    const newMinCol = hexToRgb(document.getElementById('minColIn').value);
    const newMaxCol = hexToRgb(document.getElementById('maxColIn').value);
    mins[parseInt(layerIn)] = newMin;
    maxs[parseInt(layerIn)] = newMax;
    steps[parseInt(layerIn)] = newSteps;
    minCols[parseInt(layerIn)] = [newMinCol.r, newMinCol.g, newMinCol.b];
    maxCols[parseInt(layerIn)] = [newMaxCol.r, newMaxCol.g, newMaxCol.b];
    document.getElementById("ChangeLimitsForm").reset(); 
}

function addToRemoveList(name){
    const form = document.getElementById("removeForm");
    var newButton = document.createElement("input");
    newButton.type = "radio";
    newButton.id = name + " Remove";
    newButton.name = "Layer_Removal";
    newButton.value = name;
    newButton.required = true;
    var newLabel = document.createElement("label");
    newLabel.htmlFor = name + " Remove";
    newLabel.id = name + " label";
    newLabel.innerHTML = name;
    form.appendChild(newButton);
    form.appendChild(newLabel);
}

function removeLayer(){
    const radioButtons = document.querySelectorAll('input[name="Layer_Removal"]');
    var layerIn = null
    for (const radioButton of radioButtons) {
        if (radioButton.checked) {
            layerIn = radioButton.value;
            radioButton.remove();
            document.getElementById(layerIn + " label").remove();
            break;
        }
    }
    if(layerIn != null){
        map.removeLayer(layers.get(layerIn)[0]);
        try{
            control.removeLayer(layers.get(layerIn)[0]);
        }
        catch (error) {
            console.log(error);
        }
    }
    else{
        console.log("layerIn is null");
    }
    layers.delete(layerIn);
    document.getElementById("RemoveLayerForm").reset(); 
}

async function createChart(){
    const checkboxes = document.querySelectorAll('input[name="Chart_Type"]');
    var dataset = [];
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            var type = checkbox.value;
            layers.forEach(function(layer){
                if(layer[2] === type){
                    var data = merge_options(data, layer[1]);
                    var label = "Data";
                    switch(type){
                        case "total":
                            label = '# of Penguins';
                            break;
                        case "averageTemp":
                            label = 'Average Temperature';
                            break;
                        case "maxTemp":
                            label = 'Maximum Temperature';
                            break;
                        case "minTemp":
                            label = 'Minimum Temperature';
                            break;
                        case "precipitation":
                            label = 'Precipitation';
                            break;
                        case "humidity":
                            label = 'Humidity';
                            break;
                        case "windSpeed":
                            label = 'Wind Speed';
                            break;
                        case "seaSurfaceTemp":
                            label = 'Sea Surface Temperature';
                            break;
                        default:
                            //error
                    }
                    dataset.push({
                        label: label,
                        data: data,
                        borderWidth: 1
                    });
                }
            });
        }
    }

    const ctx = document.getElementById('myChart');
    oldChart = Chart.getChart(ctx);
    if(oldChart != null)
        oldChart.destroy();
    console.log("Chart: " + ctx);
    new Chart(ctx, {
        type: 'scatter',
        data: {
        datasets: dataset
        },
        options: {
            scales: {
                x:{
                    type: 'time',
                    time: {
                        unit: 'year'
                    }
                },
                y: {
                    normalized: true,
                    beginAtZero: true
                }
            }
        }
    });
}

function merge_options(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}