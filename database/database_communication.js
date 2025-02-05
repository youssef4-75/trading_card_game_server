import { alphabet, loop, numbers } from "../util/__vars.js";
import { execute, end } from "./databasePG.js";
import {
    addCardsToTrade,
    checkOwnership,
    createTradeQuery, distribute17Query, distributeRootQuery, getAllTradesQuery,
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
    const query = getPasswordQuery();
    try {
        const results = await execute(query, [email]);
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
        return;
    }

    if (psswd.length < 6) {
        return;
    }

    try {

        const checkQuery = getPasswordQuery();
        const checkResult = await execute(checkQuery, [email]);

        if (checkResult.length !== 0) {
            throw new Error('User already exists');
        }

        const query = getCreatingQuery();
        await execute(query, [email, psswd, username]);

        return {
            success: true,
            message: 'User created successfully!'
        };
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('User with this email or username already exists.');
        }
        throw new Error('Error creating user.' + error);
    }
}



export async function loadUserData(email) {

    const query = getUserDataQuery();
    const result = await execute(query, [email]);

    ("the query that will be executed is: ", query);

    if (result.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    return result[0];
}


export async function updateUserData(email, username, display_name, profile_url, description) {
    if (!isValidUrl(profile_url)) {
        return false;
    }

    const query = getUpdateQuery();
    await execute(query, [email, username, display_name, profile_url, description]);
    return true
}


export async function getAllTrades() {
    const query = getAllTradesQuery();
    return await execute(query);
}


export async function addTrade(email, re, of) {
    const query_create_trade = createTradeQuery();
    await execute(query_create_trade, [email]);

    const query_get_trade_id = giveMeMyLastTradeId();
    const result_get_trade_id = await execute(query_get_trade_id, [email]);
    const trade_id = result_get_trade_id[0].trade_id;

    const query_give_me_ids = turnNamesToNumbers();


    const result_give_me_ids_re = await execute(query_give_me_ids, [re]);
    let list_re_id = result_give_me_ids_re.map(element => {
        return element.card_id;
    });

    const result_give_me_ids_of = await execute(query_give_me_ids, [of]);
    let list_of_id = result_give_me_ids_of.map(element => {
        return element.card_id;
    });

    const query_exchange = addCardsToTrade();


    await execute(query_exchange, [trade_id, list_re_id, false]);    
    await execute(query_exchange, [trade_id, list_of_id, true]);
}


export async function exchangeCard(email, trade_id) {
    const [giver_id, receiver_id] = await getGiverReceiverId(trade_id, email);

    if (!giver_id || !receiver_id) return "the trade doesnt exist, or the email/display name are not valid";

    const [off, req] = await getCardsList(trade_id);

    const [occ_off, occ_req] = [countOccurrences(off), countOccurrences(req)];

    const giving_is_possible = await cardsOwnershipChecked(occ_off, giver_id);
    if (!giving_is_possible) return "giving is impossible: the other user don't have the offered cards anymore";

    const receiving_is_possible = await cardsOwnershipChecked(occ_req, receiver_id);
    if (!receiving_is_possible) return "receiving is impossible: you don't have the requested cards ";

    await exchangeCards(occ_off, giver_id, receiver_id);
    await exchangeCards(occ_req, receiver_id, giver_id);
}


async function getGiverReceiverId(trade_id, receiver_email) {
    try {
        const receiverQuery = getIdFromEmailQuery();
        const receiverResult = await execute(receiverQuery, [receiver_email]);

        if (receiverResult.length === 0) return [null, null];

        const receiver_id = receiverResult[0].user_id;

        const giverQuery = getIdFromTradeQuery();
        const giverResult = await execute(giverQuery, [trade_id]);

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
        const query = getCardsListQuery();

        const result = await execute(query, [trade_id]);

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
        const query = checkOwnership();

        const inventory = await execute(query, [user_id]);

        const inventoryMap = {};
        inventory.forEach(item => {
            inventoryMap[item.card_id] = item.count;
        });

        for (const [cardId, offeredCount] of Object.entries(occ_cards)) {
            const availableCount = inventoryMap[cardId] || 0;
            if (availableCount < offeredCount) {
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
            const query = transfertCardQuery();

            await execute(query, [to_id, from_id, this_card_id, count]);
        }
    } catch (error) {
        console.error("Error exchanging cards:", error.message);
        throw error;
    }
}


export async function distribute17Root() {
    try {
        await execute(distribute17Query());
        await execute(distributeRootQuery())
    } catch (error) {
        console.error("Error 17 ---------------------------------------------------:\n", error);
    }
    setTimeout(distribute17Root, loop * 3600 * 1000);
}
