SELECT * FROM yilabaodb.product;

select * from product;

insert into product(name) values('不锈钢广告牌');

select * from yilabaodb.category;

insert into category(name) values(?);

select * from product_item;

insert into product_item(`name`, product_id, category_list, main_pic, link_url) values('圣诞寄语1', 1, '[]', 'merryChristmas.png', 'https://m.58pic.com/newpic/37102112.html');

insert into product_item(`name`, product_id, category_list, main_pic, link_url) values(?, ?, '[]', ?, ?);

update product_item set category_list = '[1,2]' where id =1;

-- $$$$$
select t.id as `product_item_id`, j.category_id, c.`name` as `category_name` from
	product_item as t, 
	JSON_TABLE(t.category_list, '$[*]' COLUMNS(rowid FOR ORDINALITY, `category_id` int path '$') ) as j 
	INNER JOIN category as c
	where t.id =1 and c.id=j.category_id;
    
select * from product_item t where t.id = 1 and JSON_contains(t.category_list, '1', '$') and t.name like '%1%';

select * from product_item where id = 1;

update `product_item` t set t.`name` = '圣诞狂欢夜1', t.`link_url` = 'www.baidu.com' where id = 1;

set @d = '[{"id":7,"name":"节庆","order":1},{"id":1,"name":"招牌","order":2},{"id":9,"name":"餐饮美食","order":4},{"id":3,"name":"培训","order":5},{"id":2,"name":"美食","order":6},{"id":4,"name":"奇怪","order":7}]';

-- update `category` t s-- -- et t.

select * from `category` as t inner join JSON_TABLE(@d, "$[*]" COLUMNS(
	`id` int PATH "$.id",
    `name` varchar(255) PATH "$.name",
    `order` int PATH "$.order"
)) as j on t.`id`=j.`id` order by j.`order` desc;
-- where t.`id`=j.`id`

update `category` as t inner join JSON_TABLE(@d, "$[*]" COLUMNS(
	`id` int PATH "$.id",
    `name` varchar(255) PATH "$.name",
    `order` int PATH "$.order"
)) as j on t.`id`=j.`id` set t.`order` = j.`order`;

select * from `category` order by `order`=null, `order` asc;