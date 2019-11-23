const error_handler = require('../../error_handling/Error');
const express = require('express');
const router = express.Router();

const db_admin = require('../../schemas/admin/question_schema');
const {questionRoute} = require('./routes');
const queries = require('./queries/question_queries');
const routines = require('../../routines/http_routines');

/**
 * The POST request creates entries in the database.
 * The POST will create, not update, an
 * entry in the database.
 * PUT should be used to update a database entry.
 * @name postRoute
 * @param {Object} req the request received from a client
 * @param {Object} res the response from the server
 * @see putRoute
 */
router.route(questionRoute).post(function(req, res) {
  var opt = req.body.option;
  if (opt == null) opt = '1';
  var docs = req.body.content;
  switch (opt){
    case '0':
      routines.post_many(res, queries, db_admin, docs);
      break;
    case '1':
      var db_entry = new db_admin(docs);
      routines.post_one(res, queries, db_entry);
      break;
    default:
        error_handler.badClientRequest(res, "Could not understand 'option' value");
        break;
  }
});

/**
 * The GET request offers different options, passed in the request as an 'option' field, which is a string. 'options'default to '1'.
 * 0: get all the database. This does not require the 'name' body in the request, although its presence does not cause an error.
 * 1: asks the database for the entry with matching tag. Only one entry is returned.
 * If something weird happens in the option selection, likely because of an unsupported option, a 400 error is sent back as response.
 * @name getRoute
 * @param {Object} req the request received from a client
 * @param {Object} res the response from the server
 */
router.route(questionRoute).get(function(req, res) {
  var id = req.body.name;
  var opt = req.body.option;
  if (opt == null) opt = '1';
  switch (opt) {
    case '0':
      routines.get_all(res, queries, db_admin);
      break;
    
    case '1':
      routines.get_one(res, queries, db_admin, {tag: id}, '');
      break;

    default:
      error_handler.badClientRequest(res, "Could not understand 'option' value");
      break;
  }
});

/**
 * The PUT request is used to modify one entry in the database.
 * The entry has to exist in the database, it does not create one.
 * The validators in the schema will be checked on update: for example,
 * an element's tag cannot be updated if the new tag is already existing in the
 * database.
 * @name putRoute
 * @param {Object} req the request received from a client
 * @param {Object} res the response from the server
 */
router.route(questionRoute).put(function(req, res) {
  var id = req.body.name;
  var update_param = {};
  update_param[req.body.element] = req.body.update;
  routines.update_one(res, queries, db_admin, {tag: id}, update_param);
});

/**
 * The DELETE request is used to remove entries in the database.
 * Different delete functions are provided, and the option to choose it is passed in the 'option' field in the request body, defaulted at '1'.
 * The option is a string, and the supported options are the following:
 * 0: delete all elements. Does not require a 'name' field in the request.
 * 1: delete a single element
 * If something weird happens in the option selection, likely because of an unsupported option, a 400 error is sent back as response.
 * @name deleteRoute
 * @param {Object} req the request received from a client
 * @param {Object} res the response from the server
 */
router.route(questionRoute).delete(function(req, res) {
  var id = req.body.name;
  var opt = req.body.option;
  if (opt == null){
    opt = '1';
  }
  switch (opt){
    case '0':
      routines.delete_all(res, queries, db_admin);
      break;

    case '1':
      routines.delete_one(res, queries, db_admin, {tag: id});
      break;
    
    default:
      error_handler.badClientRequest(res, "Could not understand 'option' value");
      break;
  }
});

module.exports = router;
