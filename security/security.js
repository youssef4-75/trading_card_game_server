const urlPattern = /^[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=%]+$/;
export const isValidUrl = (url) => urlPattern.test(url);

export function check(word, chars, and_or) {
    // Convert the chars string to an array for easier comparison
    const charArray = chars.split('');

    // If and_or is true, check if every character in the word is in chars
    if (and_or) {
        return word.split('').every(char => charArray.includes(char));
    }
    // If and_or is false, check if at least one character in the word is in chars
    else {
        return word.split('').some(char => charArray.includes(char));
    }
}


export function checkPasswordEquality(password, candidat) {
    // if candidat is null then the 
    //      user try to use some malicious code to the server.
    // ill check later, if that happened three successive times,
    //      ill ban that user from reaching the server (when ill 
    //      have the ability to adapt my firewall in my code)
    if (candidat == null || candidat == undefined) return false

    // Check if the strings have the same size
    if (password.length !== candidat.length) {
        return false;
    }


    const indices = Array.from({ length: password.length }, (_, i) => i);

    // Shuffle the indices array randomly
    for (let i = indices.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[randomIndex]] = [indices[randomIndex], indices[i]];
    }

    // Loop through the shuffled indices and compare characters
    for (const index of indices) {
        if (password[index] !== candidat[index]) {
            return false;
        }
    }

    // If all characters match, return true
    return true;
}


// console.log(checkPasswordEquality('here ', 'here°')); // gave me fale