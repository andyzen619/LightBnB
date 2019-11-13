select properties.id, properties.title, properties.cost_per_night, avg(property_reviews.rating) as average_rating
from properties
join property_reviews on properties.id = property_reviews.id
where city like '%ancouv%'
group by properties.id
having  avg(property_reviews.rating) >= 4
order by cost_per_night;

