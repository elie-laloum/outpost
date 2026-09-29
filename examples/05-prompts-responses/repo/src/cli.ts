import { forecast } from "./forecast.ts";

const city = process.argv[2] ?? "Paris";

console.log(`${city} : ${forecast(city)}`);
