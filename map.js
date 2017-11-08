/** APP CONSTANTS **/
let obesityObj = {};

// ui constants
let uiControlGender = 'male';
let uiControlMetric = 'obese';
let uiControlAge = '38';
let uiControlYear = 1990;
let uiControlSlideShow = 'off';

// margin conventions
let svg = d3.select('svg'),
		margin = {top: 0, right: 0, bottom: 0, left: 0},
		width = svg.attr('width') - margin.left - margin.right,
		height = svg.attr('height') - margin.top - margin.bottom,
		g = svg.append('g').attr('class', 'map-area').attr('transform', 'translate(' + margin.left + ',' +margin.top + ')');


/** XHR REQUEST **/
// http request for obesity data file
d3.json('obesity.json', function(error, data) {
	obesityObj = data;
	drawMap();
});

/** DRAW METHODS **/
// helper geo methods for drawing country paths
let projection = d3.geoMercator()
	.scale(90)
	.translate([290,300]);

let path = d3.geoPath()
	.projection(projection);

// load geo json and draw country paths
function drawMap() {
	d3.json('world2.geo.json', function(error, map) {
	let features = map.features;

	g.selectAll('path')
		.data(features)
		.enter()
		.append('path')
		// draw country path from csv geo data
		.attr('d', function(d) { return path(d) })
		// add country id from csv geo property data
		.attr('class', function(d,i) { return features[i].properties.country_id})
		.attr('stroke', 'lightgrey')
		.attr('stroke-width', .5)
		// set initial fill value based on country idea and ui controls
		.attr('fill', function(d, i) { return setFill(features[i].properties.country_id); })
		.on('mouseover', function(d) { return tooltip.style('visibility', 'visible'); })
		.on('mousemove', function(d, i) { return tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px').html(getTooltipText(d)) })
		.on('mouseout', function(d) { return tooltip.style('visibility', 'hidden'); });
	});
}

/** FILL METHODS **/
// set initial fill values in map
function setFill(countryId) {
	if (countryId === 999) {
		return '#D3D3D3';
	} else {

		let values = obesityObj[countryId][uiControlYear];

			for(let j = 0; j < values.length; j++) {
				if(values[j].gender === uiControlGender && values[j].age === uiControlAge && values[j].metric === uiControlMetric) {
					return determineFillColor(values[j].mean);
				}
			}
	}
}

// update country fill value by traversing the map's path elements
// and traversing the dataset with initial filtering by country and year
// note - this is an improvement to traversing inital data set (150 mil lookups down to 60k), can we make it better?
function updateFill() {
	let mapArea = document.querySelector('.map-area');
	console.log(mapArea.children.length);
	for(let i = 0; i < mapArea.children.length; i++) {
		let countryId = mapArea.children[i].getAttribute('class');

		if(countryId === '999') {
			mapArea.children[i].setAttribute('fill', '#D3D3D3');
		} else {
			let values = obesityObj[countryId][uiControlYear];

			for(let j = 0; j < values.length; j++) {
				if(values[j].gender === uiControlGender && values[j].age === uiControlAge && values[j].metric === uiControlMetric) {
					mapArea.children[i].setAttribute('fill', determineFillColor(values[j].mean))
				}
			}
		}
	}
}

// determine fill color using mean value
function determineFillColor(mean) {
	let realNum = +(mean * 100).toFixed(1);

	switch(true) {
		case realNum >= 0 && realNum <= 5:
		return '#006837';
		case realNum >= 5.1 && realNum <= 10:
		return '#1a9850';
		case realNum >= 10.1 && realNum <= 15:
		return '#66bd63';
		case realNum >= 15.1 && realNum <= 20:
		return '#a6d96a';
		case realNum >= 20.1 && realNum <= 25:
		return '#d9ef8b';
		case realNum >= 25.1 && realNum <= 30:
		return '#fee08b';
		case realNum >= 30.1 && realNum <= 35:
		return '#fdae61';
		case realNum >= 35.1 && realNum <= 40:
		return '#f46d43';
		case realNum >= 40.1 && realNum <= 45:
		return '#d73027';
		case realNum >= 45.1:
		return '#a50026';
		default:
		return '#D3D3D3';
	}

}

/** TOOLTIP METHODS **/
// define tooltip element
let tooltip = d3.select('.map-panel')
	.append('div')
	.attr('class', 'tooltip')
	.style('position', 'absolute')
	.style('z-index', '10')
	.style('visibility', 'hidden');

// define tooltip text based on given data
function getTooltipText(data) {
	let countryName = data.properties.country_name;
	let countryId = data.properties.country_id;
	let meanVal;

	// get mean values for countries
	if(countryId === '999') {
			return 'Country: ' + countryName + '<br>' + 'No data available';
	} else {
		let values = obesityObj[countryId][uiControlYear];

		for(let i = 0; i < values.length; i++) {
			if(values[i].gender === uiControlGender && values[i].age === uiControlAge && values[i].metric === uiControlMetric) {
				// define mean value to the first decimal
				meanVal = (values[i].mean * 100).toFixed(1);
			}
		}
	}
	
	return 'Country: ' + countryName + '<br>' + 'Prevalence: ' + meanVal + '%';
}

/** UI EVENTS **/
(function setEventListeners(){

	// gender area
	let genderArea = document.querySelector('.gender-settings');
	genderArea.addEventListener('click', updateGenderControl);
	genderArea.addEventListener('focus', updateGenderControl);
	genderArea.addEventListener('touchend', updateGenderControl);

	// metric area
	let metricArea = document.querySelector('.category-settings');
	metricArea.addEventListener('click', updateMetricControl);
	metricArea.addEventListener('focus', updateMetricControl);
	metricArea.addEventListener('touchend', updateMetricControl);

	// slideshow area
	let slideshowArea = document.querySelector('.slideshow-settings');
	slideshowArea.addEventListener('click', updateSlideshowControl);
	slideshowArea.addEventListener('focus', updateSlideshowControl);
	slideshowArea.addEventListener('touchend', updateSlideshowControl);

	// age area
	let ageArea = document.querySelector('.age-settings');
	ageArea.addEventListener('change', updateAgeControl);

}());

function updateAgeControl(evt) {
	let ageSelect = document.querySelector('.age-select');
	let selectedIndex = ageSelect.selectedIndex;
	// update global ui control
	uiControlAge = evt.target[selectedIndex].dataset.age;

	//kick off fill function using new age criteria
	updateFill();
};


function updateGenderControl(evt) {
	let genderArea = document.querySelector('.gender-settings');

	// remove selected class from previous control
	for(let i = 0; i < genderArea.children.length; i++){
		if(genderArea.children[i].classList.contains('selected')) {
			genderArea.children[i].classList.remove('selected');
		}
	}

	// add class selcted to user selected gender button
	let selectedBtn = evt.target;
	selectedBtn.classList.add('selected');
	// update global ui control
	uiControlGender = selectedBtn.dataset.gender;

	//kick off fill function using new gender criteria
	updateFill();
}

function updateMetricControl(evt) {
	let metricArea = document.querySelector('.category-settings');

	// remove selected class from previous control
	for(let i = 0; i < metricArea.children.length; i++){
		if(metricArea.children[i].classList.contains('selected')) {
			metricArea.children[i].classList.remove('selected');
		}
	}

	// add class selcted to user selected metric button
	let selectedBtn = evt.target;
	selectedBtn.classList.add('selected');
	// update global ui control
	uiControlMetric = selectedBtn.dataset.metric;

	//kick off fill function using new metric criteria
	updateFill();
}


function updateSlideshowControl(evt) {
	let slideshowArea = document.querySelector('.slideshow-settings');

	// add class selcted to user selected metric button
	let selectedBtn = evt.target;
	if(selectedBtn.tagName === 'BUTTON') {
		// remove selected class from previous control
		for(let i = 0; i < slideshowArea.children.length; i++){
			if(slideshowArea.children[i].classList.contains('selected')) {
				slideshowArea.children[i].classList.remove('selected');
			}
		}

		// add selected class to current control
		selectedBtn.classList.add('selected');
		uiControlSlideShow = selectedBtn.dataset.slideshow;
	}

	// start slideshow while on button is selected
	if(uiControlSlideShow === 'on') {
		startSlideshow();
	}

}

function startSlideshow() {
	let yearOnMap = document.querySelector('.current-year');
	let slideshow = window.setInterval(function() {
		// if on button is selected, cycle through the years
		if(uiControlSlideShow === 'on') {
			if(uiControlYear < 2013) {
				uiControlYear++;
				yearOnMap.textContent = uiControlYear;
				updateFill();
			} else {
				uiControlYear = 1990;
				yearOnMap.textContent = uiControlYear;
				updateFill();
			}
		// if off button is selected, clear interval
		} else {
			clearInterval(slideshow);
		}
	}, 1000);

}


//todo
// 1 - add zoom to map
// 2 - add color range element (svg)
// 3 - modify year elements (svg)
// 4 - add loading animation

// loading - https://codepen.io/woodwork/pen/YWjWzo
// loading - https://codepen.io/magnus16/pen/BKoRNw
