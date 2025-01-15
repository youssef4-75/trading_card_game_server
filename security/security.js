const urlPattern = /^[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=%]+$/;
export const isValidUrl = (url) => urlPattern.test(url);

export function check(word, chars, and_or) {
    console.log(word);
    const charArray = chars.split('');
    if (and_or) {
        return word.split('').every(char => charArray.includes(char));
    } else {
        return word.split('').some(char => charArray.includes(char));
    }
}

export function checkPasswordEquality(password, candidat) {
    if (candidat == null || candidat == undefined) return false;
    if (password.length !== candidat.length) {
        return false;
    }

    const indices = Array.from({ length: password.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[randomIndex]] = [indices[randomIndex], indices[i]];
    }

    for (const index of indices) {
        if (password[index] !== candidat[index]) {
            return false;
        }
    }

    return true;
}