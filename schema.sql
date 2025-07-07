-- Create the database
CREATE DATABASE IF NOT EXISTS ifbshare;
USE ifbshare;

-- Table for degrees
CREATE TABLE IF NOT EXISTS degrees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Table for users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    nickname VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    picture BLOB,
    degree_id INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (degree_id) REFERENCES degrees(id)
);

-- Index for unverified users to expire
CREATE INDEX idx_unverified_users ON users (createdAt) WHERE verified = FALSE;

-- Table for posts
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    author_id VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Table for tags
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Junction table for post-tags many-to-many relationship
CREATE TABLE IF NOT EXISTS post_tags (
    post_id VARCHAR(36) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Table for files
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contentType VARCHAR(255) NOT NULL,
    size VARCHAR(255) NOT NULL,
    post_id VARCHAR(36) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table for verify_tokens
CREATE TABLE IF NOT EXISTS verify_tokens (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    expiresAt DATETIME NOT NULL,
    type ENUM('email', 'password_reset') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for verify_tokens to expire
CREATE INDEX idx_verify_tokens_expiresAt ON verify_tokens (expiresAt);

-- Triggers for updatedAt column
DELIMITER //

CREATE TRIGGER IF NOT EXISTS before_users_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END; //

CREATE TRIGGER IF NOT EXISTS before_posts_update
BEFORE UPDATE ON posts
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END; //

CREATE TRIGGER IF NOT EXISTS before_files_update
BEFORE UPDATE ON files
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END; //

CREATE TRIGGER IF NOT EXISTS before_verify_tokens_update
BEFORE UPDATE ON verify_tokens
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = NOW();
END; //

DELIMITER ;

-- View for post details
CREATE OR REPLACE VIEW v_post_details AS
SELECT
    p.id,
    p.title,
    p.content,
    p.author_id,
    u.nickname AS author_nickname,
    p.createdAt,
    p.updatedAt
FROM
    posts p
JOIN
    users u ON p.author_id = u.id;

-- Stored Procedure for deleting a post
DELIMITER //

CREATE PROCEDURE sp_delete_post(IN p_post_id VARCHAR(36), IN p_user_id VARCHAR(36))
BEGIN
    DECLARE v_author_id VARCHAR(36);

    -- Check if the post exists and get the author_id
    SELECT author_id INTO v_author_id FROM posts WHERE id = p_post_id;

    -- Check if the user is authorized to delete the post
    IF v_author_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Post not found';
    ELSEIF v_author_id != p_user_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not authorized to delete this post';
    ELSE
        -- Start transaction
        START TRANSACTION;

        -- Delete associated files
        DELETE FROM files WHERE post_id = p_post_id;

        -- Delete associated tags
        DELETE FROM post_tags WHERE post_id = p_post_id;

        -- Delete the post
        DELETE FROM posts WHERE id = p_post_id;

        -- Commit transaction
        COMMIT;
    END IF;
END //

DELIMITER ;
