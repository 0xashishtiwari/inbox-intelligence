import {encrypt, decrypt} from './encryption.js';


const testEncryption = () => {
    const originalText = 'Hello, World!';
    const encryptedText = encrypt(originalText);
    const decryptedText = decrypt(encryptedText);

    console.log('Original Text:', originalText);
    console.log('Encrypted Text:', encryptedText);
    console.log('Decrypted Text:', decryptedText);


    if (originalText === decryptedText) {
        console.log('Encryption and decryption are working correctly.');
    }


}

testEncryption();