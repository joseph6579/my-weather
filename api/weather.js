export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
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

  // 3. Read your secret token safely securely on the server side
  const token = process.env.VITE_WEATHER_TOKEN;
  const weatherURL = "/v1/hourly";

  try {
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
    if (lat != null && lon != null) {
      const response = await fetch(weatherURL, config, { lat: lat, lon: lon });
    } else {
      const response = await fetch(weatherURL, config);
    }

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed fetching weather data" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
