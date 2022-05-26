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

//랜덤단건조회 API 구현
app.get("/lifequotes/random", async (req, res) => {
  //객체 하나만 받아옴 -> [[]] 사용
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
  //1. 조회수를 추가한 뒤에 해당 값을 쿼리에 수정
  //2. 조회수를 쿼리에 수정한 후 값을 추가하기
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

//수정 API 구현
app.patch("/lifequotes/:id", async (req, res) => {
  const { id } = req.params;

  const [[LifequotesRow]] = await pool.query(
    `
      SELECT * FROM lifequotes WHERE id = ?
      `,
    [id]
  );
  if (LifequotesRow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }
  //기존의 모든 값들을 수정하는 형식
  //body에 없는 것들은 그대로 다시 데이터에 들어감.
  //(ex. reg_Date = LifequotesRow.reg_Date)
  const {
    reg_Date = LifequotesRow.reg_Date,
    content = LifequotesRow.content,
    author = LifequotesRow.author,
    hit_Count = LifequotesRow.hit_Count,
    like_Count = LifequotesRow.like_Count,
    dislike_Count = LifequotesRow.dislike_Count,
  } = req.body;

  await pool.query(
    `
      UPDATE lifequotes
      SET reg_Date = ?,
      content = ?,
      author = ?,  
      hit_Count = ?,
      like_Count = ?, 
      dislike_Count =?
      WHERE id = ?
      `,
    [reg_Date, content, author, hit_Count, like_Count, dislike_Count, id]
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
