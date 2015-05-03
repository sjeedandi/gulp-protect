(function (encrypted, options, callback) {
  'strict';
  



  // Decrypt the protected sourcecode with the retreived password. 
  // After decryption the string will be evaluated and the callback

  
  function decrypt (decryptionKey) { 
    
    // Decrypt code
    var key = aesjs.util.convertStringToBytes(decryptionKey);
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(__counter__));
    var decryptedBytes = aesCtr.decrypt(encrypted);
     
    // Convert our bytes back into text 
    var decryptedText = aesjs.util.convertBytesToString(decryptedBytes);
   
    // Evaluate decrypted script and callback
    return eval(decryptedText) && callback();
    
  };




  // Request decryption key from an authentication API
  // TODO: Use custom authentication method

  
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
          return false;
        }
      }
    };
    
    xobj.send(null);
  
  };

  return authenticate(options, callback);

})(__encrypted__, __options__, __callback__);


