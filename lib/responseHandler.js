(function() {
  'use strict';

  var errorHandler = require('./errorHandler');

  /**
   * Handle responses from CompraFacil SOAP methods.
   *
   * @private
   * @since   1.0.0
   * @param   {Function}  onSuccess   The callback that handles the response.
   * @param   {Function}  onFail      The callback that handles the errors.
   */
  function responseHandler(onSuccess, onFail) {

    return function(err, result) {

      if (err) {
        errorHandler(err, onFail);
        return;
      }

      if (typeof onSuccess === 'function') {
        onSuccess(result);
      }

    };

  }

  module.exports = responseHandler;

})();
