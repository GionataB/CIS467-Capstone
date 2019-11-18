/**
 * Routines are basically functions to be executed by the server in
 * response to an event.
 * While the 'routing' decides what routines to execute based on the request,
 * the routines decide how to handle the data requested.
 * @module routines/http_routines
 * @requires src/error_handling/Error
 */

const error_handler = require('../error_handling/Error');

/**
 * Routine for a user's first get request, loading the first element in the database.
 * If no element is present, this routine sets the status as '500', meaning a server error. 
 * This is because the client doesn't send anything with the request, so it is an internal problem in the server.
 * It works similarly to get_one, see get_one documentation to know how it works.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema
 * @param {json} searchTerm JSON containing the terms used for the database search
 * @param {string} selectTerm the fields in the database to be shown in the requested JSON document. If the field is not specified here, it will not be shown in the document. An empty string shows all fields.
 * @see get_one
 */
function get_init(res, queryAgent, database, searchTerm, selectTerm){
    queryAgent.getInitElement(database, searchTerm, selectTerm, function(err, element){
       if (err) error_handler.badServerHandler(res, err);
       else res.json(element); 
    });
}

/**
 * Routine to use when a single element is required from the database.
 * This assumes that the queryAgent has a getOneElement function.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema
 * @param {json} searchTerm JSON containing the terms used for the database search
 * @param {string} selectTerm the fields in the database to be shown in the requested JSON document. If the field is not specified here, it will not be shown in the document. An empty string shows all fields.
 */
function get_one(res, queryAgent, database, searchTerm, selectTerm){
    try{
    queryAgent.getOneElement(database, searchTerm, selectTerm, function(err, element){
        if(err) error_handler.badClientRequest(res, err);
        else res.json(element);
    });}
    catch(err){
        error_handler.badServerHandler(res, "The query agent does not have a getOneElement function.");
    }
}

/**
 * Routine to use when all the elements in the database are required.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema 
 */
function get_all(res, queryAgent, database){
    queryAgent.getAllElements(database, function(err, element){
        if(err) error_handler.badClientRequest(res, err);
        else res.json(element);
    });
}

module.exports = {
    get_init: get_init,
    get_one: get_one,
    get_all: get_all
}