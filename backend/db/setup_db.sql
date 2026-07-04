-- ============================================================
-- ML Verse – Workspace Management DDL
-- Run this once against your `mlverse` MySQL database.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_workspace (
    username        VARCHAR(150) NOT NULL PRIMARY KEY,
    workspace_id_1  VARCHAR(64)  DEFAULT NULL,
    workspace_id_2  VARCHAR(64)  DEFAULT NULL,
    workspace_id_3  VARCHAR(64)  DEFAULT NULL,
    workspace_id_4  VARCHAR(64)  DEFAULT NULL,
    workspace_id_5  VARCHAR(64)  DEFAULT NULL,
    total_workspace INT          NOT NULL DEFAULT 0,
    CONSTRAINT fk_uw_user FOREIGN KEY (username)
        REFERENCES users (username)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);
