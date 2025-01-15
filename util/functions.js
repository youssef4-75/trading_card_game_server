export function countOccurrences(list) {
    const occ_list = {};
    list.forEach(element => {
        occ_list[element] = (occ_list[element] || 0) + 1;
    });
    return occ_list;
}
