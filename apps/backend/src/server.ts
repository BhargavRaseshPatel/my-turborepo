import app from "./app";
import { prisma } from "db/client";

const PORT = process.env.PORT || 5000;

app.listen(PORT , () => {
    console.log(`SERVER running at port : ${PORT}`);
})