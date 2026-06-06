export default async function handler(req, res) {
  // 1. Correct CORS security conflict (Do not use "*" with Allow-Credentials)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "https://vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST"); // Added POST since you use method: "POST" below
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // 2. Extract query parameters passed from Alpine.js
  const { lat, lon } = req.query;

  // 3. Securely use your secret token and full API URL
  const token = process.env.VITE_WEATHER_TOKEN;
  const weatherURL = "https://weather-ai.co"; // Fixed: Added absolute URL

  try {
    // 4. Properly structure the configuration object for a POST request
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    // 5. Correctly stringify and append payload to the body field
    if (lat != null && lon != null) {
      config.body = JSON.stringify({ lat: Number(lat), lon: Number(lon) });
    }

    // 6. Execute fetch with single config argument
    const response = await fetch(weatherURL, config);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed fetching weather data: ${response.statusText}`,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
