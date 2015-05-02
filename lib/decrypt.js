function decrypt (input, password) {

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
    return decipher.output.toString();
  } else {
    return null;
  }

};

eval(decrypt(protect, 'secret'));

