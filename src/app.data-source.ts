// import { DataSource } from "typeorm"

// const PostgresNest = new DataSource({
//     type: "mysql",
//     host: "localhost",
//     port: 3306,
//     username: "root",
//     password: "admin",
//     database: "db1",
//     entities: [__dirname + "/entity/*{.js,.ts}"],
//     synchronize: true,
// })

// const PostgresFlask = new DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: 5432,
//     username: "test",
//     password: "test",
//     database: "test",
//     entities: [
//         // ....
//     ],
// })

// PostgresNest.initialize()
//     .then(() => {
//         console.log("Data Source 1 has been initialized!")
//     })
//     .catch((err) => {
//         console.error("Error during Data Source 1 initialization", err)
//     })


//     PostgresFlask.initialize()
//     .then(() => {
//         console.log("Data Source 2 has been initialized!")
//     })
//     .catch((err) => {
//         console.error("Error during Data Source 2 initialization", err)
//     })