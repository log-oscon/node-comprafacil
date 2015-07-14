(function() {
  'use strict';

  var _               = require('lodash'),
      errorHandler    = require('./errorHandler'),
      responseHandler = require('./responseHandler');

  /**
   * Get a new MULTIBANCO/PayShop reference
   *
   * @private
   * @since   1.0.0
   * @param   {string}    method      SOAP method name.
   * @param   {Object}    client      node-soap client.
   * @param   {Object}    options     Request options.
   * @param   {Function}  onSuccess   The callback that handles the response.
   * @param   {Function}  onFail      The callback that handles the errors.
   */
  function getReference(method, client, options, onSuccess, onFail) {

    try {

      // Request defaults
      var defaults = {
        origin:            '',
        additionalInfo:    '',
        name:              '',
        address:           '',
        postCode:          '',
        city:              '',
        NIC:               '',
        externalReference: '',
        contactPhone:      '',
        IDUserBackoffice:  -1,
        timeLimitDays:     -1,
        sendEmailBuyer:    false
      };

      _.extend(options, defaults);

      client[method](
        options,
        responseHandler(onSuccess, onFail),
        client.wsdl.options.wsdl_options || {}
      );

    }
    catch (ex) {
      errorHandler(ex, onFail);
    }

  }

  module.exports = getReference;

})();
