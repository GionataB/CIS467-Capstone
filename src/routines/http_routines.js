/**
 * Routines are basically functions to be executed by the server in
 * response to an event.
 * While the 'routing' decides what routines to execute based on the request,
 * the routines decide how to handle the data requested.
 * Routines can do data manipulation, while queries should not do any work on the data, but provide an easy to use abstraction of the syntax and options, with documentations, for some of the harder mongoose queries.
 * @module routines/http_routines
 * @requires error_handling/Error
 */

const error_handler = require('../error_handling/Error');

/**
 * Routine for a user's first get request, loading the first element in the database.
 * If no element is present, this routine sets the status as '500', meaning a server error. 
 * This is because the client doesn't send anything with the request, so it is an internal problem in the server.
 * It works similarly to get_one, see get_one documentation to know how it works.
 * @param {Object} req the Express req Object used by the client to send a request.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema
 * @param {json} searchTerm JSON containing the terms used for the database search
 * @param {string} selectTerm the fields in the database to be shown in the requested JSON document. If the field is not specified here, it will not be shown in the document. An empty string shows all fields.
 * @see get_one
 */
function get_init(req, res, queryAgent, database, searchTerm, selectTerm){
    try{
    queryAgent.getInitElement(database, searchTerm, selectTerm, function(err, element){
       if (err) error_handler.badServerHandler(res, err);
       else {
           req.session.lastLink = element._id;
           res.json(element);
       }
    });
    }
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have a getInitElement function.");
    }
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
        error_handler.functionDoesNotExist(res, "The query agent does not have a getOneElement function.");
    }
}

/**
 * Routine to use when a single element is required from the database.
 * This assumes that the queryAgent has a getOneElement function.
 * @param {Object} req the Express req Object used by the client to send a request.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema
 * @param {json} searchTerm JSON containing the terms used for the database search
 * @param {string} selectTerm the fields in the database to be shown in the requested JSON document. If the field is not specified here, it will not be shown in the document. An empty string shows all fields.
 * @param {boolean} close Tells the server to stop and wipe the session.
 */
function get_one_check_closure(req, res, queryAgent, database, searchTerm, selectTerm, close){
    try{
    queryAgent.getOneElement(database, searchTerm, selectTerm, function(err, element){
        if(err) error_handler.badClientRequest(res, err);
        else {
            //req.session.history.push(searchTerm);
            res.json(element);
            if(close && element != null){
                destroy_session(req);
            }
        }
    });}
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have a getOneElement function.");
    }
}

/**
 * Routine to use when all the elements in the database are required.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 */
function get_all(res, queryAgent, database){
    try{
    queryAgent.getAllElements(database, function(err, element){
        if(err) error_handler.badClientRequest(res, err);
        else res.json(element);
    });
    }
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have a getAllElements function.");
    }
}

/**
 * Routine to store a new element in the database.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} newElement an element that is created following the Schema.
 */
function post_one(res, queryAgent, newElement){
    try{
        queryAgent.postOneElement(newElement, function(err){
            if (err) error_handler.badServerHandler(res, 'Unable to save to database.');
            else res.status(201).json('Entry added successfully.');
        });
    }
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have a postOneElement function."); 
    }
}

/**
 * Routine to store an array of elements in the database.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 * @param {json[]} elementsArr an array of json documents, each json corresponding to a new entry in the database.
 */
function post_many(res, queryAgent, database, elementsArr){
    try{
        queryAgent.postManyElements(database, elementsArr, function(err){
            if (err) error_handler.validationError(res, err);
            else res.status(201).json("All documents successfully saved");
        });
    }
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have a postManyElements function."); 
    }
}

/**
 * Routine to append the array contained in data to the storage in memory.
 * @param {string[]} memory memory for storing data.
 * @param {string[]} data the data to be stored.
 * @callback callback function to do something after logging the data.
 * @param {string[]} callback.result the resulting concatenated array.
 */
function log_data(memory, data, callback){
    result = memory.concat(data);
    callback(result);
}

