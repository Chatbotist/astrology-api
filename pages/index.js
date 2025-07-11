import Head from 'next/head';

export default function Home() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Astrology API</title>
        <meta name="description" content="Astrological calculations API" />
      </Head>

      <h1>Astrology API</h1>
      <p>POST request to <code>/api/calculate_chart</code> with JSON body:</p>
      
      <pre>
        {JSON.stringify({
          dob: "DD/MM/YYYY",
          time: "HH:MM (optional, default 00:00)",
          place_of_birth: "City, Country (optional)",
          latitude: "Decimal (optional if place provided)",
          longitude: "Decimal (optional if place provided)"
        }, null, 2)}
      </pre>

      <h2>Example response:</h2>
      <pre>
        {JSON.stringify({
          meta: {
            ephemerisFiles: ["semo_18.se1", "sepl_18.se1"],
            julianDay: 2451545.0
          },
          coordinates: {
            lat: 55.7558,
            lng: 37.6176
          },
          ascendant: {
            longitude: 123.45,
            sign: "Leo"
          },
          planets: {
            Sun: {
              longitude: 120.0,
              latitude: 0.0,
              distance: 1.0,
              speed: 1.0,
              sign: "Cancer"
            }
          }
        }, null, 2)}
      </pre>
    </div>
  );
}
