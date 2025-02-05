export function getPasswordQuery() {
    // needs: email
      return `
      SELECT password
      FROM Users
      WHERE email = $1;
      `;
  }
  
  export function getCreatingQuery() {
    // needs: email, password, username
      return `
          INSERT INTO users (email, password, username) 
          VALUES ($1, $2, $3);
      `;
  }
  
  export function getUserDataQuery() {
    // needs: email
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
          email = $1;
      `;
  }
  
  export function getUpdateQuery() {
    // needs: email, username, display_name, profile_url, description
      return `
      UPDATE Users
      SET 
          username = $2,
          display_name = $3,
          profile_icon = $4,
          description = $5
      WHERE 
          email = $1;
      `;
  }
  
  export function getAllTradesQuery() {
    // no parameters needed
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
  
  export function createTradeQuery() {
    // needs: email
      return `
      INSERT INTO Trades (initiator_user_id, status)
      SELECT U.user_id, 'pending'
      FROM Users U
      WHERE U.email = $1;
      `;
  }
  
  export function addCardsToTrade() {
    // needs: trade_id, cards, offered
      return `
      INSERT INTO TradeCards (trade_id, user_id, card_id, offered)
      SELECT 
          $1, 
          U.user_id, 
          C.card_id, 
          $3
      FROM 
          Users U
      JOIN 
          Cards C ON C.card_id = ANY($2)
      WHERE 
          U.user_id = (SELECT initiator_user_id FROM Trades WHERE trade_id = $1);
      `;
  }
  
  export function giveMeMyLastTradeId() {
    // needs: email
      return `
      SELECT T.trade_id
      FROM Trades T
      LEFT JOIN TradeCards TC ON T.trade_id = TC.trade_id
      WHERE T.initiator_user_id = (SELECT user_id FROM Users WHERE email = $1)
      GROUP BY T.trade_id
      HAVING COUNT(TC.trade_card_id) = 0;
      `;
  }
  
  export function turnNamesToNumbers() {
    // needs: loc (array of names)
      return `
      SELECT card_id
      FROM Cards
      WHERE name = ANY($1);
      `;
  }
  
  export function distribute17Query() {
    // no parameters needed
      return `
      INSERT INTO UserInventory (user_id, card_id)
      SELECT user_id, 17
      FROM Users;
      `;
  }
  
  export function getIdFromEmailQuery() {
    // needs: email
      return `SELECT user_id FROM Users WHERE email = $1;`;
  }
  
  export function getIdFromTradeQuery() {
    // needs: trade_id
      return `SELECT initiator_user_id AS giver_id FROM Trades WHERE trade_id = $1;`;
  }
  
  export function getCardsListQuery() {
    // needs: trade_id
      return `
          SELECT 
              card_id, 
              offered 
          FROM 
              TradeCards 
          WHERE 
              trade_id = $1;
      `;
  }
  
  export function transfertCardQuery() {
    // needs: to_id, from_id, this_card_id, count
      return `
          WITH updated_rows AS (
          SELECT inventory_id
          FROM UserInventory
          WHERE user_id = $2
          AND card_id = $3
          LIMIT $4
              )
          UPDATE UserInventory
          SET user_id = $1
          WHERE inventory_id IN (SELECT inventory_id FROM updated_rows);
      `;
  }
  
  export function checkOwnership() {
    // needs: user_id
      return `
          SELECT card_id, COUNT(*) AS count
          FROM UserInventory
          WHERE user_id = $1
          GROUP BY card_id;
      `;
  }
  
  export function getUserInventoryQuery() {
    // needs: email
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
          u.email = $1;
      `;
  }
  
  export function distributeRootQuery() {
    // no parameters needed
      return `
      INSERT INTO UserInventory (user_id, card_id, is_on_display)
      SELECT 1, card_id, FALSE
      FROM Cards
      ORDER BY RANDOM()
      LIMIT 1;
      `;
  }
  