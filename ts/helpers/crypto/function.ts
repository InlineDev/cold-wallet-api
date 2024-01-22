import CryptoJS from 'crypto-js';
// Функция для шифрования строки с использованием AES и ключа

function encryptString(text: string, key: string): string {
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
}

// Функция для дешифрования строки с использованием AES и ключа
function decryptString(encryptedText: string, key: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
    return decrypted;
}

export {
    encryptString,
    decryptString,
}