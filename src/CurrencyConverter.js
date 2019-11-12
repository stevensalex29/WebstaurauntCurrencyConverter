// The HTTP Request object
const Http = new XMLHttpRequest();
// The current conversion rate
let conversionRate = 0;
// The conversion select object
let conversionSelect = document.getElementById("convertSelect");
// The base select object
let baseSelect = document.getElementById("baseSelect");
// The base input field
let baseInput = document.getElementById('baseAmount');
// The conversion input field
let conversionInput = document.getElementById('convertAmount');
// The past selected value of base select
let pastBSelected = baseSelect.value;
// The past selected value of conversion select
let pastCSelected = conversionSelect.value;

// Initialize window with USD to Euro conversion
window.onload = (e)=>{
	document.getElementById('baseAmount').value = 1;
	document.getElementById('convertAmount').value = 0.91;
	let url = "https://api.exchangeratesapi.io/latest?base=USD&symbols=EUR"
	Http.open("GET",url);
	Http.send();
}




// ONCHANGE EVENTS/FUNCTIONS
// Calls the API when base currency is changed
baseSelect.onchange = (e)=>{
	let pastIndex = findIndexOfOption(baseSelect,pastBSelected);
	if(isNaN(baseInput.value) || isNaN(conversionInput.value) || 
		conversionInput.value == "" || baseInput.value == ""){
		baseSelect.selectedIndex = pastIndex;
	}else{
		selectAPICall(conversionSelect,pastIndex);
	}
}
// Calls the API when conversion currency is changed
conversionSelect.onchange = (e)=>{
	let pastIndex = findIndexOfOption(conversionSelect,pastCSelected);
	if(isNaN(conversionInput.value) || isNaN(baseInput.value)|| 
		conversionInput.value == "" || baseInput.value == ""){
		conversionSelect.selectedIndex = pastIndex;
	}else{
		selectAPICall(baseSelect,pastIndex);
	}
}

// Handles conversion with base currency text input
baseInput.oninput = (e)=>{
	if(isNaN(baseInput.value) || baseInput.value == ""){
		conversionInput.value = "";
	}else{
		updateConversionAmount(baseInput.value); 
	}
}
// Handles conversion with conversion currency text input
conversionInput.oninput = (e)=>{
	if(isNaN(conversionInput.value) || conversionInput.value == ""){
		baseInput.value = "";
	}else{
		updateBaseAmount(conversionInput.value);
	}
}

// Displays the updated information after an API request
Http.onreadystatechange=(e)=>{
	if(Http.readyState === XMLHttpRequest.DONE && Http.status === 200){
    	let response = JSON.parse(Http.responseText);
    	// Get conversion information
    	let conversionName = conversionSelect.options[conversionSelect.selectedIndex].text;
    	let conversionValue = conversionSelect.value;
    	// Get base information
    	let baseName = baseSelect.options[baseSelect.selectedIndex].text;
    	let baseAmount = Number(baseInput.value);
    	// Get conversion rate
    	conversionRate = response["rates"][conversionValue];
    	// Perform conversion & Set Display text
    	let newConversionAmount = updateConversionAmount(baseAmount);
    	document.getElementById('baseText').innerHTML = numberWithCommas(baseAmount) + ` ${baseName} equals`;
		document.getElementById('rateText').innerHTML = numberWithCommas(newConversionAmount) + ` ${conversionName}`;
		// Update the UTC date
		let date = getDate();
		document.getElementById('dateText').innerHTML = date;
 	}
}



//HELPERS
// Get the date in the form Mon Day, Time TimeZone
function getDate(){
	const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let date = new Date();
	let result = "";
	let hours = date.getUTCHours() + ":" + date.getUTCMinutes();
	let TOD = "AM";

	if(date.getUTCHours() >= 12)
		TOD = "PM";

	result = result + months[date.getUTCMonth()] + " " + date.getUTCDate() + ", " + hours + " " + TOD + " UTC";
	return result;
}

// Do Select api call
function selectAPICall(otherSelect,pastIndex){
	let base = baseSelect.value;
	let conversion = conversionSelect.value;
	if(base == conversion){
		otherSelect.selectedIndex = pastIndex;
		base = baseSelect.value;
	    conversion = conversionSelect.value;
	}
	let url = `https://api.exchangeratesapi.io/latest?base=${base}&symbols=${conversion}`;
	pastBSelected = baseSelect.value;
	pastCSelected = conversionSelect.value;
	Http.open("GET",url);
	Http.send();
}

// Update the conversion amount based on the current base amount
function updateConversionAmount(baseAmount){
	let calculation = baseAmount * conversionRate;
	let result = calculation.toFixed(2);
	conversionInput.value = result;
	return result;
}

// Update the base amount based on the current conversion amount
function updateBaseAmount(conversionAmount){
	let calculation = conversionAmount / conversionRate;
	let result = calculation.toFixed(2);
	baseInput.value = result;
	return result;
}

// Find index of option with given value
function findIndexOfOption(selectObj,value){
	for(let i = 0; i < selectObj.options.length;i++){
		if(selectObj.options[i].value == value){
			return selectObj.options[i].index;
		}
	}
}

// Only allow numbers and periods as keypresses to input boxes
function isNumber(event) {
    let charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    	if(charCode == 46){
    		return true;
    	}
        return false;
    }
    return true;
}

// Added commas using a regex that uses lookahead to look for multiples of 3 and add a comma in that position
function numberWithCommas(x){
	let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
