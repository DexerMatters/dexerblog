DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS categories;

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    category_id INTEGER,
    title VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_content_url UNIQUE (content_url),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create indexes for performance optimization
DROP INDEX IF EXISTS idx_documents_category_id;
DROP INDEX IF EXISTS idx_categories_parent_id;
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
