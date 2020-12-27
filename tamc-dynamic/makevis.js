// Save global copy of data
var alldata = [];

// Projection that the map is using
var projection;
var unprojection;

var click = 0;
var savedX = [0, 0];
var savedY = [0, 0];

// FILTERS
var isColors = true;
var isBikes = true;
var isPeds = true;
var isMotors = true;
var isTrucks = true;
var isAlc = true;
var isOther = true;

// HWY
var h0 = true;
var h1 = true;
var h2 = true;
var h3 = true;
var h4 = true;
var h5 = true;
var h6 = true;
var h7 = true;

var h0button = d3.select('#h0');
var h1button = d3.select('#h1');
var h2button = d3.select('#h2');
var h3button = d3.select('#h3');
var h4button = d3.select('#h4');
var h5button = d3.select('#h5');
var h6button = d3.select('#h6');
var h7button = d3.select('#h7');
var toggleRoads = d3.select('#toggleRoads');

// CITY
var unincorporated = true;
var greenfield = true;
var monterey = true;
var pacificGrove = true;
var salinas = true;
var aromas = true;
var seaside = true;
var sandCity = true;
var marina = true;
var gonzales = true;
var soledad = true;
var carmel = true;
var kingCity = true;
var delReyOaks = true;
var prunedale = true;
var carmelValley = true;
var bigsur = true;
var bradley = true;
var chualar = true;
var sanlucas = true;
var eastgarrison = true;
var jolon = true;
var lockwood = true;
var mosslanding = true;
var pajaro = true;
var parkfield = true;
var pebblebeach = true;
var royaloaks = true;
var sanardo = true;
var castroville = true;

var unincorporatedBtn = d3.select('#unincorporated');
var greenfieldBtn = d3.select('#greenfield');
var montereyBtn = d3.select('#monterey');
var pacificGroveBtn = d3.select('#pacific-grove');
var salinasBtn = d3.select('#salinas');
var aromasBtn = d3.select('#aromas');
var seasideBtn = d3.select('#seaside');
var sandCityBtn = d3.select('#sand-city');
var marinaBtn = d3.select('#marina');
var gonzalesBtn = d3.select('#gonzales');
var soledadBtn = d3.select('#soledad');
var carmelBtn = d3.select('#carmel');
var kingCityBtn = d3.select('#king-city');
var delReyOaksBtn = d3.select('#del-rey-oaks');
var prunedaleBtn = d3.select('#prunedale');
var carmelValleyBtn = d3.select('#carmel-valley');
var bigsurBtn = d3.select('#big-sur');
var bradleyBtn = d3.select('#bradley');
var chualarBtn = d3.select('#chualar');
var sanlucasBtn = d3.select('#san-lucas');
var eastgarrisonBtn = d3.select('#east-garrison');
var jolonBtn = d3.select('#jolon');
var lockwoodBtn = d3.select('#lockwood');
var mosslandingBtn = d3.select('#moss-landing');
var pajaroBtn = d3.select('#pajaro');
var parkfieldBtn = d3.select('#parkfield');
var pebblebeachBtn = d3.select('#pebble-beach');
var royaloaksBtn = d3.select('#royal-oaks');
var sanardoBtn = d3.select('#san-ardo');
var castrovilleBtn = d3.select('#castroville')
var toggleCitiesBtn = d3.select('#toggleCities');

// CONTROLLERS
var colorButton = d3.select('#color');
var bikeButton = d3.select('#b0');
var pedButton = d3.select('#b1');
var motorButton = d3.select('#b2');
var truckButton = d3.select('#b3');
var alcButton = d3.select('#b4');
var otherButton = d3.select('#b5');
var toggleButton = d3.select('#b6');

var sev1v = true;
var sev2v = true;
var sev3v = true;
var sev4v = true;

var sev1 = d3.select('#sev1');
var sev2 = d3.select('#sev2');
var sev3 = d3.select('#sev3');
var sev4 = d3.select('#sev4');

var colormap = d3.scaleLinear()
    .domain([1, 4])
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb("#843494"), d3.rgb('#f1c434')]);

