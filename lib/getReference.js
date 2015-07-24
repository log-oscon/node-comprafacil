(function() {
  'use strict';

  var _               = require('lodash');
  var errorHandler    = require('./errorHandler');
  var responseHandler = require('./responseHandler');

  /**
   * Get a new MULTIBANCO/PayShop reference
   *
   * @private
   * @since   1.0.0
   * @param   {string}    method          SOAP method name.
   * @param   {Object}    client          node-soap client.
   * @param   {Object}    options         Request options.
   * @param   {Function}  options.onDone  The callback that handles the response.
   * @param   {Function}  options.onFail  The callback that handles the errors.
   */
  function getReference(method, client, options) {

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

      // User options
      var userOptions = _.omit(options, _.isFunction);

      _.extend(userOptions, defaults);

      client[method](
        userOptions,
        responseHandler(options.onDone, options.onFail),
        client.wsdl.options.wsdl_options || {}
      );

    }
    catch (ex) {
      errorHandler(ex, options.onFail);
    }

  }

  module.exports = getReference;

})();
