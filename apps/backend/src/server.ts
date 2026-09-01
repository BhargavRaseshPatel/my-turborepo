
import app from "./app";
import { API_PORT } from "@repo/config";

const PORT = Number(process.env.PORT) || API_PORT;

app.listen(PORT, () => {
  console.log(`SERVER running at http://localhost:${PORT}`);
});