let mapWidth = 1000;
let mapHeight = 750;

var startDate = new Date("2013-01-01"), endDate = new Date("2018-12-31");
var startUnix = startDate.getTime(), endUnix = endDate.getTime();
const offset = endUnix - startUnix;
var allRange = {
    start: startUnix,
    end: endUnix
};

var pointTotals = {
    total: 0,
    sev: [0, 0, 0, 0]
};

var polygon = {
    points: [],
    active: false,
    completed: false,
    layer: null
};

var prev = true;

var map;
const zoomInit = 9.3;
const radiusInit = 75 * zoomInit;
var zoom;

setup();

function setup() {
    // define projection
    zoom = zoomInit;
    var cx = -121.3;
    var cy = 36.385759;
    var cCoords = { "lat": cy, "lng": cx };
    map = L.map('map').setView(cCoords, zoom);
    L.tileLayer(`http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Map data & imagery &copy; <a href="https://maps.google.com/">Google</a>'
    }).addTo(map);
    $.getJSON("Monterey_County.geojson",function(countyBoundary){
      L.geoJson(countyBoundary, {
        style: {
          "color": "#4a773c",
          "weight": 3,
          "opacity": 0.5,
          "fillOpacity": 0
        }
      }).addTo(map);
    });
    displayCityBoundaries();
    addEventForwarder();
    controllers();
    colorboxes();
    adddata();
    // zoomFxn();
    panFxn();
    addDraw();
    //addgradient();
    rangeSlider();
}

function addEventForwarder(){
    const myEventForwarder = new L.eventForwarder({
        map: map,
        // events to forward
        events: {click: true, mousemove: false}
      });

      // enable event forwarding
      myEventForwarder.enable();
}

/*
function addgradient() {
    var scaleSVG = d3.select('#scale').append('svg')
        .attr('height', 50);
    var defs = scaleSVG.append('defs');
    var linearGradient = defs.append("linearGradient")
        .attr('id', 'linear-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
        linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#cc0000'); //light blue
        linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#009900'); //dark blue
    var legend = scaleSVG.append('rect')
        .attr('width', '300')
        .attr('height', '20')
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', 'url(#linear-gradient)')
    for (var i = 0; i < 4; i++) {
        var xpos = String(92*(i/3)) + '%';
        var text = 3*(i/3)+1;
        scaleSVG.append('text')
            .attr('x', xpos)
            .attr('y', 35)
            .attr('font-size', 12)
            .text(text);
    }
}
*/


function colorboxes() {
    sev1.style('background-color', colormap(1))
        .on('click', function () {
            sev1v = !sev1v; drawCircles(true);
            d3.select(this).style('background-color', function () {
                if (!sev1v) return '#a8a8a8'; return colormap(1);
            })
        });
    sev2.style('background-color', colormap(2))
        .on('click', function () {
            sev2v = !sev2v; drawCircles(true);
            d3.select(this).style('background-color', function () {
                if (!sev2v) return '#a8a8a8'; return colormap(2);
            })
        });
    sev3.style('background-color', colormap(3))
        .on('click', function () {
            sev3v = !sev3v; drawCircles(true);
            d3.select(this).style('background-color', function () {
                if (!sev3v) return '#a8a8a8'; return colormap(3);
            })
        });
    sev4.style('background-color', colormap(4))
        .on('click', function () {
            sev4v = !sev4v; drawCircles(true);
            d3.select(this).style('background-color', function () {
                if (!sev4v) return '#a8a8a8'; return colormap(4);
            })
        });
}

function controllers() {
    // color controllers
    colorButton.on('click', function () {
        d3.selectAll('.collision').remove();
        isColors = !isColors;
        drawCircles(true);
    });
    bikeButton.on('click', function () { isBikes = !isBikes; drawCircles(true); });
    pedButton.on('click', function () { isPeds = !isPeds; drawCircles(true); });
    motorButton.on('click', function () { isMotors = !isMotors; drawCircles(true); });
    truckButton.on('click', function () { isTrucks = !isTrucks; drawCircles(true); });
    alcButton.on('click', function () { isAlc = !isAlc; drawCircles(true); });
    otherButton.on('click', function () { isOther = !isOther; drawCircles(true); });
    toggleButton.on('click', toggleFilters);

    h0button.on('click', function () { h0 = !h0; drawCircles(true); });
    h1button.on('click', function () { h1 = !h1; drawCircles(true); });
    h2button.on('click', function () { h2 = !h2; drawCircles(true); });
    h3button.on('click', function () { h3 = !h3; drawCircles(true); });
    h4button.on('click', function () { h4 = !h4; drawCircles(true); });
    h5button.on('click', function () { h5 = !h5; drawCircles(true); });
    h6button.on('click', function () { h6 = !h6; drawCircles(true); });
    h7button.on('click', function () { h7 = !h7; drawCircles(true); });
    toggleRoads.on('click', toggleHighways);

    unincorporatedBtn.on('click', function () { unincorporated = !unincorporated; drawCircles(true); });
    greenfieldBtn.on('click', function () { greenfield = !greenfield; drawCircles(true); });
    montereyBtn.on('click', function () { monterey = !monterey; drawCircles(true); });
    pacificGroveBtn.on('click', function () { pacificGrove = !pacificGrove; drawCircles(true); });
    salinasBtn.on('click', function () { salinas = !salinas; drawCircles(true); });
    aromasBtn.on('click', function () { aromas = !aromas; drawCircles(true); });
    seasideBtn.on('click', function () { seaside = !seaside; drawCircles(true); });
    sandCityBtn.on('click', function () { sandCity = !sandCity; drawCircles(true); });
    marinaBtn.on('click', function () { marina = !marina; drawCircles(true); });
    gonzalesBtn.on('click', function () { gonzales = !gonzales; drawCircles(true); });
    soledadBtn.on('click', function () { soledad = !soledad; drawCircles(true); });
    carmelBtn.on('click', function () { carmel = !carmel; drawCircles(true); });
    kingCityBtn.on('click', function () { kingCity = !kingCity; drawCircles(true); });
    delReyOaksBtn.on('click', function () { delReyOaks = !delReyOaks; drawCircles(true); });
    prunedaleBtn.on('click', function () { prunedale = !prunedale; drawCircles(true); });
    carmelValleyBtn.on('click', function () { carmelValley = !carmelValley; drawCircles(true); });
    bigsurBtn.on('click', function () { bigsur = !bigsur; drawCircles(true); });
    bradleyBtn.on('click', function () { bradley = !bradley; drawCircles(true); });
    chualarBtn.on('click', function () { chualar= !chualar; drawCircles(true); });
    sanlucasBtn.on('click', function () { sanlucas= !sanlucas; drawCircles(true); });
    eastgarrisonBtn.on('click', function () { eastgarrison= !eastgarrison; drawCircles(true); });
    jolonBtn.on('click', function () { jolon= !jolon; drawCircles(true); });
    lockwoodBtn.on('click', function () { lockwood= !lockwood; drawCircles(true); });
    mosslandingBtn.on('click', function () { mosslanding= !mosslanding; drawCircles(true); });
    pajaroBtn.on('click', function () { pajaro= !pajaro; drawCircles(true); });
    parkfieldBtn.on('click', function () { parkfield= !parkfield; drawCircles(true); });
    pebblebeachBtn.on('click', function () { pebblebeach= !pebblebeach; drawCircles(true); });
    royaloaksBtn.on('click', function () { royaloaks= !royaloaks; drawCircles(true); });
    sanardoBtn.on('click', function () { sanardo= !sanardo; drawCircles(true); });
    castrovilleBtn.on('click', function () { castroville= !castroville; drawCircles(true); });
    toggleCitiesBtn.on('click', toggleCities);
}


var cityLayerGroup = L.layerGroup().addTo(map);

function displayCityBoundaries() {
    shp("Community_Codes/Community_Codes").then(function(geojson){
        //do something with your geojson
        console.log(geojson);
        for (var cityGeojson of geojson.features) {
            L.geoJson(cityGeojson, {
              style: {
                "color": "#999999",
                "weight": 3,
                "opacity": 0.5,
                "fillOpacity": 0.1
              },
              filter: function(feature, layer) {
                switch (feature.properties.NAME) {
                  case "GREENFIELD (CITY)": return greenfield;
                  case "MONTEREY (CITY)": return monterey;
                  case "PACIFIC GROVE (CITY)": return pacificGrove;
                  case "SALINAS (CITY)": return salinas;
                  case "SEASIDE (CITY)": return seaside;
                  case "SAND CITY (CITY)": return sandCity;
                  case "MARINA (CITY)": return marina;
                  case "GONZALES (CITY)": return gonzales;
                  case "SOLEDAD (CITY)": return soledad;
                  case "CARMEL (CITY)": return carmel;
                  case "KING CITY (CITY)": return kingCity;
                  case "DEL REY OAKS (CITY)": return delReyOaks;
                //   case "Prunedale": return prunedale;
                  case "CARMEL VALLEY": return carmelValley;
                  case "BIG SUR": return bigsur;
                  case "BRADLEY": return bradley;
                  case "CHUALAR": return chualar;
                  case "SAN LUCAS": return sanlucas;
                  case "EAST GARRISON": return eastgarrison;
                  case "JOLON": return jolon;
                  case "LOCKWOOD": return lockwood;
                  case "MOSS LANDING": return mosslanding;
                  case "PAJARO": return pajaro;
                  case "PARKFIELD": return parkfield;
                  case "PEBBLE BEACH": return pebblebeach;
                  case "ROYAL OAKS": return royaloaks;
                  case "SAN ARDO": return sanardo;
                  case "CASTROVILLE": return castroville;
                  case "PEBBLE BEACH": return pebblebeach;
                }
              }
            }).addTo(cityLayerGroup);
          }
	});
//   $.getJSON("Community_Codes.geojson", function(cityBoundaries) {
    // for (var cityGeojson of cityBoundaries.features) {
    //   L.geoJson(cityGeojson, {
    //     style: {
    //       "color": "#999999",
    //       "weight": 3,
    //       "opacity": 0.5,
    //       "fillOpacity": 0.1
    //     },
    //     filter: function(feature, layer) {
    //       switch (feature.properties.NAME) {
    //         case "Greenfield": return greenfield;
    //         case "Monterey": return monterey;
    //         case "Pacific Grove": return pacificGrove;
    //         case "Salinas": return salinas;
    //         case "Aromas": return aromas;
    //         case "Seaside": return seaside;
    //         case "Sand City": return sandCity;
    //         case "Marina": return marina;
    //         case "Gonzales": return gonzales;
    //         case "Soledad": return soledad;
    //         case "Carmel-by-the-Sea": return carmel;
    //         case "King City": return kingCity;
    //         case "Del Rey Oaks": return delReyOaks;
    //         case "Prunedale": return prunedale;
    //         case "Carmel Valley Village": return carmelValley;
    //         case "Big Sur": return bigsur;
    //         case "Bradley": return bradley;
    //         case "Chualar": return chualar;
    //         case "San Lucas": return sanlucas;
    //         case "East Garrison": return eastgarrison;
    //         case "Jolon": return jolon;
    //         case "Lockwood": return lockwood;
    //         case "Moss Landing": return mosslanding;
    //         case "Pajaro": return pajaro;
    //         case "Parkfield": return parkfield;
    //         case "Pebble Beach": return pebblebeach;
    //         case "Royal Oaks": return royaloaks;
    //         case "San Ardo": return sanardo;
    //         case "Castroville": return castroville;
    //         case "Del Monte Forest": return pebblebeach;
    //       }
    //     }
    //   }).addTo(cityLayerGroup);
    // }
//   });
}

// Load data from CSV
function adddata() {
    d3.csv('collisions_final_cleaned.csv')
        .then(function (data) {
            alldata = data.filter(e => e.lat !== "NA" && e.lon !== "NA");
            drawCircles(false);
        })
        .catch(function (error) { })
}

function toggleFilters() {
    isBikes = !isBikes;
    isPeds = !isPeds;
    isMotors = !isMotors;
    isTrucks = !isTrucks;
    isAlc = !isAlc;
    isOther = !isOther;
    bikeButton.property('checked', isBikes);
    pedButton.property('checked', isPeds);
    motorButton.property('checked', isMotors);
    truckButton.property('checked', isTrucks);
    alcButton.property('checked', isAlc);
    otherButton.property('checked', isOther);
    drawCircles(true);
}

function toggleHighways() {
    h0 = !h0;
    h1 = !h1;
    h2 = !h2;
    h3 = !h3;
    h4 = !h4;
    h5 = !h5;
    h6 = !h6;
    h7 = !h7;
    h0button.property('checked', h0);
    h1button.property('checked', h1);
    h2button.property('checked', h2);
    h3button.property('checked', h3);
    h4button.property('checked', h4);
    h5button.property('checked', h5);
    h6button.property('checked', h6);
    h7button.property('checked', h7);
    drawCircles(true);
}

function toggleCities() {
    unincorporated = !unincorporated;
    greenfield = !greenfield;
    monterey = !monterey;
    pacificGrove = !pacificGrove;
    salinas = !salinas;
    aromas = !aromas;
    seaside = !seaside;
    sandCity = !sandCity;
    marina = !marina;
    gonzales = !gonzales;
    soledad = !soledad;
    carmel = !carmel;
    kingCity = !kingCity;
    delReyOaks = !delReyOaks;
    prunedale = !prunedale;
    carmelValley = !carmelValley;
    bigsur= !bigsur;
    bradley= !bradley;
    chualar= !chualar;
    sanlucas= !sanlucas;
    eastgarrison= !eastgarrison;
    jolon= !jolon;
    lockwood= !lockwood;
    mosslanding= !mosslanding;
    pajaro = !pajaro;
    parkfield= !parkfield;
    pebblebeach= !pebblebeach;
    royaloaks = !royaloaks;
    sanardo= !sanardo;
    castroville = !castroville;
    unincorporatedBtn.property('checked', unincorporated);
    greenfieldBtn.property('checked', greenfield);
    montereyBtn.property('checked', monterey);
    pacificGroveBtn.property('checked', pacificGrove);
    salinasBtn.property('checked', salinas);
    aromasBtn.property('checked', aromas);
    seasideBtn.property('checked', seaside);
    sandCityBtn.property('checked', sandCity);
    marinaBtn.property('checked', marina);
    gonzalesBtn.property('checked', gonzales);
    soledadBtn.property('checked', soledad);
    carmelBtn.property('checked', carmel);
    kingCityBtn.property('checked', kingCity);
    delReyOaksBtn.property('checked', delReyOaks);
    prunedaleBtn.property('checked', prunedale);
    carmelValleyBtn.property('checked', carmelValley);
    bigsurBtn.property('checked',bigsur);
    bradleyBtn.property('checked',bradley);
    chualarBtn.property('checked',chualar);
    sanlucasBtn.property('checked',sanlucas);
    eastgarrisonBtn.property('checked',eastgarrison);
    jolonBtn.property('checked',jolon);
    lockwoodBtn.property('checked',lockwood);
    mosslandingBtn.property('checked',mosslanding);
    pajaroBtn.property('checked',pajaro);
    parkfieldBtn.property('checked',parkfield);
    pebblebeachBtn.property('checked',pebblebeach);
    royaloaksBtn.property('checked',royaloaks);
    sanardoBtn.property('checked',sanardo);
    castrovilleBtn.property('checked', castroville);
    drawCircles(true);
}

function cityfilter(d){
    var city = d.city_new.toUpperCase();
    if(city === 'OTHER UNINCORPORATED') {if(unincorporated) return true;}
    else if(city === 'GREENFIELD') {if(greenfield) return true;}
    else if(city === 'MONTEREY') {if(monterey) return true;}
    else if(city === 'PACIFIC GROVE') {if(pacificGrove) return true;}
    else if(city === 'SALINAS') {if(salinas) return true;}
    else if(city === 'SEASIDE') {if(seaside) return true;}
    else if(city === 'SAND CITY') {if(sandCity) return true;}
    else if(city === 'MARINA') {if(marina) return true;}
    else if(city === 'GONZALES') {if(gonzales) return true;}
    else if(city === 'SOLEDAD') {if(soledad) return true;}
    else if(city === 'CARMEL') {if(carmel) return true;}
    else if(city === 'KING CITY') {if(kingCity) return true;}
    else if(city === 'DEL REY OAKS') {if(delReyOaks) return true;}
    else if(city === 'PRUNEDALE') {if(prunedale) return true;}
    else if(city === 'CARMEL VALLEY') {if(carmelValley) return true;}
    else if(city === 'AROMAS') {if(aromas) return true;}
    else if(city === 'BIG SUR') {if(bigsur) return true;}
    else if(city === 'BRADLEY') {if(bradley) return true;}
    else if(city === 'CHUALAR') {if(chualar) return true;}
    else if(city === 'SAN LUCAS') {if(sanlucas) return true;}
    else if(city === 'EAST GARRISON') {if(eastgarrison) return true;}
    else if(city === 'JOLON') {if(jolon) return true;}
    else if(city === 'LOCKWOOD') {if(lockwood) return true;}
    else if(city === 'MOSS LANDING') {if(mosslanding) return true;}
    else if(city === 'PAJARO') {if(pajaro) return true;}
    else if(city === 'PARKFIELD') {if(parkfield) return true;}
    else if(city === 'PEBBLE BEACH') {if(pebblebeach) return true;}
    else if(city === 'ROYAL OAKS') {if(royaloaks) return true;}
    else if(city === 'SAN ARDO') {if(sanardo) return true;}
    else if(city === 'CASTROVILLE'){if(castroville) return true;}
    return false;
}

function hfilter(d) {
    // if (h0) return true;
    var loc = d.PRIMARY_RD;
    if (loc == '1') { if (h1) return cityfilter(d); }
    else if (loc === '25') { if (h2) return cityfilter(d); }
    else if (loc === '68') { if (h3) return cityfilter(d); }
    else if (loc === '101') { if (h4) return cityfilter(d); }
    else if (loc === '156') { if (h5) return cityfilter(d); }
    else if (loc === '183') { if (h6) return cityfilter(d); }
    else if (loc === '198') { if (h7) return cityfilter(d); }
    else if (h0) return cityfilter(d);
    return false;
}

function timeFilter(d) {
    return hfilter(d);
    var timestamp = (new Date(d.COLLISION_TIME.replace(/-/g, "/")).getTime());
    if (timestamp >= allRange.start && timestamp <= allRange.end) return hfilter(d);
    return false;
}


function sevfilter(d) {
    if (sev1v && d.COLLISION_SEVERITY === '1') return timeFilter(d);
    if (sev2v && d.COLLISION_SEVERITY === '2') return timeFilter(d);
    if (sev3v && d.COLLISION_SEVERITY === '3') return timeFilter(d);
    if (sev4v && d.COLLISION_SEVERITY === '4') return timeFilter(d);
    return false;
}

function filterdata(data) {
    // return data;
    var fDataTemp = data.slice();
    // console.log(fDataTemp);
    // return fDataTemp;
    fDataVal = fDataTemp.filter(d => {
        //if (+d.COLLISIO_2 < allRange[0] || +d.COLLISIO_2 > allRange[1]) return false;
        if (isBikes && d.BICYCLE_ACCIDENT === 'Y') return sevfilter(d);
        if (isPeds && d.PEDESTRIAN_ACCIDENT === 'Y') return sevfilter(d);
        if (isMotors && d.MOTORCYCLE_ACCIDENT === 'Y') return sevfilter(d);
        if (isTrucks && d.TRUCK_ACCIDENT === 'Y') return sevfilter(d);
        if (isAlc && d.ALCOHOL_INVOLVED === 'Y') return sevfilter(d);
        if (isOther && d.BICYCLE_ACCIDENT === 'N' &&
            d.PEDESTRIAN_ACCIDENT === 'N' &&
            d.MOTORCYCLE_ACCIDENT === 'N' &&
            d.TRUCK_ACCIDENT === 'N' &&
            d.ALCOHOL_INVOLVED === 'N') return sevfilter(d);
        return false;
    });
    return fDataVal;
}

// Add collision locations

var circleLayerGroup = L.layerGroup().addTo(map);
var fdata = [];

async function drawCircles(f) {

    circleLayerGroup.clearLayers();
    cityLayerGroup.clearLayers();
    displayCityBoundaries();
    if (f) fdata = filterdata(alldata);
    else fdata = alldata;

    // console.log(fdata);

    // if (!polygon.active) {
    pointTotalsCount(polygon.active ? "polygon" : "mapBounds");
    pointTotalsDisplay();
    // }

    // zoom = map.getZoom();
    // const radius = getRadius();

    for (const [idx, d] of fdata.entries()) {

        var color = (() => {
            if (!isColors) return 'gray';
            return colormap(d.COLLISION_SEVERITY)
        })();

        var coords = {
            "lat": parseFloat(d.lat),
            "lon": parseFloat(d.lon)
        };
        var circle = L.circleMarker(coords, {
            color: color,
            fillColor: color,
            radius: 3.5,
            opacity: 0,
            fillOpacity: 0.7,
        })
            .bindPopup(`<p>
        Type:
        ${(() => {
                    switch (d.TYPE_OF_COLLISION) {
                        case "A": return "Head-on";
                        case "B": return "Sideswipe";
                        case "C": return "Rear End";
                        case "D": return "Broadside";
                        case "E": return "Hit Object";
                        case "F": return "Overturned";
                        case "G": return "Vehicle/Pedestrian";
                        case "H": return "Other";
                        default: return "Type Not Stated";
                    }
                })()}
        <br>
        ${(d.PEDESTRIAN_ACCIDENT === "Y") ? "Pedestrian involved<br>" : ""}
        ${(d.BICYCLE_ACCIDENT === "Y") ? "Bicycle involved<br>" : ""}
        ${
                (() => {
                    if (d.COLLISION_SEVERITY === '1') return "Fatal injury"
                    else if (d.COLLISION_SEVERITY === '2') return "Severe injury"
                    else if (d.COLLISION_SEVERITY === '3') return "Other Visible Injury"
                    else return "Complaint of Pain"
                })()
                }
        <br>
        ${d.COLLISION_DATE}
        </p>`)
            .addTo(circleLayerGroup);

    }

}

function coordInPolygon(coord, polyPoints) {
    var x = coord.lat, y = coord.lon;
    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
        var xj = polyPoints[j].lat, yj = polyPoints[j].lng;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
};

function pointTotalsCount(rangeType = "mapBounds") {

    pointTotals = {
        total: 0,
        sev: [0, 0, 0, 0]
    };

    if (rangeType === "mapBounds") {

        const bounds = map.getBounds();

        for (const [idx, d] of fdata.entries()) {
            var coords = {
                "lat": parseFloat(d.lat),
                "lon": parseFloat(d.lon)
            };
            if (bounds.contains(coords)) {
                pointTotals.sev[d.COLLISION_SEVERITY - 1]++;
            }
        }

    }

    else if (rangeType === "polygon") {

        const polyPoints = polygon.points;

        for (const [idx, d] of fdata.entries()) {
            var coords = {
                "lat": parseFloat(d.lat),
                "lon": parseFloat(d.lon)
            };
            if (coordInPolygon(coords, polyPoints)) {
                pointTotals.sev[d.COLLISION_SEVERITY - 1]++;
            }
        }

    }

    pointTotals.total = pointTotals.sev.reduce((a, b) => { return a + b });

}

function pointTotalsDisplay() {
    $('#sumall').html(pointTotals.total);
    for (var idx in pointTotals.sev) {
        $(`#sum${parseInt(idx) + 1}`).html(`(${pointTotals.sev[parseInt(idx)]})`);
    }
}

