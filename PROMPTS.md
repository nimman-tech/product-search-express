### Define all product purchase urls in database and apis.

```markdown
I am acting as the Senior Architect for this project. 

During a code/schema review, I observed that the product purchase URL is currently stored directly on the product model via the `official_buy_url` column. While we want to keep this existing column for backward compatibility, we now need to support multiple purchase URLs per product across various vendors (e.g., Official, Flipkart, Amazon).

Please implement the following changes:

1. **Database DDL:**
   - Create a new migration/DDL file inside the `database/` folder for a table named `product_purchase_urls` (or project-appropriate naming).
   - Define a foreign key linking back to the main `products` table with appropriate cascade rules (e.g., `ON DELETE CASCADE`).
   - Include fields for `id`, `product_id`, `vendor_name` (or platform identifier), `url`, and standard timestamps.
   - Add appropriate indexes (e.g., index on `product_id`) for optimal lookup performance.

2. **Data Fetching / API Layer:**
   - Ensure that every product scan/fetch endpoint includes the list of associated purchase URLs in its response payload so the UI can render all available vendor links.

3. **Database Seeder:**
   - Create a seeder file to populate the new table with realistic dummy data for existing products (covering multiple vendors like Official, Amazon, Flipkart, etc.).
```