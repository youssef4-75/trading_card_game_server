export function getPasswordQuery(email) {
    return `
    SELECT password
    FROM Users
    WHERE email = '${email}';
    `;
}

export function getCreatingQuery(email, password, username) {
    return `
        INSERT INTO users (email, password, username) 
        VALUES ('${email}', '${password}', '${username}');
    `;
}

export function getUserDataQuery(email) {
    return `
    SELECT 
        user_id, 
        email, 
        username, 
        display_name, 
        profile_icon, 
        description,
        inventory_limit 
    FROM 
        Users 
    WHERE 
        email = '${email}';
    `;
}

export function getUpdateQuery(email, username, display_name, profile_url, description) {
    return `
    UPDATE Users
    SET 
        username = '${username}',
        display_name = '${display_name}',
        profile_icon = '${profile_url}',
        description = '${description}'
    WHERE 
        email = '${email}';
    `;
}

export function getAllTradesQuery() {
    return `
    SELECT
        T.trade_id,
        T.status,
        U.display_name AS initiator_display_name,
        STRING_AGG(DISTINCT CONCAT(RequestedCards.card_id, '|', RequestedCards.name, '|', RequestedCards.image_url), ';') AS requested_cards,
        STRING_AGG(DISTINCT CONCAT(OfferedCards.card_id, '|', OfferedCards.name, '|', OfferedCards.image_url), ';') AS offered_cards
    FROM 
        Trades T
    JOIN 
        Users U ON T.initiator_user_id = U.user_id
    LEFT JOIN 
        TradeCards Requested ON T.trade_id = Requested.trade_id AND Requested.offered = FALSE
    LEFT JOIN 
        Cards RequestedCards ON Requested.card_id = RequestedCards.card_id
    LEFT JOIN 
        TradeCards Offered ON T.trade_id = Offered.trade_id AND Offered.offered = TRUE
    LEFT JOIN 
        Cards OfferedCards ON Offered.card_id = OfferedCards.card_id
    WHERE 
        T.status = 'pending'
    GROUP BY 
        T.trade_id, T.status, T.created_at, U.username, U.display_name, U.email;
    `;
}

export function createTradeQuery(email) {
    return `
    INSERT INTO Trades (initiator_user_id, status)
    SELECT U.user_id, 'pending'
    FROM Users U
    WHERE U.email = '${email}';
    `;
}

export function addCardsToTrade(trade_id, cards, offered) {
    const res = cards.map(card => `'${card}'`).join(',');
    return `
    INSERT INTO TradeCards (trade_id, user_id, card_id, offered)
    SELECT 
        ${trade_id}, 
        U.user_id, 
        C.card_id, 
        ${offered}
    FROM 
        Users U
    JOIN 
        Cards C ON C.card_id IN (${res})
    WHERE 
        U.user_id = (SELECT initiator_user_id FROM Trades WHERE trade_id = ${trade_id});
    `;
}

export function giveMeMyLastTradeId(email) {
    return `
    SELECT T.trade_id
    FROM Trades T
    LEFT JOIN TradeCards TC ON T.trade_id = TC.trade_id
    WHERE T.initiator_user_id = (SELECT user_id FROM Users WHERE email = '${email}')
    GROUP BY T.trade_id
    HAVING COUNT(TC.trade_card_id) = 0;
    `;
}

export function turnNamesToNumbers(loc) {
    const res = loc.map(name => `'${name}'`).join(',');
    return `
    SELECT card_id
    FROM Cards
    WHERE name IN (${res});
    `;
}

export function distribute17Query() {
    return `
    INSERT INTO UserInventory (user_id, card_id)
    SELECT user_id, 17
    FROM Users;
    `;
}

export function getIdFromEmailQuery(email) {
    return `SELECT user_id FROM Users WHERE email = '${email}';`;
}

export function getIdFromTradeQuery(trade_id) {
    return `SELECT initiator_user_id AS giver_id FROM Trades WHERE trade_id = ${trade_id};`;
}

export function getCardsListQuery(trade_id) {
    return `
        SELECT 
            card_id, 
            offered 
        FROM 
            TradeCards 
        WHERE 
            trade_id = ${trade_id}
    `;
}

export function transfertCardQuery(to_id, from_id, this_card_id, count) {
    return `
        UPDATE UserInventory
        SET user_id = ${to_id}
        WHERE user_id = ${from_id}
        AND card_id = ${this_card_id}
        LIMIT ${count}
    `;
}

export function checkOwnership(user_id) {
    return `
        SELECT card_id, COUNT(*) AS count
        FROM UserInventory
        WHERE user_id = ${user_id}
        GROUP BY card_id
    `;
}

export function getUserInventoryQuery(email) {
    return `
    SELECT 
        c.card_id,
        c.name AS card_name,
        c.rarity,
        c.image_url,
        c.description
    FROM 
        UserInventory ui
    JOIN 
        Users u ON ui.user_id = u.user_id
    JOIN 
        Cards c ON ui.card_id = c.card_id
    WHERE 
        u.email = '${email}';
    `;
}
