const express = require('express');

// Export the existing configured app from index.js for compatibility.
// This file exists to provide a conventional entry that can be required by tests/servers.
const app = require('./index.js');

module.exports = app;


