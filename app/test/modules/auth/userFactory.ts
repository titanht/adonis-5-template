import Factory from '@ioc:Adonis/Lucid/Factory';
import User from 'app/modules/auth/user';

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: 'secret',
    permissions: '[]',
  };
}).build();
