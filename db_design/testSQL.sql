SELECT * FROM yilabaodb.product;

select * from product;

insert into product(name) values('不锈钢广告牌');

select * from yilabaodb.category;

insert into category(name) values(?);

select * from product_item;

insert into product_item(`name`, product_id, category_list, main_pic, link_url) values('圣诞寄语1', 1, '[]', 'merryChristmas.png', 'https://m.58pic.com/newpic/37102112.html');

update product_item set category_list = '[1,2]' where id =1;

-- $$$$$
select t.id as `product_item_id`, j.category_id, c.`name` as `category_name` from
	product_item as t, 
	JSON_TABLE(t.category_list, '$[*]' COLUMNS(rowid FOR ORDINALITY, `category_id` int path '$') ) as j 
	INNER JOIN category as c
	where t.id =1 and c.id=j.category_id;
    
select * from product_item;