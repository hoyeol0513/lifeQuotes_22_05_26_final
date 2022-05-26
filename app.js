import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "exam1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "https://cdpn.io",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const port = 3000;

app.get("/lifequotes/random", async (req, res) => {
  const [[LifequotesRow]] = await pool.query(`
    SELECT * FROM lifequotes ORDER BY RAND() LIMIT 1
    `);
  if (LifequotesRow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }

  LifequotesRow.hit_Count++;

  await pool.query(
    `
    UPDATE lifequotes
    SET hit_Count = ?
    WHERE id =?
    `,
    [LifequotesRow.hit_Count, LifequotesRow.id]
  );

  res.json({
    resultCode: "S-1",
    msg: "Success!",
    data: LifequotesRow,
  });
});

app.listen(port, () => {
  console.log(`Lifequotes app listening on port ${port}`);
});
