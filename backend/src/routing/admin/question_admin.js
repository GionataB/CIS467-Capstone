const error_handler = require('../../error_handling/Error');
const express = require('express');
const router = express.Router();

const db_admin_entry = require('../../schemas/admin_schema');
const {questionRoute} = require('./routes');
const queries = require('./queries/question_queries');
const routines = require('../../routines/http_routines');

/*
 * The POST request creates an entry in the database.
 * Notice that the POST will create, not update, an
 * entry in the database.
 * PUT should be used to update a database entry.
 */
router.route(questionRoute).post(function(req, res) {
  const entry = new db_admin_entry(req.body);
  queries.postOneElement(entry, function(err){
    if (err) res.status(500).send('Unable to save to database.');
    else res.json('Entry added successfully.');
  });
});

/*
 * The GET request asks the database for the entry with
 * matching tag.
 *
 * TODO: expand the get with 3 separate functions:
 * 0: get all the database
 * 1: get the matching tag
 * 2: get all the elements with an answer equal to given _id
 * the function will be part of the request body, as a number.
 * function 2 returns all elements that are connected to the given
 * element, searched by _id, as that is what is saved in the answers.
 */
router.route(questionRoute).get(function(req, res) {
  var id = req.body.name;
  var opt = req.body.option;
  if (opt == null){
    opt = '1';
  }
  switch (opt) {
    case '0':
      routines.get_all(res, queries, db_admin_entry);
      break;
    
    case '1':
      routines.get_one(res, queries, db_admin_entry, {tag: id}, '');
      break;

    default:
      error_handler.badClientRequest(res);
      break;
  }
});


/*
 * The PUT request is used to modify one entry in the database.
 * The entry has to exist in the database, it does not create one.
 * The validators in the schema will be checked on update: for example,
 * an element's tag cannot be updated if the new tag is already existing in the
 * database.
 */
router.route(questionRoute).put(function(req, res) {
  var id = req.body.name;
  var update_param = {};
  update_param[req.body.element] = req.body.update;
  queries.updateOneElement(db_admin_entry, {tag: id}, update_param, res);
});

/*
 * The DELETE request is used to remove an entry from the database.
 *
 * TODO: after an element has been deleted, a search should be made,
 * and all references to the now erased _id should be replaced by a
 * "null" value.
 * Expand it with 3 functions:
 * 0: delete an element
 * 1: delete part of an element
 * 2: delete part of an element in bulk on multiple elements
 */
router.route(questionRoute).delete(function(req, res) {
  var id = req.body.name;
  var opt = req.body.option;
  if (opt == null){
    opt = '1';
  }
  switch (opt){
    case '0':
      queries.deleteAllElements(db_admin_entry, res);
      break;

    case '1':
      queries.deleteOneElement(db_admin_entry, {tag: id}, res);
      break;
    
    default:
      error_handler.badClientRequest(res);
      break;
  }
});

module.exports = router;
