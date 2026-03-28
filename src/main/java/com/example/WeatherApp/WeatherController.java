package com.example.WeatherApp;

import java.io.IOException;

import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@RestController
public class WeatherController {

	private final WeatherService weatherService;

	public WeatherController(WeatherService weatherService) {
		this.weatherService = weatherService;
	}

	@GetMapping("/hi")
	public String getWeatherForCity(){
		return "Hi!!!!!!!!!!!!!";
	}

	@GetMapping("/weather")
	public JSONObject getWeatherForCity(@RequestParam String city) throws IOException, ParseException {
		return weatherService.getWeatherForCity(city);
	}

	@GetMapping("/geo")
	public String getGeolocationForCity(@RequestParam String city) throws IOException, ParseException {
		return weatherService.getGeolocationForCity(city);
	}
}
