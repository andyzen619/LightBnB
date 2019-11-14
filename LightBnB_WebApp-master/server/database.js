const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool.query('SELECT * from users where email = $1;', [email])
    .then(
      res => res.rows[0],
      rej => null
    );
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  return pool.query('SELECT * FROM users WHERE id = $1;', [id]).
  then(
    res => res.rows[0],
    rej => null
  );
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  const newUsername = user.name;
  const newUserEmail = user.email;
  const newUserPassword = user.password;

  return pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3 RETURNING *)', [newUsername, newUserEmail, newUserPassword]).then(res => {
      userAdded = res.rows[0];
      console.log(`Added to users: ${user.name}`);
    },
    rej => {
      console.log('Unable to add to database');
    });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query('SELECT * FROM reservations WHERE guest_id = $1 LIMIT 10;', [guest_id, limit]).then(res => res.row[0], rej => null);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  const optionParams = Object.keys(options);

  if (optionParams.length > 0) {
    queryString += `WHERE `;
  }

  for (const params in optionParams) {
    if (params != 0 && optionParams[params] !== 'minimum_rating') {
      queryString += `AND `;
    }
    switch (optionParams[params]) {
      case 'city':
        queryParams.push(`%${options.city}%`);
        queryString += `city LIKE $${queryParams.length} `;
        break;

      case 'minimum_price_per_night':
        queryParams.push(`${options.minimum_price_per_night}`);
        queryString += `cost_per_night > $${queryParams.length} `;
        break;

      case 'maximum_price_per_night':
        queryParams.push(`${options.maximum_price_per_night}`);
        queryString += `cost_per_night < $${queryParams.length} `;
        break;
    }
  }

  // 4
  queryString += `
  GROUP BY properties.id `

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) > $${queryParams.length} `
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
    .then(res => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);

  let queryParams = Object.values(property);
  console.log(queryParams.length);
  let queryString = `INSERT INTO properties (
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms
    )
    
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *;`
  return pool.query(queryString, queryParams)
    .then(res => res.row[0]);
}
exports.addProperty = addProperty;