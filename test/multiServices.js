
/* global assert, describe, it */

const assert = require('chai').assert;
const feathers = require('feathers');
const hooks = require('feathers-hooks');
const authManagement = require('../src/index');

const userAuthManagementOptions = {
  service: '/users',
  notifier: () => Promise.resolve(),
  shortTokenLen: 8,
};

const organizationAuthManagementOptions = {
  service: '/organizations',
  notifier: () => Promise.resolve(),
  shortTokenLen: 10,
};

function services() {
  const app = this;
  app.configure(user);
  app.configure(organization);
}

function user() {
  const app = this;
  
  app.use('/users', {
    before: { create: authManagement.hooks.addVerification(userAuthManagementOptions) },
    create: data => Promise.resolve(data)
  });
}

function organization() {
  const app = this;
  
  app.use('/organizations', {
    before: { create: authManagement.hooks.addVerification(organizationAuthManagementOptions) },
    create: data => Promise.resolve(data)
  });
}

describe('multiple services', () => {
  it('can configure 1 service', (done) => {
    const app = feathers()
      .configure(hooks())
      .configure(authManagement(userAuthManagementOptions))
      .configure(services);
    const user = app.service('/users');
    
    user.create({ username: 'John Doe' })
      .then(result => {
        assert.equal(result.username, 'John Doe');
        assert.equal(result.verifyShortToken.length, 8);
        
        done();
      })
      .catch(err => {
        console.log(err);
        done();
      });
    
  });
  
  it('can configure 2 services', (done) => {
    const app = feathers()
      .configure(hooks())
      .configure(authManagement(userAuthManagementOptions))
      .configure(authManagement(organizationAuthManagementOptions))
      .configure(services);
    const user = app.service('/users');
    const organization = app.service('/organizations');
    
    user.create({ username: 'John Doe' })
      .catch(err => {
        console.log(err);
        done();
      })
      .then(result => {
        assert.equal(result.username, 'John Doe');
        assert.equal(result.verifyShortToken.length, 8);
        
        organization.create({ organization: 'Black Ice' })
          .catch(err => {
            console.log(err);
            done();
          })
          .then(result => {
            assert.equal(result.organization, 'Black Ice');
            assert.equal(result.verifyShortToken.length, 10);
            
            done();
          });
        
      });
  });
});
