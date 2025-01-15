CREATE DATABASE TCGame;

USE TCGame;

DROP DATABASE TCGame;

insert into userinventory (user_id, card_id) VALUES(1, 1);

SELECT * From userinventory where user_id = 1;

-- USERS TABLE: Stores user account information
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(30) UNIQUE NOT NULL,
    password VARCHAR(10),
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    profile_icon VARCHAR(255), -- URL or path to the icon
    description TEXT,
    inventory_limit INT DEFAULT 3 -- Maximum cards allowed on display
);

-- CARDS TABLE: Stores card information
CREATE TABLE Cards (
    card_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    rarity VARCHAR(50),
    -- Common, Rare, Legendary, etc.
    image_url VARCHAR(255) -- URL or path to the card image
);


-- USER_INVENTORY TABLE: Maps cards to users
CREATE TABLE UserInventory (
    inventory_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    card_id INT REFERENCES Cards(card_id) ON DELETE CASCADE,
    is_on_display BOOLEAN DEFAULT FALSE -- Indicates whether the card is displayed
);

-- TRADES TABLE: Stores trading information
CREATE TABLE Trades (
    trade_id SERIAL PRIMARY KEY,
    initiator_user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    -- User initiating the trade
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, accepted, declined
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRADE_CARDS TABLE: Stores the cards involved in trades
CREATE TABLE TradeCards (
    trade_card_id SERIAL PRIMARY KEY,
    trade_id INT REFERENCES Trades(trade_id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    -- User offering the card
    card_id INT REFERENCES Cards(card_id) ON DELETE CASCADE,
    offered BOOLEAN -- TRUE if offered by the user, FALSE if requested
);



INSERT INTO Users (username, display_name, profile_icon, description, inventory_limit, email, password)
VALUES ('john_doe', 'John Doe', 'https://example.com/john.png', 'A passionate collector.', 5, 'something@gmail', '123'),
       ('jane_smith', 'Jane Smith', 'https://example.com/jane.png', 'Loves rare cards.', 3, 'something1@gmail', '213'),
       ('alex_k', 'Alex K', 'https://example.com/alex.png', 'Always up for a trade.', 4, 'something2@gmail', '312');



INSERT INTO Cards (name, description, rarity, image_url)
VALUES ('Dragon Slayer', 'A legendary card.', 'Legendary', 'https://example.com/dragon.png'),
       ('Mystic Elf', 'A rare and powerful card.', 'Rare', 'https://example.com/elf.png'),
       ('Fireball', 'A common attack card.', 'Common', 'https://example.com/fireball.png');




SELECT password
FROM Users
WHERE email = 'something@gmail';

SELECT 
    UI.inventory_id, 
    UI.card_id, 
    UI.is_on_display ,
    UI.
FROM 
    UserInventory UI, Users U
WHERE 
    UI.user_id = U.user_id
;

INSERT INTO Users (email, password, username, display_name, profile_icon, description, inventory_limit) VALUES
('user1@example.com', 'password1', 'user1', 'User One', 'icon1.png', 'First user in the system', 3),
('user2@example.com', 'password2', 'user2', 'User Two', 'icon2.png', 'Second user in the system', 3),
('user3@example.com', 'password3', 'user3', 'User Three', 'icon3.png', 'Third user in the system', 3),
-- ... Add remaining entries for all users
('user30@example.com', 'password30', 'user30', 'User Thirty', 'icon30.png', 'Thirty user in the system', 3);


INSERT INTO Cards (name, description, rarity, image_url) VALUES
('Fireball', 'A powerful fire spell that burns enemies.', 'Legendary', 'fireball.png'),
('Water Splash', 'A splash of water that damages enemies.', 'Rare', 'water_splash.png'),
('Earthquake', 'An earthquake that shakes the ground.', 'Rare', 'earthquake.png'),
-- ... Add remaining entries for all cards
('Holy Grail', 'The legendary grail that grants wishes.', 'Legendary', 'holy_grail.png');

SELECT * FROM userinventory;

DELIMITER $$


CREATE TRIGGER assign_card_on_user_creation
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
    INSERT INTO UserInventory (user_id, card_id)
    VALUES (NEW.user_id, 17);
END$$


DELIMITER ;

INSERT INTO UserInventory (user_id, card_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16);




delete from userinventory;

insert into UserInventory(user_id, card_id, is_on_display) VALUES
(1, 4, TRUE),
(1, 5, TRUE),
(1, 6, TRUE),
(1, 7, TRUE),
(1, 8, TRUE);

UPDATE userinventory set is_on_display=TRUE;

INSERT INTO UserInventory (user_id, card_id, is_on_display) VALUES
(4, 1, TRUE), (4, 2, FALSE), (4, 3, FALSE),
(7, 4, TRUE), (7, 5, FALSE), (8, 6, FALSE);


SELECT * FROM userinventory;
SELECT * FROM tradecards;


INSERT INTO Trades (initiator_user_id, status) VALUES
(1, 'pending'), (2, 'pending'), (3, 'accepted'),
(4, 'declined'), (5, 'pending'), (6, 'accepted'),
-- ... Add remaining entries for all trades
(30, 'accepted');


INSERT INTO TradeCards (trade_id, user_id, card_id, offered) VALUES
(1, 1, 1, TRUE), (1, 2, 2, FALSE), 
(2, 2, 3, TRUE), (2, 3, 4, FALSE),
-- ... Add remaining entries for all trade cards
(30, 30, 29, TRUE), (30, 30, 30, FALSE);


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
    u.email = 'something@gmail';


UPDATE Users
SET 
    username = 'new_username',
    display_name = 'New Display Name',
    profile_icon = 'new_profile_icon_url.png',
    description = 'Updated description here'
WHERE 
    email = 'something@gmail';



SELECT user, plugin FROM mysql.user;


SELECT 
    T.trade_id,
    T.status,
    T.created_at,
    U.username AS initiator_username,
    U.display_name AS initiator_display_name,
    U.email AS initiator_email,
    RequestedCards.card_id AS requested_card_id,
    RequestedCards.name AS requested_card_name,
    RequestedCards.image_url AS requested_card_image,
    OfferedCards.card_id AS offered_card_id,
    OfferedCards.name AS offered_card_name,
    OfferedCards.image_url AS offered_card_image
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
    Cards OfferedCards ON Offered.card_id = OfferedCards.card_id;


SELECT * FROM cards WHERE card_id IN (1, 2, 3, );


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
    TRUE
GROUP BY 
    T.trade_id, T.status, T.created_at, U.username, U.display_name, U.email;

DELETE FROM Trades
WHERE trade_id IN (
    SELECT DISTINCT T.trade_id
    FROM Trades T
    LEFT JOIN TradeCards Requested ON T.trade_id = Requested.trade_id AND Requested.offered = FALSE
    LEFT JOIN TradeCards Offered ON T.trade_id = Offered.trade_id AND Offered.offered = TRUE
    WHERE 
        Requested.card_id IS NULL OR Offered.card_id IS NULL
);

-- Insert trade
INSERT INTO Trades (initiator_user_id, status) 
VALUES (4, 'pending');

SELECT * FROM USERS;


-- Retrieve the last inserted trade_id
-- Get the trade_id of the trade that has no associated cards (still empty)
SELECT T.trade_id
FROM Trades T
LEFT JOIN TradeCards TC ON T.trade_id = TC.trade_id
WHERE T.initiator_user_id = (SELECT user_id FROM Users WHERE email = 'something@gmail')
GROUP BY T.trade_id
HAVING COUNT(TC.trade_card_id) = 0;


-- Assuming trade_id is 1:
-- Insert offered cards
INSERT INTO TradeCards (trade_id, user_id, card_id, offered)
VALUES 
    (9, 8, 1, TRUE),
    (9, 8, 2, TRUE);


SELECT*from trades;
-- Insert requested cards
INSERT INTO TradeCards (trade_id, user_id, card_id, offered)
VALUES 
    (9, 8, 7, FALSE),
    (9, 8, 4, FALSE),
    (9, 8, 3, FALSE);



SELECT 
    UI.inventory_id,
    C.card_id,
    C.name AS card_name,
    C.description AS card_description,
    C.rarity,
    C.image_url,
    UI.is_on_display
FROM 
    UserInventory UI
JOIN 
    Users U ON UI.user_id = U.user_id
JOIN 
    Cards C ON UI.card_id = C.card_id
WHERE 
    U.email = 'something@gmail';


DELETE FROM Trades
WHERE trade_id NOT IN (
    SELECT DISTINCT trade_id
    FROM TradeCards
);


-- Insert the card "Clear Wing Synchro Dragon" into the Cards table
INSERT INTO Cards (name, description, rarity, image_url)
VALUES 
('Clear Wing Synchro Dragon', 'A powerful dragon that negates effects and counters strategies.', 'Legendary', 'https://example.com/clear_wing_synchro_dragon.jpg');

-- Get the card_id of the inserted card and assign it to user with id 4
INSERT INTO UserInventory (user_id, card_id)
SELECT 4, card_id
FROM Cards
WHERE name = 'Clear Wing Synchro Dragon';

-- Insert the card "Pikachu" into the Cards table
INSERT INTO Cards (name, description, rarity, image_url)
VALUES 
('Pikachu', 'An electric mouse Pokémon known for its Thunderbolt attack.', 'Rare', 'https://example.com/pikachu.jpg');

-- Get the card_id of the inserted card and assign it to user with id 7
INSERT INTO UserInventory (user_id, card_id)
SELECT 7, card_id
FROM Cards
WHERE name = 'Pikachu';


SET @receiver_id = (SELECT user_id FROM Users WHERE email = 'something@gmail');

SET @giver_id = (SELECT user_id FROM Users WHERE display_name = 'juho');


UPDATE UserInventory
SET user_id = 7
WHERE user_id = 4
AND card_id IN (
    SELECT card_id FROM Cards WHERE name IN ('Pikachu')
);

UPDATE UserInventory
SET user_id = 4
WHERE user_id = 7
AND card_id IN (
    SELECT card_id FROM Cards WHERE name IN ('Clear Wing Synchro Dragon')
);


SELECT 
    C.card_id,
    C.name,
    C.description,
    C.rarity,
    C.image_url
FROM 
    UserInventory UI
JOIN 
    Cards C ON UI.card_id = C.card_id
WHERE 
    UI.user_id = 7;
