### Obesity Prevalence Map, 1990-2013

#### What is the story here?
Obesity rates have risen globally in the last 24 years. But, what does that really look like?  
This geospatial data visualization allows the user to walk through 24 years of obesity data from the [Global Burden of Disease Study 2013](http://ghdx.healthdata.org/record/global-burden-disease-study-2013-gbd-2013-obesity-prevalence-1990-2013).  
  
This visualization was built with user experience at the forefront. The user is given the ability to explore data by gender, age, year and "metric" (i.e. obese or overweight). Additionally, the user can toggle the slideshow setting to cycle through the years automatically. This might be useful if the user is, for example, a researcher giving a presentation. The researcher can wander the stage or classroom as the data continues to update behind them.  
  
#### That is a ton of data! How did you account for that?
Yes, the original CSV file had nearly 600,000 rows and was 57.7 MB. Which meant, in the worst case, if you wanted to look up the mean value for 175 countries you would have to do 105,000,000 lookups. That is too many lookups.  
  
My solution was to create a JSON file, with a slightly smaller footprint (38.3 MB), that would take advantage of JavaScript's object property lookups. The file is not overly descriptive, but it cut the worst-case lookups down to 20,000.  
  
#### Now that the user has the data, is it available offline or cached on their device?
Ideally, yes! This visualization uses Service Workers to store files in Cache Storage. If the user's browser has enabled Service Workers, then the visualization will run as intended on or offline.  
  
#### Where can I find this visualization?
It is available at [https://sarafec.github.io/obesity-map/](https://sarafec.github.io/obesity-map/).  
  
JavaScript Libraries Used: d3.js   
  

![a gif](https://raw.githubusercontent.com/sarafec/obesity-map/master/obesity.gif)