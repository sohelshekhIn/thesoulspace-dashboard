// import path from "path";

// export default ({ env }) => {
//   const client = env("DATABASE_CLIENT", "sqlite");

//   const connections = {
//     sqlite: {
//       connection: {
//         filename: path.join(
//           __dirname,
//           "..",
//           "..",
//           env("DATABASE_FILENAME", "data.db")
//         ),
//       },
//       useNullAsDefault: true,
//     },
//   };

//   return {
//     connection: {
//       client,
//       ...connections[client],
//       acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
//     },
//   };
// };
module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST"),
      port: env.int("DATABASE_PORT"),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USER"),
      password: env("DATABASE_PASSWORD"),
      ssl: {
        rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
      },
    },
    debug: false,
  },
});
