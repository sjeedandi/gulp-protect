/**
 * @param  {String}   input    AES encrypted and Base64 encoded string with protected sourcecode.
 * @param  {Object}   options
 * @param  {Function} callback Callback for bootstrapping the application after encryption.
 */
(function (input, options, callback) {
  'strict';
  
  /**
   * Decrypt the protected sourcecode with the retreived password. 
   * After decryption the string will be evaluated and the callback
   * will be executed. 
   * @method decrypt 
   * @param  {String} password
   */
  function decrypt (password) { 
    
    console.log('decrypt', password);
    // parse salt from input
    input = forge.util.createBuffer(forge.util.decode64(input));
    // skip "Salted__" (if known to be present)
    input.getBytes('Salted__'.length);
    // read 8-byte salt
    var salt = input.getBytes(8);

    // Note: if using "-nosalt", skip above parsing and use
    // var salt = null;

    // 3DES key and IV sizes
    var keySize = 24;
    var ivSize = 8;

    var derivedBytes = forge.pbe.opensslDeriveBytes(password, salt, keySize + ivSize);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = buffer.getBytes(keySize);
    var iv = buffer.getBytes(ivSize);
    
    var decipher = forge.cipher.createDecipher('3DES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(input);
    
    var result = decipher.finish(); // check 'result' for true/false
    
    if (result) {
      return eval(decipher.output.toString()) && callback();
    }

  };


  /**
   * @method authenticate Request decryption key from an authentication API
   * @param  {Object} options 
   * @return {Function} decrypt
   */
  function authenticate (options) {
    
    var xobj = new XMLHttpRequest();
    
    xobj.overrideMimeType("application/json");
    xobj.open('GET', options.url, true);
    xobj.setRequestHeader("Content-Type", 'application/json');
    
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && (xobj.status == "200" || xobj.status == "304")) {
        try {
          return decrypt(JSON.parse(xobj.responseText)._id);
        } catch (err) {
          console.error(error);
          return false;
        }
      }
    };
    
    xobj.send(null);
  
  };

  return authenticate(options, callback);

})(__encrypted__, __options__, __callback__);


