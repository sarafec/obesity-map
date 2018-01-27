
/** DATA FILE REQUEST **/
// note - service workers don't use xhr, but browsers without the fetch api
// need xhr. This is the workaround.
if(window.fetch){
	// fetch api
	fetch('obesity.json').then(function(response){
		return response.json();
	}).then(function(data){
		loadMapElems(data);
	}).catch(function(err){
		console.log('The data file did not load. Please refresh the page.');
	});
} else {
	// xhr
	d3.json('obesity.json', function(error, data) {
		if(error) {
			console.log('The data file did not load. Please refresh the page.');
		}
		loadMapElems(data);
	});
}

function loadMapElems(data) {
	// load data into object in constant module
	constant.obesityObj = data;
	// draw svg elements to screen
	draw.map();
	draw.year();
	draw.range();
}


/** CONSTANT MODULE **/
// contains constants that are used throughout the application
let constant = function() {
	let mapSvg = d3.select('svg');
	let mapMargin = {top: 0, right: 0, bottom: 0, left: 0};
	let mapWidth = mapSvg.attr('width') - mapMargin.left - mapMargin.right;
	let mapHeight = mapSvg.attr('height') - mapMargin.top - mapMargin.bottom;
	let obesityObject = {};

	return {
		//public variables - constants
		svg: mapSvg,
		obesityObj: obesityObject
	};
}();

/** UI CONTROLS MODULE **/
// contains ui controls and their update methods
let uiControls = function() {
	let uiGender = 'both';
	let uiMetric = 'obese';
	let uiAge = '38';
	let uiYear = 1990;
	let uiSlideshow = 'off';

	function updateUIGender(evt) {
		let genderArea = document.querySelector('.gender-settings');

		// remove .selcted (class) from previous control selection
		for(let i = 0; i < genderArea.children.length; i++){
			if(genderArea.children[i].classList.contains('selected')) {
				genderArea.children[i].classList.remove('selected');
			}
		}

		// add .selcted (class) to user selected gender button
		let selectedBtn = evt.target;
		selectedBtn.classList.add('selected');
		// update ui control
		uiControls.gender = selectedBtn.dataset.gender;
		//kick off fill function using new gender criteria
		fill.updateColor();
	}

	function updateUIMetric(evt) {
		let metricArea = document.querySelector('.category-settings');

		// remove .selcted (class) from previous control selection
		for(let i = 0; i < metricArea.children.length; i++){
			if(metricArea.children[i].classList.contains('selected')) {
				metricArea.children[i].classList.remove('selected');
			}
		}

		// add .selcted (class) to user selected metric button
		let selectedBtn = evt.target;
		selectedBtn.classList.add('selected');
		// update global ui control
		uiControls.metric = selectedBtn.dataset.metric;

		//kick off fill function using new metric criteria
		fill.updateColor();
	}

	function updateUIAge(evt) {
		let ageSelect = document.querySelector('.age-select');
		let selectedIndex = ageSelect.selectedIndex;
		// update global ui control
		uiControls.age = evt.target[selectedIndex].dataset.age;

		//kick off fill function using new age criteria
		fill.updateColor()
	}

	function updateUIYear(evt) {
		let yearOnMap = document.querySelector('.year-display');
		let direction = evt.target.dataset.yearSettings;
		// change year in ui and call fill function based on direction selected
		if(direction) {
			if(direction === 'forward') {
				if(uiControls.year === 2013) {
					uiControls.year = 1990;
				} else {
					uiControls.year++;
				}
			} else if (direction === 'backward') {
				if(uiControls.year === 1990) {
					uiControls.year = 2013;
				} else {
					uiControls.year--;
				}
			}

			yearOnMap.textContent = uiControls.year;
			fill.updateColor();
		}
	}

	function updateUISlideshow(evt) {
		let slideshowArea = document.querySelector('.slideshow-settings');
		// remove .selcted (class) from previously selected slideshow button
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
			uiControls.slideshow = selectedBtn.dataset.slideshow;
		}

		// start slideshow while on button is selected
		if(uiControls.slideshow === 'on' && !slideshow.isPlaying) {
			slideshow.isPlaying = true;
			slideshow.play();
		}
	}

	function updateUIRange(evt) {
		let selectedRangeIndex = evt.target.dataset.range;

		highlight.setRanges(selectedRangeIndex);
	}

	return {
		// public variables - ui controls
		gender: uiGender,
		metric: uiMetric,
		age: uiAge,
		year: uiYear,
		slideshow: uiSlideshow,

		// public methods - update ui controls
		updateGender: updateUIGender,
		updateMetric: updateUIMetric,
		updateAge: updateUIAge,
		updateYear: updateUIYear,
		updateSlideshow: updateUISlideshow,
		updateRange: updateUIRange

	};
}();

