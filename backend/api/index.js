const serverlessExpress = require('@vendia/serverless-express');
const app = require('../index.js');

module.exports = serverlessExpress({ app });