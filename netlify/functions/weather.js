// Force compatibility for older environments if needed
const fetch = (...args) =>
  import("node-fetch")
    .then(({ default: fetch }) => fetch(...args))
    .catch(() => globalThis.fetch(...args));

exports.handler = async function (event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  console.log(JSON.stringify(event));

  let { lat, lon } = event.queryStringParameters || {};

  if ((!lat || !lon) && event.rawQuery) {
    const backupParams = new URLSearchParams(event.rawQuery);
    lat = lat || backupParams.get("lat");
    lon = lon || backupParams.get("lon");
  }

  if (lat != null && lon != null) {
    let eventData = JSON.stringify(event);
    let finalData = {
      params: {
        lat: event.queryStringParameters.get("lat"),
        lon: event.queryStringParameters.get("lon"),
      },
      raw_query: {
        lat: event.rawQuery.get("lat"),
        lon: event.rawQuery.get("lon"),
      },
    };
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: "Missing lat or lon query parameters",
        event: eventData,
        finalData: finalData,
      }),
    };
  }

  // Fallback check: Look for both common token names to be safe
  const token = process.env.VITE_WEATHER_TOKEN || process.env.WEATHER_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error:
          "Server configuration error: Weather API token is missing on Netlify.",
      }),
    };
  }

  const weatherURL = `https://api.weather-ai.co/v1/hourly?lat=${lat}&lon=${lon}`;

  try {
    const response = await fetch(weatherURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Capture the exact text returned by the WeatherAI server if it's unhappy
    const responseText = await response.text();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `WeatherAI rejected the request with Status ${response.status}`,
          details: responseText,
        }),
      };
    }

    // If successful, parse the textual data cleanly back into JSON
    return {
      statusCode: 200,
      headers,
      body: responseText,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error occurred",
        message: error.message,
      }),
    };
  }
};
