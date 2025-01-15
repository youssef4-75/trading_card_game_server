import { alphabet, numbers } from "../util/__vars.js";
import { execute } from "./database.js";
import {
    addCardsToTrade,
    checkOwnership,
    createTradeQuery, distribute17Query, getAllTradesQuery,
    getCardsListQuery,
    getCreatingQuery, getIdFromEmailQuery, getIdFromTradeQuery, getPasswordQuery,
    getUpdateQuery,
    getUserDataQuery,
    giveMeMyLastTradeId, transfertCardQuery, turnNamesToNumbers
} from "./query_base.js";
import { check, isValidUrl } from "../security/security.js";
import { countOccurrences } from "../util/functions.js";


export async function getPassword(email) {
    if (!check(email, alphabet + numbers + '@.', true)) {
        return null;
    }
    const query = getPasswordQuery(email);
    console.log("the query that will be executed is: ", query);
    try {
        const results = await execute(query);
        if (results.length === 0) {
            throw new Error('User not found');
        }
        return results[0].password;
    } catch (error) {
        console.error('Error fetching password:', error.message);
        throw error;
    }
}


export async function createNewUser(email, psswd, username) {
    if (!check(email, alphabet + numbers + '@.', true)) {
        console.log('Invalid email format.', email);
        return;
    }

    if (psswd.length < 6) {
        console.log('Password must be at least 6 characters long.');
        return;
    }

    // if (!check(username, alphabet + numbers) &&
    //     (username.length < 3 ||
    //         username.length > 20)) {
    //     console.log('Username must be between 3 and 20 characters.');
    //     return;
    // }

    
    
    try {
        
        const checkQuery = getPasswordQuery(email);
        const checkResult = await execute(checkQuery);
        
        if (checkResult.length !== 0) {
            throw new Error('User already exists');
        }
        
        
        const query = getCreatingQuery(email, psswd, username);
        await execute(query);

        return {
            success: true,
            message: 'User created successfully!'
        };
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('User with this email or username already exists.');
        }
        throw new Error('Error creating user.');
    }
}


export async function loadUserData(email) {

    const query = getUserDataQuery(email);
    const result = await execute(query);

    console.log("the query that will be executed is: ", query);

    if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    return result[0];
}


export async function updateUserData(email, username, display_name, profile_url, description) {
    if (!isValidUrl(profile_url)) {
        return false;
    }

    const query = getUpdateQuery(email, username, display_name, profile_url, description);
    await execute(query);
    return true
}


export async function getAllTrades() {
    const query = getAllTradesQuery();
    return await execute(query);
}


export async function addTrade(email, re, of) {
    const query_create_trade = createTradeQuery(email);
    await execute(query_create_trade);

    const query_get_trade_id = giveMeMyLastTradeId(email);
    const result_get_trade_id = await execute(query_get_trade_id);
    const trade_id = result_get_trade_id[0].trade_id;

    const query_give_me_ids_re = turnNamesToNumbers(re);
    const result_give_me_ids_re = await execute(query_give_me_ids_re);
    let list_re_id = result_give_me_ids_re.map(element => {
        return element.card_id;
    });

    const query_give_me_ids_of = turnNamesToNumbers(of);
    const result_give_me_ids_of = await execute(query_give_me_ids_of);
    let list_of_id = result_give_me_ids_of.map(element => {
        return element.card_id;
    });

    const query_exchange_re = addCardsToTrade(trade_id, list_re_id, false);
    await execute(query_exchange_re);

    const query_exchange_of = addCardsToTrade(trade_id, list_of_id, true);
    await execute(query_exchange_of);
}


export async function exchangeCard(email, id) {
    console.log("proceed with exchanging");
    const [giver_id, receiver_id] = await getGiverReceiverId(id, email);
    console.log("getting giver and receiver ids", giver_id, receiver_id);

    if (!giver_id || !receiver_id) return "the trade doesnt exist, or the email/display name are not valid";

    const [off, req] = await getCardsList(id);
    console.log("getting offered and requested cards", off, req);

    const [occ_off, occ_req] = [countOccurrences(off), countOccurrences(req)];

    const giving_is_possible = await cardsOwnershipChecked(occ_off, giver_id);
    console.log("verify giving", giving_is_possible);
    if (!giving_is_possible) return "giving is impossible: the other user don't have the offered cards anymore";

    const receiving_is_possible = await cardsOwnershipChecked(occ_req, receiver_id);
    console.log("verify receiving", receiving_is_possible);
    if (!receiving_is_possible) return "receiving is impossible: you don't have the requested cards ";

    await exchangeCards(occ_off, giver_id, receiver_id);
    await exchangeCards(occ_req, receiver_id, giver_id);
}


async function getGiverReceiverId(trade_id, receiver_email) {
    try {
        const receiverQuery = getIdFromEmailQuery(receiver_email);
        console.log(receiverQuery);
        const receiverResult = await execute(receiverQuery);

        if (receiverResult.length === 0) return [null, null];

        const receiver_id = receiverResult[0].user_id;

        const giverQuery = getIdFromTradeQuery(trade_id);
        const giverResult = await execute(giverQuery);

        if (giverResult.length === 0) return [null, null];
        const giver_id = giverResult[0].giver_id;

        return [giver_id, receiver_id];
    } catch (error) {
        console.error("Error fetching trade participants:", error.message);
        throw error; 
    }
}

async function getCardsList(trade_id) {
    try {
        const query = getCardsListQuery(trade_id);

        const result = await execute(query);

        const offered_cards = [];
        const requested_cards = [];

        result.forEach(card => {
            if (card.offered) {
                offered_cards.push(card.card_id);
            } else {
                requested_cards.push(card.card_id);
            }
        });

        return [offered_cards, requested_cards];
    } catch (error) {
        console.error("Error fetching trade cards:", error.message);
        throw error; 
    }
}

async function cardsOwnershipChecked(occ_cards, user_id) {
    try {
        console.log(`checking the ownership`);
        const query = checkOwnership(user_id);
        console.log(`the query to execute is: `, query);

        const inventory = await execute(query);
        console.log(`the user have: `, inventory);
        console.log(`cards to check are: `, occ_cards);

        const inventoryMap = {};
        inventory.forEach(item => {
            inventoryMap[item.card_id] = item.count;
        });
        console.log(`in other words: `, inventoryMap);

        for (const [cardId, offeredCount] of Object.entries(occ_cards)) {
            const availableCount = inventoryMap[cardId] || 0;
            console.log(availableCount, offeredCount)
            if (availableCount < offeredCount) {
                console.log(`returning false`);
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error("Error checking card ownership:", error.message);
        throw error;
    }
}

async function exchangeCards(cards_id, from_id, to_id) {
    try {
        for (const [this_card_id, count] of Object.entries(cards_id)) {
            const query = transfertCardQuery(to_id, from_id, this_card_id, count);

            const result = await execute(query);
        }
    } catch (error) {
        console.error("Error exchanging cards:", error.message);
        throw error; 
    }
}


export async function distribute17() {
    try {
        await execute(distribute17Query());
    } catch (error) {
        console.error("Error 17 ---------------------------------------------------:\n", error);
    }
    setTimeout(distribute17, 24 * 3600 * 1000);
}