// function zoomFxn() {
//     map.on("zoomend", function (e) { drawCircles(true); });
// }

function panFxn() {
    map.on("moveend", function () {
        if (!polygon.active) {
            pointTotalsCount();
            pointTotalsDisplay();
        }
    });
}

// function getRadius() {
//     var calculatedRadius = (zoom <= zoomInit) ? radiusInit : radiusInit / Math.pow((zoom - zoomInit), 1.75);
//     return (calculatedRadius >= radiusInit) ? radiusInit : calculatedRadius;
// }

function pointTotalsCountDisplay() {
    const rangeType = (polygon.active) ? "polygon" : "mapBounds";
    pointTotalsCount(rangeType);
    pointTotalsDisplay();
}

function removePolygon() {
    map.removeLayer(polygon.layer);
    polygon.active = false;
    polygon.completed = false;
    pointTotalsCountDisplay();
}

function addDraw() {
    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    var drawPluginOptions = {
        position: 'topleft',
        draw: {
            // disable toolbar item by setting it to false
            polygon: {
                allowIntersection: true,
                drawError: {
                    color: '#e1e100',
                    message: 'You cannot draw that'
                },
                shapeOptions: {
                    color: '#97009c'
                }
            },
            polyline: false,
            circle: false, // Turns off this drawing tool
            rectangle: true,
            marker: false,
        },
        edit: {
            featureGroup: editableLayers,
            remove: false,
            edit: false
        }
    };

    L.easyButton('<span class="map-button-icon-wrapper button-state state-unnamed-state unnamed-state-active"><span class="fa fa-trash" aria-hidden="true"></span></span>', function () {
        removePolygon();
    }).addTo(map);

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw(drawPluginOptions);
    map.addControl(drawControl);

    var editableLayers = new L.FeatureGroup();
    map.addLayer(editableLayers);

    map.on('draw:drawvertex', e => {
        if (polygon.completed) removePolygon()
    });

    // map.on('draw:edited', e => {
    //     if(polygon.completed)
    // });

    map.on('draw:created', function (e) {

        polygon.active = false;
        var targetLayer = e.layer;
        editableLayers.addLayer(targetLayer);

        if (targetLayer instanceof L.Rectangle) {
            map.removeLayer(targetLayer);
            zoomToBox([e.layer._bounds._northEast, targetLayer._bounds._southWest]);
        }

        else if (targetLayer instanceof L.Polygon) {
            polygon.active = true;
            polygon.completed = true;
            polygon.layer = targetLayer;
            polygon.points = targetLayer._latlngs[0]
            pointTotalsCountDisplay();
        }

    });
}

