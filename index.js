(function() {
  'use strict';

  var _               = require('lodash');
  var soap            = require('soap');
  var responseHandler = require('./lib/responseHandler');
  var errorHandler    = require('./lib/errorHandler');
  var getReference    = require('./lib/getReference');

  var compraFacil = {

    /**
     * Constructor.
     *
     * Create a new SOAP client from a WSDL url.
     *
     * @constructor
     * @since   1.0.0
     * @param   {Object}    options             Request options.
     * @param   {string}    options.wsdl        SOAP WSDL.
     * @param   {Object}    [options.headers]   SOAP request headers.
     * @param   {Object}    [options.extra]     SOAP request options.
     * @param   {Function}  options.onDone      The callback that handles the response.
     * @param   {Function}  options.onFail      The callback that handles the errors.
     * @return  {Object}                        Returns an instance of a node-soap client.
     */
    init: function(options) {

      /**
       * The options argument allows you to customize the client with the following properties:
       *
       * @since     1.0.0
       * @property  {string}  endpoint      To override the SOAP service's host specified in the .wsdl file.
       *                                    Particulary useful for CORS requests.
       * @property  {Object}  wsdl_headers  Allow any request headers to keep passing through.
       * @property  {Object}  wsdl_options  By default, node-soap uses $value as key for any parsed XML value which
       *                                    may interfere with your other code as it could be some reserved word,
       *                                    or the $ in general cannot be used for a key to start with.
       *                                    You can define your own valueKey by passing it in the wsdl_options.
       */
      var soapOptions = {
        endpoint:     options.endpoint || options.wsdl,
        wsdl_headers: options.headers || {},
        wsdl_options: options.extra || {}
      };

      try {

        soap.createClient(
          options.wsdl,
          soapOptions,
          responseHandler(options.onDone, options.onFail)
        );

      }
      catch (ex) {
        errorHandler(ex, options.onFail);
      }

    },

    /**
     * Get information about references.
     *
     * @since   1.0.0
     * @param   {Object}    client                node-soap client.
     * @param   {Object}    options               Request options.
     * @param   {string}    options.username      Username.
     * @param   {string}    options.password      Password.
     * @param   {string}    options.dateStartStr  Start date (dd-MM-yyyy hh:mm:ss).
     * @param   {string}    options.dataEndStr    End date (dd-MM-yyyy hh:mm:ss).
     * @param   {string}    options.type          Return type:
     *                                              P = returns lists of references paid between the
     *                                                  dates specified.
     *                                              R = returns list of references created (not necessarily
     *                                                  paid yet) between the dates specified.
     * @param   {Function}  options.onDone        The callback that handles the response.
     * @param   {Function}  options.onFail        The callback that handles the errors.
     * @return  {Object}
     *          {Object}    result.rawResponse    Raw SOAP response.
     *          {Object}    result.references     References list.
     *          {string}    result.error          Error message.
     *          {boolean}   result.getInfoResult  True if the request was successfull, false otherwise.
     */
    getInfo: function(client, options) {

      var delimiter = /[^;]+/g;

      try {

        client.getInfo(
          options,
          function(err, resp) {

            if (err) {
              errorHandler(err, options.onFail);
              return;
            }

            // Custom result object
            var result = {};
            var ids    = resp.IDsList.match(delimiter);
            var refs   = resp.referencesList.match(delimiter);

            result.references    = _.object(ids, refs);
            result.getInfoResult = resp.GetReferencesInfoResult;
            result.error         = resp.error;
            result.raw           = resp;

            if (typeof onDone === 'function') {
              options.onDone(result);
            }

          },
          client.wsdl.options.wsdl_options || {}
        );

      }
      catch (ex) {
        errorHandler(ex, options.onFail);
      }

    },

    /**
     * Get information about a reference.
     *
     * @since   1.0.0
     * @param   {Object}    client                          node-soap client.
     * @param   {Object}    options                         Request options.
     * @param   {string}    options.username                Username.
     * @param   {string}    options.password                Password.
     * @param   {string}    options.reference               MB/PayShop reference.
     * @param   {Function}  options.onDone                  The callback that handles the response.
     * @param   {Function}  options.onFail                  The callback that handles the errors.
     * @return  {Object}                                    Information about a reference.
     *          {boolean}   result.paid                     True if the reference has been paid at least once,
     *                                                      false otherwise.
     *          {string}    result.status                   Processing state. It can be: "Recebida", "Aceite",
     *                                                      "Recusada" or "Enviada".
     *          {string}    result.lastPaymentDate          Last payment date.
     *          {number}    result.totalPayments            Total number of payments.
     *          {string}    result.error                    Error message.
     *          {boolean}   result.getInfoReferenceResult   True if the request was successfull, false otherwise.
     */
    getInfoReference: function(client, options) {

      try {

        client.getInfoReference(
          options,
          responseHandler(options.onDone, options.onFail),
          client.wsdl.options.wsdl_options || {}
        );

      }
      catch (ex) {
        errorHandler(ex, options.onFail);
      }

    },

    /**
     * Get a new MULTIBANCO reference specifying the amount.
     *
     * @since   1.0.0
     * @param   {Object}    client                        node-soap client.
     * @param   {Object}    options                       Request options.
     * @param   {string}    options.username              Username.
     * @param   {string}    options.password              Password.
     * @param   {number}    options.amount                Amount (in euros) used to generate the reference.
     * @param   {string}    options.email                 The customer email address.
     * @param   {string}    [options.origin]              This parameter is used to store the telephone number when
     *                                                    the request is made via SMS. If the request is received
     *                                                    through the API, it can be used as descriptive of the origin
     *                                                    of the request. This field can also be used to store the URL
     *                                                    on the partner system that CompraFácil will call when
     *                                                    the payment occurs.
     * @param   {string}    [options.additionalInfo]      Additional information that can be passed to CompraFácil.
     * @param   {string}    [options.name]                The name of the customer for whom the reference is generated.
     * @param   {string}    [options.address]             Customer address.
     * @param   {string}    [options.postCode]            Customer zip code.
     * @param   {string}    [options.city]                Customer city/town.
     * @param   {string}    [options.NIC]                 Customer NIF.
     * @param   {string}    [options.externalReference]   Can be used for storing the ATM reference identifier in the
     *                                                    partner system.
     * @param   {string}    [options.contactPhone]        Customer contact phone.
     * @param   {number}    [options.IDUserBackoffice]    When a reference is generated, it may be associated with a
     *                                                    backoffice user in CompraFácil system.
     * @param   {number}    [options.timeLimitDays]       Specifies the total number of days that a reference is payable.
     * @param   {boolean}   [options.sendEmailBuyer]      Specifies whether an email is sent to the customer.
     * @param   {Function}  options.onDone                The callback that handles the response.
     * @param   {Function}  options.onFail                The callback that handles the errors.
     * @return  {Object}                                  MULTIBANCO reference.
     *          {string}    result.reference              MULTIBANCO reference ID.
     *          {string}    result.entity                 MULTIBANCO entity.
     *          {number}    result.amountOut              MULTIBANCO amount.
     *          {string}    result.error                  Error message.
     *          {boolean}   result.getReferenceMBResult   True if the reference was successfully generated, false otherwise.
     */
    getReferenceMB: function(client, options) {
      getReference('getReferenceMB', client, options);
    },

    /**
     * Get a new MULTIBANCO reference specifying a product ID stored in CompraFacil.
     *
     * @since   1.0.0
     * @param   {Object}    client                        node-soap client.
     * @param   {Object}    options                       Request options.
     * @param   {string}    options.username              Username.
     * @param   {string}    options.password              Password.
     * @param   {number}    options.productID             Product ID stored in CompraFácil.
     *                                                    This product has a unit price defined in CompraFácil.
     * @param   {number}    options.quantity              Number of items.
     * @param   {string}    options.email                 The customer email address.
     * @param   {string}    [options.origin]              This parameter is used to store the telephone number when
     *                                                    the request is made via SMS. If the request is received
     *                                                    through the API, it can be used as descriptive of the origin
     *                                                    of the request. This field can also be used to store the URL
     *                                                    on the partner system that CompraFácil will call when
     *                                                    the payment occurs.
     * @param   {string}    [options.additionalInfo]      Additional information that can be passed to CompraFácil.
     * @param   {string}    [options.name]                The name of the customer for whom the reference is generated.
     * @param   {string}    [options.address]             Customer address.
     * @param   {string}    [options.postCode]            Customer zip code.
     * @param   {string}    [options.city]                Customer city/town.
     * @param   {string}    [options.NIC]                 Customer NIF.
     * @param   {string}    [options.externalReference]   Can be used for storing the ATM reference identifier in the
     *                                                    partner system.
     * @param   {string}    [options.contactPhone]        Customer contact phone.
     * @param   {number}    [options.IDUserBackoffice]    When a reference is generated, it may be associated with a
     *                                                    backoffice user in CompraFácil system.
     * @param   {number}    [options.timeLimitDays]       Specifies the total number of days that a reference is payable.
     * @param   {boolean}   [options.sendEmailBuyer]      Specifies whether an email is sent to the customer.
     * @param   {Function}  options.onDone                The callback that handles the response.
     * @param   {Function}  options.onFail                The callback that handles the errors.
     * @return  {Object}                                  MULTIBANCO reference.
     *          {string}    result.reference              MULTIBANCO reference ID.
     *          {string}    result.entity                 MULTIBANCO entity.
     *          {number}    result.amountOut              MULTIBANCO amount.
     *          {string}    result.error                  Error message.
     *          {boolean}   result.getReferenceMBResult   True if the reference was successfully generated, false otherwise.
     */
    getReferenceMB2: function(client, options) {
      getReference('getReferenceMB2', client, options);
    },

    /**
     * Get a new PayShop reference specifying the amount.
     *
     * @since   1.0.0
     * @param   {Object}    client                        node-soap client.
     * @param   {Object}    options                       Request options.
     * @param   {string}    options.username              Username.
     * @param   {string}    options.password              Password.
     * @param   {number}    options.amount                Amount (in euros) used to generate the reference.
     * @param   {string}    options.email                 The customer email address.
     * @param   {string}    [options.origin]              This parameter is used to store the telephone number when
     *                                                    the request is made via SMS. If the request is received
     *                                                    through the API, it can be used as descriptive of the origin
     *                                                    of the request. This field can also be used to store the URL
     *                                                    on the partner system that CompraFácil will call when
     *                                                    the payment occurs.
     * @param   {string}    [options.additionalInfo]      Additional information that can be passed to CompraFácil.
     * @param   {string}    [options.name]                The name of the customer for whom the reference is generated.
     * @param   {string}    [options.address]             Customer address.
     * @param   {string}    [options.postCode]            Customer zip code.
     * @param   {string}    [options.city]                Customer city/town.
     * @param   {string}    [options.NIC]                 Customer NIF.
     * @param   {string}    [options.externalReference]   Can be used for storing the ATM reference identifier in
     *                                                    the partner system.
     * @param   {string}    [options.contactPhone]        Customer contact phone.
     * @param   {number}    [options.IDUserBackoffice]    When a reference is generated, it may be associated with
     *                                                    a backoffice user in CompraFácil system.
     * @param   {number}    [options.timeLimitDays]       Specifies the total number of days that a reference is payable.
     * @param   {boolean}   [options.sendEmailBuyer]      Specifies whether an email is sent to the customer.
     * @param   {Function}  options.onDone                The callback that handles the response.
     * @param   {Function}  options.onFail                The callback that handles the errors.
     * @return  {Object}                                  PayShop reference.
     *          {string}    result.reference              PayShop reference ID.
     *          {string}    result.paymentDeadline        PayShop payment deadline.
     *          {number}    result.amountOut              PayShop amount (in euros).
     *          {string}    result.error                  Error message.
     *          {boolean}   result.getReferenceMBResult   True if the reference was successfully generated, false otherwise.
     */
    getReferencePS: function(client, options) {
      getReference('getReferencePS', client, options);
    },

    /**
     * Get a new PayShop reference specifying the amount.
     *
     * @since   1.0.0
     * @param   {Object}    client                        node-soap client.
     * @param   {Object}    options                       Request options.
     * @param   {string}    options.username              Username.
     * @param   {string}    options.password              Password.
     * @param   {number}    options.productID             Product ID stored in CompraFácil.
     *                                                    This product has a unit price defined in CompraFácil.
     * @param   {number}    options.quantity              Number of items.
     * @param   {string}    options.email                 The customer email address.
     * @param   {string}    [options.origin]              This parameter is used to store the telephone number when
     *                                                    the request is made via SMS. If the request is received
     *                                                    through the API, it can be used as descriptive of the origin
     *                                                    of the request. This field can also be used to store the URL
     *                                                    on the partner system that CompraFácil will call when
     *                                                    the payment occurs.
     * @param   {string}    [options.additionalInfo]      Additional information that can be passed to CompraFácil.
     * @param   {string}    [options.name]                The name of the customer for whom the reference is generated.
     * @param   {string}    [options.address]             Customer address.
     * @param   {string}    [options.postCode]            Customer zip code.
     * @param   {string}    [options.city]                Customer city/town.
     * @param   {string}    [options.NIC]                 Customer NIF.
     * @param   {string}    [options.externalReference]   Can be used for storing the ATM reference identifier in
     *                                                    the partner system.
     * @param   {string}    [options.contactPhone]        Customer contact phone.
     * @param   {number}    [options.IDUserBackoffice]    When a reference is generated, it may be associated with
     *                                                    a backoffice user in CompraFácil system.
     * @param   {number}    [options.timeLimitDays]       Specifies the total number of days that a reference is payable.
     * @param   {boolean}   [options.sendEmailBuyer]      Specifies whether an email is sent to the customer.
     * @param   {Function}  options.onDone                The callback that handles the response.
     * @param   {Function}  options.onFail                The callback that handles the errors.
     * @return  {Object}                                  PayShop reference.
     *          {string}    result.reference              PayShop reference ID.
     *          {string}    result.paymentDeadline        PayShop payment deadline.
     *          {number}    result.amountOut              PayShop amount (in euros).
     *          {string}    result.error                  Error message.
     *          {boolean}   result.getReferenceMBResult   True if the reference was successfully generated, false otherwise.
     */
    getReferencePS2: function(client, options) {
      getReference('getReferencePS2', client, options);
    }

  };

  if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
      function F() {}
      F.prototype = obj;
      return new F();
    };
  }

  module.exports = (function() {
    return Object.create(compraFacil);
  })();

})();
