
/* eslint consistent-return: 0, no-param-reassign: 0, no-underscore-dangle: 0,
 no-unused-vars: 0 */

const sift = require('sift');
const debug = require('debug')('test:feathersStubs');

/**
 * Return a stub for feathers' app
 *
 * @param {Object} config - to server .app.get(prop) requests
 * @returns {Object} feathers' app with .use and .service
 */
module.exports.app = function app (config) {
  return {
    services: {},
    use (route, serviceObject, idProp) {
      this.services[route] = serviceObject;
      this.services[route].before = () => {};
      this.services[route].id = idProp;
    },
    service (route) {
      if (!(route in this.services)) {
        throw new Error(`Service for route ${route} not found.`);
      }

      return this.services[route];
    },
    get (str) {
      return (config || {})[str];
    }
  };
};

/**
 * Return a stub for feathers' users service
 *
 * @param {Object} app - stub
 * @param {Array.Object} usersDb - is the database of users, with _id as the key
 * @param {boolean} nonPaginated - fake a non-paginated db service
 * @param {string} idProp - prop name to use as key. default is '_id'.
 *    This allows us to test DBs like Postgress which uses id as its key.
 * @returns {Object} feather' service for route /users
 */
module.exports.users = function users (app, usersDb, nonPaginated, idProp = '_id') {
  if (idProp !== '_id') {
    usersDb.forEach(user => {
      user[idProp] = user._id;
      user._id = undefined;
      delete user._id;
    });
  }

  const usersConfig = {
    find (params) { // always use as a Promise
      const data = sift(params.query || {}, usersDb);
      debug('/users find: %d %o', data.length, params);

      return new Promise((resolve) => {
        resolve(nonPaginated
          ? data
          : { total: data.length, data });
      });
    },
    update (id, user, params, cb) { // use with promise or  callback
      debug('/users update: %s %o %o', id, user, params);
      const index = usersDb.findIndex(user1 => user1[idProp] === id);

      if (index === -1) {
        return cb(new Error(`users.update ${idProp}=${id} not found.`));
      }

      usersDb[index] = user;

      return cb ? cb(null, user) : Promise.resolve(user); // we're skipping before & after hooks
    },
    patch (id, user, params, cb) { // use with promise or  callback
      debug('/users patch: %s %o %o', id, user, params);
      const index = usersDb.findIndex(user1 => user1[idProp] === id);

      if (index === -1) {
        return cb(new Error(`users.patch ${idProp}=${id} not found.`));
      }

      Object.assign(usersDb[index], user);

      return cb ? cb(null, user) : Promise.resolve(user); // we're skipping before & after hooks
    }
  };

  app.use('/users', usersConfig, idProp);

  return app.service('/users');
};