function zoomToBox(coords) {
    map.fitBounds([
        [coords[0].lat, coords[0].lng],
        [coords[1].lat, coords[1].lng]
    ]);
}

function rangeSlider(defaultVal = [startDate, endDate]) {

    var formatDate = d3.timeFormat("%b %Y");

    const days = offset / (1000 * 60 * 60 * 24);

    var dataTime = d3.range(0, days).map(d => {
        var date = new Date(startUnix);
        date.setDate(date.getDate() + d);
        return date;
    });

    var sliderRange = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1)
        .width($(".sidebar-col").width() - Math.max(100, $(".sidebar-col").width()*0.4))
        .ticks(3)
        .tickFormat(formatDate)
        .default(defaultVal)
        .fill('#2196f3')
        .on('onchange', val => {
            if (typeof val[0] === "number") allRange.start = val[0];
            if (typeof val[1] === "number") allRange.end = val[1];
            drawCircles(alldata);
            // updatedCircles.exit().remove();
        });

    var gRange = d3
        .select('div#slider')
        .append('svg')
        .style('margin-top', -20)
        .style('overflow', 'visible')
        // .attr('width', $(".sidebar-col").width() - 100)
        .attr('height', 80)
        .append('g')
        .attr('transform', 'translate(30,30)');
    gRange.call(sliderRange);

    d3.select(window).on('resize', () => {
        $("div#slider").html("");
        rangeSlider([allRange.start, allRange.end]);
        // sliderRange.width($(".sidebar-col").width() - 100);
    });

}

function blockSeverity() {

}