/** SLIDESHOW MODULE **/
// contains variables and methods related to cycling through the years 
let slideshow = function() {
	let isSlideshowPlaying = false;

	// cycle years on map
	function playSlideshow() {
		let yearOnMap = document.querySelector('.year-display');

		let playYears = window.setInterval(function() {
			// if on button is selected, cycle through the years
			if(uiControls.slideshow === 'on') {
				if(uiControls.year < 2013) {
					uiControls.year++;
					yearOnMap.textContent = uiControls.year;
					fill.updateColor();
				} else {
					uiControls.year = 1990;
					yearOnMap.textContent = uiControls.year;
					fill.updateColor();
				}
			// if off button is selected, clear interval
			} else {
				resetSlideshow();
				clearInterval(playYears);
			}
		}, 1000);
	}

	// when off button is selected, reset isPlaying value to false
	function resetSlideshow() {
		slideshow.isPlaying = false;
	}

	return {
		// public variable and methods for play functionality
		isPlaying: isSlideshowPlaying,
		play: playSlideshow

	}
}();


/** HIGHLIGHT MODULE **/
// contains variables and methods related to selections in the range area elements
let highlight = function() {
	// this array will change based on the range selection chosen
	let rangesSelected = [true, true, true, true, true, true, true, true, true, true];

	function setSelectedRanges(index) {
		// if all are selected - return only the selected range element
		if(findTotalSelected() === 10) {
			for(let i = 0; i < rangesSelected.length; i++) {
				rangesSelected[i] = false;
			}
		}

		// toggle current value for the index provided via the rangeArea click event
		rangesSelected[index] = !rangesSelected[index];

		// if none are selected - return all the range elements
		// note: the first for loop and this for loop cannot be combined because the click event must make its changes
		// either before or after for the desired effect to take place
		if(findTotalSelected() === 0) {
			for(let i = 0; i < rangesSelected.length; i++) {
				rangesSelected[i] = true;
			}
		}
	
		// update fill within range elem
		fill.updateColor();
		fill.updateRange();
	}

	// reduces the rangesSelected array down to check if all ranges are selected(10) or no ranges are selected (0)
	function findTotalSelected() {
		let sumSelected = rangesSelected.reduce(function(a,b) {
			return a + b;
		});

		return sumSelected;
	}

	return {
		// public method for range selection functionality
		selected: rangesSelected,
		setRanges: setSelectedRanges
	}
}();

