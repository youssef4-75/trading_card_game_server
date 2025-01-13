export function getPasswordPQuery(email) {
    return `
    SELECT password
    FROM Users
    WHERE email = '${email}';
`
}


export function getCreatingQuery(email, password, username) {
    return `
        INSERT INTO users (email, password, username) 
        VALUES ('${email}', '${password}', '${username}')
    `;
}

export function getUserDataQuery(email) {
    return `SELECT 
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
    email = '${email}';`
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


`
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
`
}

export function getAllTradesQuery() {
    return `
SELECT
    T.trade_id,
    T.status,
    U.display_name AS initiator_display_name,
    GROUP_CONCAT(DISTINCT CONCAT(RequestedCards.card_id, '|', RequestedCards.name, '|', RequestedCards.image_url) SEPARATOR ';') AS requested_cards,
    GROUP_CONCAT(DISTINCT CONCAT(OfferedCards.card_id, '|', OfferedCards.name, '|', OfferedCards.image_url) SEPARATOR ';') AS offered_cards
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
`
}

export function createTradeQuery(email){
    return `
INSERT INTO Trades (initiator_user_id, status)
SELECT U.user_id, 'pending'
FROM Users U
WHERE U.email = '${email}';
`
}

export function addCardsToTrade(trade_id, cards, offered){
    // cards: is a list of object that represent cards, each card need to obligatory contains its id
    // trade_id is apparently an id, a number in other words
    let res = ``;
    cards.forEach(element => {
        res +=  `${element},`       
    });
    res += `-1`;
    return `
    INSERT INTO TradeCards (trade_id, user_id, card_id, offered)
SELECT 
    T.trade_id, 
    U.user_id, 
    C.card_id, 
    ${offered}
FROM 
    Trades T
JOIN 
    Users U ON U.user_id = T.initiator_user_id
JOIN 
    Cards C
WHERE 
    T.trade_id = ${trade_id}
    AND C.card_id IN (${res});
`;
}

export function giveMeMyLastTradeId(email){
    return `
SELECT T.trade_id
FROM Trades T
LEFT JOIN TradeCards TC ON T.trade_id = TC.trade_id
WHERE T.initiator_user_id = (SELECT user_id FROM Users WHERE email = '${email}')
GROUP BY T.trade_id
HAVING COUNT(TC.trade_card_id) = 0;
`;

}

export function turnNamesToNumbers(loc){
    let res = ``
    loc.forEach(cardName => {
        res += `"${cardName}", `
    })

    res += `""`;

    return `
SELECT card_id
FROM Cards
WHERE name IN (${res});
`;


}


export function getUserCardOwnershipQuery(email, cardNames) {
    const cardNamesList = cardNames.map(name => `'${name}'`).join(", ");
    return `
      SELECT U.user_id, U.email, U.username
      FROM Users U
      JOIN UserInventory UI ON U.user_id = UI.user_id
      JOIN Cards C ON UI.card_id = C.card_id
      WHERE U.email = '${email}'
        AND C.name IN (${cardNamesList})
      GROUP BY U.user_id
      HAVING COUNT(DISTINCT C.card_id) = ${cardNames.length};
    `;
}


export function* getSwitchOwnershipQuery(email, display_name, offeredCards, requestedCards, trade_id) {
    const offeredCardsList = offeredCards.map(name => `'${name}'`).join(", ");
    const requestedCardsList = requestedCards.map(name => `'${name}'`).join(", ");
  
    yield `
      SET @receiver_id = (SELECT user_id FROM Users WHERE email = '${email}');
    `;

    yield `
      SET @giver_id = (SELECT user_id FROM Users WHERE display_name = '${display_name}');
    `;

    yield `
      UPDATE UserInventory
      SET user_id = @receiver_id
      WHERE user_id = @giver_id
        AND card_id IN (
          SELECT card_id FROM Cards WHERE name IN (${offeredCardsList})
        );

    `;

    yield `
      UPDATE UserInventory
      SET user_id = @giver_id
      WHERE user_id = @receiver_id
        AND card_id IN (
          SELECT card_id FROM Cards WHERE name IN (${requestedCardsList})
        );
    `;

    yield `
    UPDATE Trades
    SET status = 'accepted'
    WHERE trade_id = ${trade_id};
  `;
  }

  
export function distribute17Query(){
    return `
INSERT INTO UserInventory (user_id, card_id)
SELECT user_id, 17
FROM Users;

`
}