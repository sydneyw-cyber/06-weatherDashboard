// Selectors
var searchInput = $("#city")
var weatherInfo = $(".weatherInfo")
var forecast = $(".forecast")
var searchButton = $(".searchButton")
var searchResults = $(".searchResults")
var searchHistory = $('.searchHistory')

// Global variable for search latitude and longitude
var cityName;
var searchText;

// Create function to convert search text into latitude longitude coordinates
function convertCity() {
    var searchUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=1&appid=69952e21ea5a2d9cfc6b0e278e3d3106`
    $.ajax({
        url:searchUrl,
        method:"GET",
    }).then(function(response) {
        if(response[0] != undefined) {
            var lat = response[0].lat
            var lon = response[0].lon
            cityName = response[0].name
            populateWeatherData(lat, lon)
            var searchHistory = JSON.parse(localStorage.getItem('recent'))
            if(searchHistory != undefined) {
                if(searchHistory.includes(searchText) == false) {
                    addTosearchHistory();
                    refreshsearchHistory();
                }
            }
            else {
                addTosearchHistory();
                refreshsearchHistory();
            }
        }
        else {
            weatherInfo.empty()
            forecast.empty()
            var resultsDataError = $('<h4>').addClass("col s12").text("Location Not Found!")
            weatherInfo.append(resultsDataError);
        }
        
    })
}


// Create function to convert unix code to date format

function convertTime(timeCode) {
    var date = new Date(timeCode * 1000)
    var day = date.getDate()
    var month = date.getMonth() + 1
    var year = date.getFullYear()
    var dateString = (`${month}/${day}/${year}`);
    return dateString;
}

// Function to add query to search history

function addTosearchHistory() {
    if(localStorage.getItem('recent') == null) {
        localStorage.setItem('recent', [])
        var searchHistory = []
        searchHistory.push(searchText);
        localStorage.setItem('recent', JSON.stringify(searchHistory))
    } 
    else {
        var searchHistory = JSON.parse(localStorage.getItem('recent'))
        if(searchHistory.length < 10){
            searchHistory.push(searchText)
            localStorage.setItem('recent', JSON.stringify(searchHistory))
        }
        else {
            searchHistory.shift()
            searchHistory.push(searchText)
            localStorage.setItem('recent', JSON.stringify(searchHistory))
        }
    }
}

// Function to populate recent search history list

function refreshsearchHistory() {
    searchHistory.empty()
    var recents = JSON.parse(localStorage.getItem('recent'))
    for(i = recents.length - 1;i > -1;i--) {
        var recentItem = $('<li>').addClass('history-item')
        var recentItemText = $('<a>').addClass('btn waves-effect red lighten-1').text(recents[i])
        recentItem.append(recentItemText)
        searchHistory.append(recentItem);
    }
    $('.history-item').on('click', function() {
        searchText = $(this).text()
        convertCity();
    })

}

// Function for initial page load

function init() {
    searchButton.on('click', function() {
        searchText = searchInput.val()
        convertCity();
    })
    refreshsearchHistory();
}
init()

// function to populate the weather data results

function populateWeatherData(searchLat, searchLon) {
    weatherInfo.empty()
    forecast.empty()
    var searchUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${searchLat}&lon=${searchLon}&exclude=hourly&units=imperial&appid=69952e21ea5a2d9cfc6b0e278e3d3106`
    $.ajax({
        url:searchUrl,
        method:"GET",
    }).then(function(response) {
        var locationInfo = response
        var timeCode = response.current.dt
        console.log(response)

        var dateName = convertTime(timeCode)
        var iconCode = response.current.weather[0].icon
        var dateNameRow = $("<div>").addClass("row")
        var dateNameElement = $('<h4>').text(`${cityName} - ${dateName}`).addClass('col s-10')
        var iconDiv = $('<div>').addClass('col s2')
        var weatherIcon = $('<img>').attr("src", `https://openweathermap.org/img/wn/${iconCode}@2x.png`).addClass('responsive-img')
        iconDiv.append(weatherIcon)
        dateNameRow.append(iconDiv)
        dateNameRow.append(dateNameElement)
        weatherInfo.append(dateNameRow)

        var tempDiv = $('<div>').addClass('row')
        var temp = Math.round(response.current.temp)
        var tempElement = $('<lead>').text(`Temp: ${temp}° F`)
        tempDiv.append(tempElement)
        weatherInfo.append(tempDiv)

        var windDiv = $('<div>').addClass('row')
        var wind = response.current.wind_speed
        var windElement = $('<lead>').text(`Wind: ${wind}MPH`)
        windDiv.append(windElement)
        weatherInfo.append(windDiv)

        var humidityDiv = $('<div>').addClass('row')
        var humidity = response.current.humidity
        var humidityElement = $('<lead>').text(`Humidity: ${humidity}%`)
        humidityDiv.append(humidityElement)
        weatherInfo.append(humidityDiv)

        var uvDiv = $('<div>').addClass('row')
        var uv = response.current.uvi
        var uvEl = $('<lead>').text(`UV Index:  `)
        var uvNumEl = $("<a>").text(uv).addClass('btn')
        if(uv < 3) {
            uvNumEl.addClass('green')
        }
        else if(uv < 6) {
            uvNumEl.addClass('yellow')
        }
        else {
            uvNumEl.addClass('red')
        }
        uvDiv.append(uvEl)
        uvDiv.append(uvNumEl)
        weatherInfo.append(uvDiv)

        var fiveDayTitle = $("<h4>").text("5 Day Forecast:")
        var fiveDayTitleEl = $("<div>").addClass("row")
        fiveDayTitleEl.append(fiveDayTitle)
        forecast.append(fiveDayTitleEl)

        populateForecast(locationInfo)

    })
}

// Create function that populates the forecast data

function populateForecast(data) {
    for(i = 1;i < 6;i++) {

        var forecastDate = data.daily[i].dt
        var dateString = convertTime(forecastDate)
        var title = $("<span>").addClass("card-title").text(dateString)
        var temp = Math.round(data.daily[i].temp.day);
        var humidity = data.daily[i].humidity
        var wind = data.daily[i].wind_speed
        var iconCode = data.daily[i].weather[0].icon
        var tempElement = $("<p>").text(`Temp: ${temp}° F`)
        var weatherIcon = $('<img>').attr("src", `https://openweathermap.org/img/wn/${iconCode}@2x.png`).addClass('responsive-img')
        var windElement = $("<p>").text(`Wind: ${wind}MPH`)
        var humidityElement = $("<p>").text(`Humidity: ${humidity}%`)
        var contentDiv = $("<div>").addClass("card-content")
        var containerDiv = $("<div>").addClass("col s12 m4 l2")
        var weatherCard = $("<div>").addClass("card").css({"padding":"10px"})

        contentDiv.append(title)
        contentDiv.append(tempElement)
        contentDiv.append(weatherIcon)
        contentDiv.append(windElement);
        contentDiv.append(humidityElement)
        containerDiv.append(weatherCard)
        weatherCard.append(contentDiv)
        forecast.append(containerDiv)
        }

}