/** DRAW MODULE **/
// contains methods to draw svg elements to screen
let draw = function() {
	// helper methods - for drawing geojson
	let projection = d3.geoMercator()
			.scale(90)
			.translate([290,300]);

	let path = d3.geoPath()
			.projection(projection);

	// fetch request global path data
	function loadMap() {
		if(window.fetch){
			// fetch api
			fetch('world.geo.json').then(function(response){
				return response.json();
			}).then(function(map){
				drawMap(map);
			});
		} else {
			// xhr
			d3.json('world.geo.json', function(error, map){
				drawMap(map);
			});
		}
	}

	// private method - draw map using geo json data
	function drawMap(map) {
		let features = map.features;
		let g = constant.svg.append('g').attr('class', 'map-area');

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
			.attr('fill', function(d, i) { return fill.setColor(features[i].properties.country_id); })
			.on('mouseover', function(d) { return tooltip.element.style('visibility', 'visible'); })
			.on('mousemove', function(d, i) { return tooltip.element.style('top', (d3.event.pageY - 10) + 'px').style('left', (d3.event.pageX + 10) + 'px').html(tooltip.getText(d)); })
			.on('mouseout', function(d) { return tooltip.element.style('visibility', 'hidden'); });

		// remove css loading animation
		removeLoading();
	}

	function drawYear() {
		let yearControls = d3.select('.year-settings');
		yearControls.append('text')
			.attr('class', 'year-backwards')
			.attr('data-year-settings', 'backward')
			.text('‹');
		yearControls.append('text')
			.attr('class', 'year-display')
			.text(uiControls.year);
		yearControls.append('text')
			.attr('class', 'year-forwards')
			.attr('data-year-settings', 'forward')
			.text('›');
	}

	function drawRange() {
		let rangeElem = d3.select('.range-elem');
		let colors = ['#006837', '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43', '#d73027', '#a50026'];
		let range = ['5', '10', '15', '20', '25', '30', '35', '40', '45+'];

		rangeElem.selectAll('rect')
			.data(colors)
			.enter()
			.append('rect')
			.attr('height', '20px')
			.attr('width', '60px')
			.attr('data-range', function(d,i) { return i; })
			.attr('fill', function(d,i) { return d; })
			.attr('transform', function(d,i) { return 'translate(' + i * 60 + ', 0)'; } )
		rangeElem.selectAll('text')
			.data(range)
			.enter()
			.append('text')
			.attr('transform', function(d,i) { return 'translate(' + (60 * (i + 1) - 6)  + ', 12)'; } )
			.text(function(d,i) { return range[i]; })
			.style('font-family', 'sans-serif')
			.style('font-size', '12px')
			.style('font-weight', 'bold')
			.style('user-select', 'none');
	}

	// private method - remove loading css animation
	function removeLoading() {
		let loadingElem = document.querySelector('.loading-animation');
		loadingElem.style.display = 'none';
	}

	return {
		// public methods - draw svg elements
		map: loadMap,
		year: drawYear,
		range: drawRange
	}
}();

/** FILL MODULE **/
// contains methods to set the fill of svg path elements within the map
let fill = function(countryId) {

	// set initial fill for map's path elements
	function setFillColor(countryId) {
		if (countryId === 999) {
			return '#D3D3D3';
		} else {
			let values = constant.obesityObj[countryId][uiControls.year];

				for(let j = 0; j < values.length; j++) {
					if(values[j].gender === uiControls.gender && values[j].age === uiControls.age && values[j].metric === uiControls.metric) {
						return determineFillColor(values[j].mean);
					}
				}
		}
	}

	// update country fill value by traversing the map's path elements
	// and traversing the dataset by initial filtering by country and year
	function updateFillColor() {
		let mapArea = document.querySelector('.map-area');
		for(let i = 0; i < mapArea.children.length; i++) {
			let countryId = mapArea.children[i].getAttribute('class');

			if(countryId === '999') {
				mapArea.children[i].setAttribute('fill', '#D3D3D3');
			} else {
				let values = constant.obesityObj[countryId][uiControls.year];

				for(let j = 0; j < values.length; j++) {
					if(values[j].gender === uiControls.gender && values[j].age === uiControls.age && values[j].metric === uiControls.metric) {
						mapArea.children[i].setAttribute('fill', determineFillColor(values[j].mean))
					}
				}
			}
		}
	}

	// private method - determine fill value based on country's mean value 
	function determineFillColor(mean) {
		let realNum = +(mean * 100).toFixed(1);

		// defines what index in the highlight.selected array realNum would be represented
		let rangeIndex;

		if(realNum > 45) {
			rangeIndex = 9;
		} else {
			rangeIndex = Math.floor(realNum/5);
		}

		if(highlight.selected[rangeIndex]) {
			switch(true) {
				case realNum >= 0 && realNum <= 4.9:
				return '#006837';
				case realNum >= 5 && realNum <= 9.9:
				return '#1a9850';
				case realNum >= 10 && realNum <= 14.9:
				return '#66bd63';
				case realNum >= 15 && realNum <= 19.9:
				return '#a6d96a';
				case realNum >= 20 && realNum <= 24.9:
				return '#d9ef8b';
				case realNum >= 25 && realNum <= 29.9:
				return '#fee08b';
				case realNum >= 30 && realNum <= 34.9:
				return '#fdae61';
				case realNum >= 35 && realNum <= 39.9:
				return '#f46d43';
				case realNum >= 40 && realNum <= 44.9:
				return '#d73027';
				case realNum >= 45:
				return '#a50026';
				default:
				return '#D3D3D3';
			}				
		}

		return '#D3D3D3';
	}

	function updateRangeFill(selectedRanges) {
		// array of range colors
		let colors = ['#006837', '#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43', '#d73027', '#a50026'];
		// array-like object (HTMLCollection) of range elements
		let rangeElems = document.querySelector('.range-elem').children;

		// fill range element if highlight.selected array is true
		for(let i = 0; i < highlight.selected.length; i++) {
			if(highlight.selected[i]) {
				rangeElems[i].setAttribute('style', 'fill: ' + colors[i]);
			} else {
				rangeElems[i].setAttribute('style', 'fill: #D3D3D3');
			}
		} 
	}

	return {
		// public methods - set and update the fill of country paths
		setColor: setFillColor,
		updateColor: updateFillColor,
		updateRange: updateRangeFill
	};
}();

