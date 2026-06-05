### My Weather Project

This is a simple project that utilizes the endpoint `hourly` from `weather-ai.co`.
It uses an AI generated UI using a leaner Alpine.js library.
On load, it fetches the data without the body parameters `lat` and `lon`
On searching a location (restricted to Kenyan locations), the parameters `lat` and `lon` are sent as part of the body.

#### Getting Started

Create a `.env` file and add the following values;

```

VITE_WEATHER_TOKEN=your_actual_weather_api_token_here

VITE_GOOGLE_MAPS_KEY=your_actual_google_maps_key_here

```

Install vite by running `npm install`

#### Running the project

Run the following command: `npm run dev` and open the specified local server port on your computer
