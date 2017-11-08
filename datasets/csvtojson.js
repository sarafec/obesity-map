let obesityObj = {};

// load obesity csv 
d3.csv('obesity.csv', function(error, data) {
	parseObesityData(data);
});

create obesityObj from csv data
function parseObesityData(data) {
	let dataLength = data.length;
	let gender, age, metric, mean;

	// cycle through csv and push key data into obesityObj
	for (let i = 0; i < dataLength; i++) {
		let location = data[i].location_id;
		let year = data[i].year;
		let newEntry = { gender: data[i].sex, age: data[i].age_group_id, metric: data[i].metric, mean: data[i].mean };

		if(obesityObj[location]) {
			obesityObj[location][year].push(newEntry);
		} else {
			obesityObj[location] = { 1990: [], 1991: [], 1992: [], 1993: [], 1994: [], 1995: [], 1996: [], 1997: [], 1998: [], 
				1999: [], 2000: [], 2001: [], 2002: [], 2003: [], 2004: [], 2005: [], 2006: [], 2007: [], 2008: [], 2009: [],
				2010: [], 2011: [], 2012: [], 2013: [] };
			obesityObj[location][year].push(newEntry);
		}
	}

	// let result = document.querySelector('.json-result');
	// result.textContent = JSON.stringify(obesityObj);
}