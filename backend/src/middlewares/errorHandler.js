const express = require("express");
const { Router } = express;

function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = { errorHandler };
