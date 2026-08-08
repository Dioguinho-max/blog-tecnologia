function notFound(req, res) {
    res.status(404).json({ message: "Rota não encontrada." });
}

function errorHandler(error, req, res, next) {
    console.error(error);
    if (error.name === "ValidationError") {
        return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
    }
    res.status(500).json({ message: "Erro interno do servidor." });
}

module.exports = { notFound, errorHandler };
