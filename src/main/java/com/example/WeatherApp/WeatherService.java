package com.example.WeatherApp;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Scanner;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Service;

@Service
public class WeatherService {

	public JSONObject getWeatherForCity(String city) throws IOException, ParseException {
		JSONObject cityLocationData = getLocationData(city);
		double latitude = (double) cityLocationData.get("latitude");
		double longitude = (double) cityLocationData.get("longitude");

		return getWeatData(latitude, longitude);
	}

	public JSONObject getWeatData(double latitude, double longitude) throws IOException, ParseException {
		try {
			var urlString = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m";
			HttpURLConnection apiConnection = fetchApiResponse(urlString);

			if (apiConnection.getResponseCode() != 200) {
				System.out.println("Error: Could not connect to API");
				return null;
			}

			String jsonResponse = readApiResponse(apiConnection);

			JSONParser parser = new JSONParser();
			JSONObject resultsJsonObj = (JSONObject) parser.parse(jsonResponse);
			JSONObject currentWeatherJson = (JSONObject) resultsJsonObj.get("current");

			return currentWeatherJson;
		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;

	}

	public String getGeolocationForCity(String city) throws IOException, ParseException {
		JSONObject cityLocationData = getLocationData(city);
		double latitude = (double) cityLocationData.get("latitude");
		double longitude = (double) cityLocationData.get("longitude");

		return String.valueOf(latitude).concat(" ").concat(String.valueOf(longitude));
	}

	private JSONObject getLocationData(String city) throws IOException, ParseException {
		city = city.replaceAll(" ", "+");

		var urlString = "https://geocoding-api.open-meteo.com/v1/search?name=" + city + "&count=1&language=en&format=json";
		HttpURLConnection apiConnection = fetchApiResponse(urlString);

		if (apiConnection.getResponseCode() != 200) {
			System.out.println("Error: Could not connect to API");
			return null;
		}

		String jsonResponse = readApiResponse(apiConnection);

		JSONParser parser = new JSONParser();
		JSONObject resultsJsonObj = (JSONObject) parser.parse(jsonResponse);

		JSONArray locationData = (JSONArray) resultsJsonObj.get("results");

		return (JSONObject) locationData.get(0);
	}

	private String readApiResponse(HttpURLConnection apiConnection) {
		try {
			StringBuilder resultJson = new StringBuilder();
			Scanner scanner = new Scanner(apiConnection.getInputStream());

			while (scanner.hasNext()) {
				resultJson.append(scanner.nextLine());
			}

			scanner.close();

			return resultJson.toString();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private static HttpURLConnection fetchApiResponse(String urlString) {
		try {
			URL url = new URL(urlString);
			HttpURLConnection conn = (HttpURLConnection) url.openConnection();

			conn.setRequestMethod("GET");

			return conn;
		} catch (IOException e) {
			e.printStackTrace();
		}

		return null;
	}
}
