const app = require("./app");
const { connectDatabase } = require("./config/database");
const seedPosts = require("./config/seedPosts");

const port = process.env.PORT || 3000;

connectDatabase()
    .then(seedPosts)
    .then(() => app.listen(port, () => console.log(`Servidor em execução na porta ${port}.`)))
    .catch((error) => {
        console.error("Não foi possível iniciar o servidor:", error.message);
        process.exit(1);
    });
