1. 把 migrations/, models/, seeders/ 直接複製到專案的工作目錄底下
2. `sequelize db:migrate` 可以把 migrations/ 裡定義的資料表寫進資料庫 (`sequelize db:migrate:undo:all` 刪除所有資料表)
3. models/ 中定義了 table(model) 之間的關係
4. `sequelize db:seed:all` 可以把 seeders/ 裡的假資料寫進資料庫中