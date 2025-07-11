export default function Home() {
  return (
    <div>
      <h1>Astrology API</h1>
      <p>POST /api/calculate_chart</p>
      <pre>
        {JSON.stringify({
          dob: "DD/MM/YYYY",
          lat: 55.7558,
          lng: 37.6176,
          time: "HH:MM"
        }, null, 2)}
      </pre>
    </div>
  );
}
