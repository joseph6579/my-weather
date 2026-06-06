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

  const { lat, lon } = event.queryStringParameters || {};
  let body = {};

  if (lat != null && lon != null) {
    body = { lat: lat, ln: lon };
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

  const weatherURL = `https://weather-ai.co/v1/hourly`;

  try {
    const response = await fetch(weatherURL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
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
