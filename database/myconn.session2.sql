DROP DATABASE TCGame;

CREATE DATABASE TCGame;

USE TCGame;


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
    name VARCHAR(100) NOT NULL UNIQUE,
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



INSERT INTO cards (name, description, rarity, image_url) VALUES 
('Fire Drake', 'A fierce dragon that breathes fire, ruling the skies with dominance.', 'Legendary', 'https://th.bing.com/th/id/OIP.7r01fS8CijyIEOp00gBpogHaF7?w=732&h=586&rs=1&pid=ImgDetMain'),
('Shadow Stalker', 'A silent predator that strikes from the shadows.', 'Rare', 'https://cdnb.artstation.com/p/assets/images/images/034/240/441/large/nino-is-shadow-stalker.jpg?1611772040'),
('Crystal Golem', 'A towering golem made of shining crystals.', 'Epic', 'https://i.pinimg.com/originals/d4/ec/05/d4ec057171bc4dfd94df491356bd177d.jpg'),
('Clear wing synchro dragon', 'Clear Wing Synchro Dragon is a powerful WIND dragon with impressive abilities.', 'Legendary', 'https://th.bing.com/th/id/OIP.xkRyj_eaa_pU4ifGj4UqMAHaHa?w=202&h=202&c=7&r=0&o=5&pid=1.7'),
('Bone Reaper', 'An undead monster wielding a massive scythe.', 'Legendary', 'https://i.redd.it/v68eqlqwqfu41.jpg'),
('Frost Wyvern', 'A dragon-like creature with freezing breath.', 'Rare', 'https://pm1.narvii.com/6830/e266d4dc9b848a2cb4b11584effa87656f7b7dacv2_hq.jpg'),
('Thunder Behemoth', 'A colossal beast that commands storms.', 'Epic', 'https://i.pinimg.com/originals/0c/4e/87/0c4e87fb254f6988eb3dc1b5f2790dd7.jpg'),
('Swamp Terror', 'A slimy creature lurking in the swamps.', 'Common', 'https://th.bing.com/th/id/OIP.oWrcvgMMpo_zmnBXLsjKrwAAAA?w=156&h=180&c=7&r=0&o=5&pid=1.7'),
('Lava Serpent', 'A snake-like creature born from molten lava.', 'Rare', 'https://cdnb.artstation.com/p/assets/images/images/044/430/611/large/alekzander-zagorulko-lava-creatures-01.jpg?1639995991'),
('Ice Phantom', 'A ghostly figure emanating icy chills.', 'Rare', 'https://th.bing.com/th/id/OIP.77KmSaewb5VdM_2LWaI09wHaHa?rs=1&pid=ImgDetMain'),
('Forest Guardian', 'A peaceful yet powerful protector of the forest.', 'Epic', 'https://th.bing.com/th/id/OIP.w2kM-FJw1gedSgQjpd8PnAHaMF?w=149&h=180&c=7&r=0&o=5&pid=1.7'),
('Stone Titan', 'A massive stone creature guarding ancient ruins.', 'Legendary', 'https://th.bing.com/th/id/OIP.Bpt4rCc3SZL8-6tieP3p5QHaHa?w=175&h=180&c=7&r=0&o=5&pid=1.7'),
('Iron Fang', 'A wolf-like beast with metallic claws and teeth.', 'Rare', 'https://th.bing.com/th/id/OIP.xBxbqgatROfzC2FtTQ0zZgHaJh?rs=1&pid=ImgDetMain'),
('Venom', 'A poisonous arachnid that spits venom.', 'Legendary', 'https://www.comicbookherald.com/wp-content/uploads/2015/01/venom-spider-man-villain.jpg'),
('Sand Wraith', 'A ghostly figure wandering desert dunes.', 'Rare', 'https://img00.deviantart.net/994a/i/2019/126/7/8/custom_designer___sand_wraith_by_snexmy-dd6ar52.png'),
('Ocean Leviathan', 'A massive sea creature lurking in the deep.', 'Legendary', 'https://i.pinimg.com/736x/2d/29/04/2d29045127e9f05ad89af3de6711b72e.jpg'),
('Coina', 'A monster that exists everywhere and used to exchange', 'Common', 'https://static.vecteezy.com/system/resources/previews/017/047/854/original/cute-cat-illustration-cat-kawaii-chibi-drawing-style-cat-cartoon-vector.jpg'),
('Cloud Serpent', 'A serpent that soars gracefully through the clouds.', 'Epic', 'https://th.bing.com/th/id/OIP.C1htnyEkOdOdiINBMjjb2wHaEo?w=1280&h=800&rs=1&pid=ImgDetMain'),
('Dark Harpy', 'A winged creature with a terrifying scream.', 'Rare', 'https://th.bing.com/th/id/OIP.qPavdLTV4cOEpCpswjMRpQHaJy?rs=1&pid=ImgDetMain'),
('Necro Lich', 'A powerful undead sorcerer.', 'Legendary', 'https://th.bing.com/th/id/OIP.4-n-FVGUv3TsjxnbT_bNQgAAAA?rs=1&pid=ImgDetMain'),
('Cave Troll', 'A brutish monster that dwells in dark caves.', 'Common', 'https://th.bing.com/th/id/OIP.8K2XzEz6Zthrg5LOuZ69zQHaFj?rs=1&pid=ImgDetMain'),
('Plague Rat', 'A massive rat spreading disease wherever it goes.', 'Common', 'https://th.bing.com/th/id/OIP.iAmDnMOpmzMqAJUhvdeLvgAAAA?w=236&h=336&rs=1&pid=ImgDetMain'),
('Pyro Elemental', 'A fiery entity of pure flame.', 'Rare', 'https://th.bing.com/th/id/OIP.UtGpWF_19DveO1UA2NLRrAHaHa?w=1380&h=1380&rs=1&pid=ImgDetMain'),
('Abyss Walker', 'A creature that moves between dimensions.', 'Epic', 'https://th.bing.com/th/id/OIP.L2R9hCeQ0OrqiJOmdbV6wwHaNK?rs=1&pid=ImgDetMain'),
('Wind Djinn', 'A mischievous spirit of the wind.', 'Rare', 'https://th.bing.com/th/id/R.77e3314e083a56dacf48d026518d4153?rik=tM%2bmswVVHUcABw&pid=ImgRaw&r=0'),
('Dust Howler', 'A spectral wolf that howls at dusk.', 'Rare', 'https://th.bing.com/th/id/R.d4d3954ee034d24078d4efc483530b4d?rik=gZYBxfA3CIl8jg&pid=ImgRaw&r=0'),
('bugs bunny', 'A tricky rabbit that knows how to get what it wants.', 'Uncommon', 'https://th.bing.com/th/id/OIP.DfwZTspaeb5_5fn8V8bzTgHaEl?w=635&h=393&rs=1&pid=ImgDetMain'),
('Swarm Keeper', 'A humanoid figure surrounded by an insect swarm.', 'Rare', 'https://th.bing.com/th/id/OIP.OhW-VfTqfyIoagPyc12mdgHaHa?w=1024&h=1024&rs=1&pid=ImgDetMain'),
('Golden Griffin', 'A majestic creature with a lion’s body and eagle’s wings.', 'Legendary', 'https://th.bing.com/th/id/R.9e7072be4fd35749fb21c4f7920f9e91?rik=piXdhj7o7%2bV8kA&pid=ImgRaw&r=0'),
('Blight Worm', 'A massive worm that spreads decay.', 'Common', 'https://th.bing.com/th/id/R.097e65b9d1254b07b61721fb6d974b00?rik=ao1Hrm4Apt50%2fA&pid=ImgRaw&r=0'),
('Storm Kraken', 'A sea monster capable of summoning storms.', 'Epic', 'https://orig00.deviantart.net/c52b/f/2011/219/1/f/storm_kraken_by_ionnas-d45qya4.jpg'),
('Lunar Dragon', 'A creature of legend that get stronger under a full moon.', 'Epic', 'https://c4.wallpaperflare.com/wallpaper/244/852/45/how-to-train-your-dragon-how-to-train-your-dragon-the-hidden-world-night-fury-toothless-how-to-train-your-dragon-hd-wallpaper-preview.jpg'),
('Descartes', 'a French philosopher, scientist, and mathematician, widely considered a seminal figure in the emergence of modern philosophy and science.', 'Legendary', 'https://th.bing.com/th/id/OIP.gYVNtMJ-n8_0i8LVf3TOGwHaK1?w=156&h=180&c=7&r=0&o=5&pid=1.7');



