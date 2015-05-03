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
