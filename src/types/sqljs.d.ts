declare module 'sql.js' {
  export type SqlJsStatic = any;
  export type Database = any;
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  export default initSqlJs;
}