/**
 * Routine to update one element. 
 * The routine updates a single field in an element.
 * Depending on the definition of updateOneElement, a new element, or field, can be created if it does not already exist. 
 * check the documentation of updateOneElement to make sure of its behavior.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use
 * @param {mongoose.Schema} database the database as defined in a mongoose schema
 * @param {json} searchTerm JSON containing the terms used for the database search
 * @param {json} update JSON containing the field to update, and its new value
 */
function update_one(res, queryAgent, database, searchTerm, update){
    try{
        queryAgent.updateOneElement(database, searchTerm, update, function(err, element){
            if (err) error_handler.badServerHandler(res, 'Unable to update the database.');
            else res.json(element);
        });
    }
    catch(err){
        error_handler.functionDoesNotExist(res, "The query agent does not have an updateOneElement function."); 
    }
}

/**
 * Routine to delete one element.
 * After deletion, the element is temporarily stored in 'element' (not used).
 * While the actual definition of deleteOneElement is arbitrary, the routine should not be allowed to delete more than one element per function call.
 * For example, passing '{}' as search term should not delete all the collection, but only the first element.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 * @param {json} searchTerm JSON containing the terms used for the database search.
 */
function delete_one(res, queryAgent, database, searchTerm){
    try{
        queryAgent.deleteOneElement(database, searchTerm, function(err, element){
            if(err) error_handler.badClientRequest(res, err);
            else res.json("Element successfully deleted.");
        });
    }
    catch(err){
            error_handler.functionDoesNotExist(res, "The query agent does not have a deleteOneElement function.");
    }
}

/**
 * Routine to delete field(s) from one element.
 * Similar to delete_one, but acts on a field, not a document.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 * @param {json} searchTerm JSON containing the terms used for the database search.
 * @param {json} field JSON containing the fields and their values to find and delete.
 * @see delete_one
 */
function delete_field_from_one(res, queryAgent, database, searchTerm, field){
    try{
        queryAgent.deleteField(database, searchTerm, field, function(err, element){
            if(err) error_handler.badClientRequest(res, err);
            else res.json("Field(s) succesfully deleted.");
        });
    }
    catch(err){
            error_handler.functionDoesNotExist(res, "The query agent does not have a deleteField function.");
    }
}

/**
 * Routine to delete an entire collection.
 * Since this is a dangerous operation, the routine sends back to the client a backup of the deleted collection.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 */
function delete_all(res, queryAgent, database){
    try{
        queryAgent.deleteAllElements(database, function(err, elements){
            if(err) error_handler.badClientRequest(res, err);
            else res.json("Element successfully deleted. Backup:\n" + elements);
        });
    }
    catch(err){
            error_handler.functionDoesNotExist(res, "The query agent does not have a deleteOneElement function.");
    }
}

/**
 * Similar to delete_field_from_one, but it acts on the whole collection.
 * This is useful if an entry in the database is removed, and you want to remove all references to that element from the collection.
 * This acts on an entire collection.
 * It does not allow to specify a subset of the collection to update.
 * @param {Object} res the Express res Object used to send back a response.
 * @param {module} queryAgent the module containing the queries to use.
 * @param {mongoose.Schema} database the database as defined in a mongoose schema.
 * @param {json} field JSON containing the fields and their values to find and delete.
 */
function delete_field_from_all(res, queryAgent, database, field){
    try{
        queryAgent.deleteFieldFromAll(database, field, function(err, element){
            if(err) error_handler.badClientRequest(res, err);
            else res.json("Field(s) succesfully deleted.");
        });
    }
    catch(err){
            error_handler.functionDoesNotExist(res, "The query agent does not have a deleteFieldFromAll function.");
    }
}

/**
 * Routine to wipe a session and restart with a clean cookie.
 * @param {Object} req the Express req Object that contains the session storage.
 */
function destroy_session(req){
    req.session.destroy(function (err){
        if (err) error_handler.logError('Could not destroy the session.');
    });
}
module.exports = {
    get_init: get_init,
    get_one: get_one,
    get_one_check_closure: get_one_check_closure,
    get_all: get_all,
    post_one: post_one,
    post_many: post_many,
    log_data: log_data,
    update_one: update_one,
    delete_one: delete_one,
    delete_field_from_one: delete_field_from_one,
    delete_field_from_all: delete_field_from_all,
    delete_all: delete_all
}