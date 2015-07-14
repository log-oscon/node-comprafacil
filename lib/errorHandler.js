(function() {
  'use strict';

  /**
   * Handle errors from CompraFacil SOAP methods.
   *
   * @private
   * @since   1.0.0
   * @param   {String}    err     Throw exception.
   * @param   {Function}  onFail  The callback that handles the errors.
   */
  function errorHandler(err, onFail) {

    if (typeof onFail === 'function') {
      onFail(err);
    }

  }

  module.exports = errorHandler;

})();
