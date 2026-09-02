import {encrypt, decrypt} from './encryption.js';

const testString = 'Hello, World!';

console.log('Original:', testString);
const encrypted = encrypt(testString);
console.log('Encrypted:', encrypted);
const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);