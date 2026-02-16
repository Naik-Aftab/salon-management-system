import mysql, { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getEnv } from "../utils/env";

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (pool) {
    return pool;
  }

  pool = mysql.createPool({
    host: getEnv("DB_HOST"),
    port: Number(getEnv("DB_PORT", "3306")),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD", ""),
    database: getEnv("DB_NAME"),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
};

export const query = async <T extends RowDataPacket[]>(
  sql: string,
  values: unknown[] = []
): Promise<T> => {
  const [rows] = await getDbPool().query<T>(sql, values);
  return rows;
};

export const execute = async (
  sql: string,
  values: unknown[] = []
): Promise<ResultSetHeader> => {
  const [result] = await getDbPool().execute<ResultSetHeader>(sql, values);
  return result;
};