/** TOOLTIP MODULE **/
// contains tooltip element definition and a method to update tooltip data
let tooltip = function() {
	let elementDef = d3.select('.map-panel')
			.append('div')
			.attr('class', 'tooltip')
			.style('position', 'absolute')
			.style('z-index', '10')
			.style('visibility', 'hidden');

	function getTooltipText(data) {
		let countryName = data.properties.country_name;
		let countryId = data.properties.country_id;
		let meanVal;

		// get mean values for countries
		if(countryId === 999) {
				return 'Country: ' + countryName + '<br>' + 'No data available';
		} else {
			let values = constant.obesityObj[countryId][uiControls.year];

			for(let i = 0; i < values.length; i++) {
				if(values[i].gender === uiControls.gender && values[i].age === uiControls.age && values[i].metric === uiControls.metric) {
					// define mean value to the first decimal
					meanVal = (values[i].mean * 100).toFixed(1);
				}
			}
		}

		return 'Country: ' + countryName + '<br>' + 'Prevalence: ' + meanVal + '%';
	}

	return {
		// public variables - tooltip html element
		element: elementDef,

		// public methods - update tooltip data
		getText: getTooltipText
	};
}();

/** UI EVENTS **/
(function setEventListeners(){

	// gender control area
	let genderArea = document.querySelector('.gender-settings');
	genderArea.addEventListener('click', uiControls.updateGender);

	// metric control area
	let metricArea = document.querySelector('.category-settings');
	metricArea.addEventListener('click', uiControls.updateMetric);

	// slideshow control area
	let slideshowArea = document.querySelector('.slideshow-settings');
	slideshowArea.addEventListener('click', uiControls.updateSlideshow);

	// age control area
	let ageArea = document.querySelector('.age-settings');
	ageArea.addEventListener('change', uiControls.updateAge);

	// year control area
	let yearArea = document.querySelector('.year-settings');
	yearArea.addEventListener('click', uiControls.updateYear);

	// range control area
	let rangeArea = document.querySelector('.range-elem');
	rangeArea.addEventListener('click', uiControls.updateRange)

}());

/** REGISTER SERVICE WORKER **/
(function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/obesity-map/service-worker.js', { scope: '/obesity-map/'})
		.then(function(reg) {

			// feedback on service worker installation process
			if (reg.installing) {
				console.log('Service worker installing');
			} else if (reg.waiting) {
				console.log('Service worker installed');
			} else if (reg.active) {
				console.log('Service worker active');
			}

		}).catch(function(error) {
			console.log('Registration failed - ' + error);
		});
	}
}());