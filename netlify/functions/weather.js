exports.handler = async function (event, context) {
  // 1. Handle CORS Preflight Options Request
  const headers = {
    "Access-Control-Allow-Origin": "*", // Safe to use '*' here since Netlify proxies securely
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // 2. Extract query parameters passed from Alpine.js (Netlify uses event.queryStringParameters)
  const { lat, lon } = event.queryStringParameters || {};

  // 3. Retrieve your token securely from Netlify environment variables
  const token = process.env.VITE_WEATHER_TOKEN;

  // 4. Construct external target API URL
  let weatherURL = "https://weather-ai.co";
  if (lat && lon) {
    weatherURL = `${weatherURL}?lat=${lat}&lon=${lon}`;
  }

  try {
    // 5. Fire server-to-server request
    const response = await fetch(weatherURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: `Weather service error: ${response.statusText}`,
        }),
      };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
