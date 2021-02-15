import { FactoryBuilderQueryContract } from '@ioc:Adonis/Lucid/Factory';
import { base64 } from '@poppinss/utils';
import _ from 'lodash';
import Model from 'app/modules/shared/model';
import { expect } from 'chai';
import supertest from 'supertest';
import { BASE_URL } from '.';
import { UserFactory } from '../modules/auth/userFactory';
import { ApiMethod, expectExceptTimestamp } from './utils';

const buildSuperInstance = (url: string, method: ApiMethod): supertest.Test => {
  let instance: supertest.Test;
  if (method === ApiMethod.PATCH) {
    instance = supertest(BASE_URL).patch(url);
  } else if (method === ApiMethod.POST) {
    instance = supertest(BASE_URL).post(url);
  } else if (method === ApiMethod.DELETE) {
    instance = supertest(BASE_URL).delete(url);
  } else {
    instance = supertest(BASE_URL).get(url);
  }

  return instance;
};

export type CreateApiArgs = {
  url: string;
  roles: string[];
  data: Record<string, any>;
  model: typeof Model;
  assertionData?: Record<string, any>;
};

export type UpdateApiArgs = {
  url: string;
  roles: string[];
  factory: FactoryBuilderQueryContract<any>;
  model: typeof Model;
  fields: string[];
  assertionData?: Record<string, any>;
};

export type DeleteApiArgs = {
  url: string;
  roles: string[];
  factory: FactoryBuilderQueryContract<any>;
  model: typeof Model;
};

export type FetchApiArgs = {
  url: string;
  roles: string[];
  factory: FactoryBuilderQueryContract<any>;
  model: typeof Model;
};

const fetchApi = async (
  { url, roles, factory, model }: FetchApiArgs,
  formatUrl: Function,
  formatData: Function
) => {
  const data = await factory.create();
  const instance = (await model.findOrFail(data.id)).serialize();
  const { email } = await UserFactory.merge({
    permissions: JSON.stringify(roles),
  }).create();
  const encoded = base64.encode(`${email}:secret`);

  await supertest(BASE_URL)
    .get(formatUrl(url, instance.id))
    .set('Authorization', `Basic ${encoded}`)
    .expect(200)
    .then(async (res) => {
      expect(res.body).to.deep.equal(formatData(instance));
    });
};

export const showApi = (fetchArg: FetchApiArgs) => () => {
  return fetchApi(
    fetchArg,
    (url, id) => `${url}/${id}`,
    (instance) => instance
  );
};

export const paginateApi = (fetchArg: FetchApiArgs) => () => {
  return fetchApi(
    fetchArg,
    (url, _id) => `${url}/paginate?page=1&perPage=5`,
    (instance) => ({
      meta: {
        total: 1,
        per_page: 5,
        current_page: 1,
        last_page: 1,
        first_page: 1,
        first_page_url: '/?page=1',
        last_page_url: '/?page=1',
        next_page_url: null,
        previous_page_url: null,
      },
      data: [instance],
    })
  );
};

export const indexApi = (fetchArg: FetchApiArgs) => () => {
  return fetchApi(
    fetchArg,
    (url, _id) => url,
    (instance) => ({
      data: [instance],
    })
  );
};

export const validateApi = (
  url: string,
  roles: string[],
  errorMessages: Record<string, any>,
  data: Record<string, any> = {},
  method: ApiMethod = ApiMethod.POST
) => async () => {
  const { email } = await UserFactory.merge({
    permissions: JSON.stringify(roles),
  }).create();
  const encoded = base64.encode(`${email}:secret`);

  await buildSuperInstance(url, method)
    .set('Authorization', `Basic ${encoded}`)
    .send(data)
    .expect(422)
    .expect({ errors: errorMessages });
};

export const deleteApi = ({
  url,
  roles,
  factory,
  model,
}: DeleteApiArgs) => async () => {
  const { email } = await UserFactory.merge({
    permissions: JSON.stringify(roles),
  }).create();
  const encoded = base64.encode(`${email}:secret`);
  const item = await factory.create();
  const item2 = await factory.create();

  let stat = await model.query().count('* as count').first();
  expect(stat.count).to.equal(2);

  await supertest(BASE_URL)
    .delete(`${url}/${item.id}`)
    .set('Authorization', `Basic ${encoded}`)
    .expect(200)
    .expect({ data: true });

  stat = await model.query().count('* as count').first();
  expect(stat.count).to.equal(1);
  const firstItem = await model.first();
  expect(firstItem).is.not.null;
  expect(firstItem?.id).to.equal(item2.id);
};

export const createsApi = async ({
  url,
  roles,
  data,
  model,
  assertionData = {},
}: CreateApiArgs) => {
  const { email } = await UserFactory.merge({
    permissions: JSON.stringify(roles),
  }).create();
  const encoded = base64.encode(`${email}:secret`);
  return supertest(BASE_URL)
    .post(url)
    .send(data)
    .set('Authorization', `Basic ${encoded}`)
    .then(async (res) => {
      const newData = (await model.firstOrFail()).serialize();
      expect(res.status).to.equal(201);
      expectExceptTimestamp(res.body, { ...newData, ...assertionData });
    });
};

export const updatesApi = async ({
  url,
  roles,
  factory,
  model,
  fields,
  assertionData = {},
}: UpdateApiArgs) => {
  const { email } = await UserFactory.merge({
    permissions: JSON.stringify(roles),
  }).create();
  const encoded = base64.encode(`${email}:secret`);
  const item = (await factory.create()).serialize();
  const updateData = (await factory.make()).serialize();
  const filteredData = _.pick(updateData, fields);

  // console.log({ updateData, filteredData, fields });

  return supertest(BASE_URL)
    .patch(`${url}/${item.id}`)
    .send(updateData)
    .set('Authorization', `Basic ${encoded}`)
    .then(async (res) => {
      const updatedModel = (await model.findOrFail(item.id)).serialize();
      expect(res.status).to.equal(200);
      expectExceptTimestamp(res.body, {
        ...updatedModel,
        ...filteredData,
      });
      expectExceptTimestamp(updatedModel, {
        ...item,
        ...filteredData,
        ...assertionData,
      });
    });
};

export const requiresAuth = (
  url: string,
  method: ApiMethod = ApiMethod.GET
) => async () => {
  await buildSuperInstance(url, method)
    .expect(401)
    .expect({ message: 'Unauthorized access' });
};

export const requiresAuthorization = (
  url: string,
  method: ApiMethod = ApiMethod.GET
) => async () => {
  const { email } = await UserFactory.create();
  const encoded = base64.encode(`${email}:secret`);
  await buildSuperInstance(url, method)
    .set('Authorization', `Basic ${encoded}`)
    .expect(403)
    .expect({ message: 'Forbidden, Unauthorized to perform operation' });
};
