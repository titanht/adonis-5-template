const { camelCase: camel } = require('camel-case');
const { getDepth, newLine } = require('./helper');

module.exports = ({ modelName, folder, apiUrl, templateData, roles }) => {
  const tabs = '      ';
  const updatableFields = [];
  let requiredMessages = '';
  let editMessages = '';
  const editData = {};

  templateData.forEach((template, i) => {
    if (template.required) {
      requiredMessages = `${requiredMessages}${tabs}${
        template.field
      }: 'required validation failed',${newLine(templateData.length, i)}`;
    }
    if (template.editable) {
      updatableFields.push(template.field);
      editData[template.field] = template.type === 'string' ? 100 : 'some data';
      editMessages = `${editMessages}${tabs}${template.field}: '${
        template.type
      } validation failed',${newLine(templateData.length, i)}`;
    }
  });

  const template = `import __ModelName__ from 'app/modules/${folder}/${camel(
    modelName
  )}';
import test from 'japa';
import { __ModelName__Factory } from './${camel(modelName)}Factory';
import { ApiMethod, transact } from 'app/test/testUtils';
import {
  createsApi,
  deleteApi,
  indexApi,
  paginateApi,
  requiresAuth,
  requiresAuthorization,
  showApi,
  updatesApi,
  validateApi,
} from 'app/test/testUtils/api';

const apiUrl = '${apiUrl}';
const roles = ${JSON.stringify(roles)};

transact('__ModelName__ show', () => {
  test('auth', requiresAuth(\`\${apiUrl}/id\`, ApiMethod.GET));
  test('authorize', requiresAuthorization(\`\${apiUrl}/id\`, ApiMethod.GET));
  test(
    '/:id',
    showApi({
      url: apiUrl,
      roles,
      factory: __ModelName__Factory,
      model: __ModelName__,
    })
  );
});

transact('__ModelName__ paginate', () => {
  test('auth', requiresAuth(\`\${apiUrl}/paginate\`, ApiMethod.GET));
  test('authorize', requiresAuthorization(\`\${apiUrl}/paginate\`, ApiMethod.GET));
  test(
    '/?',
    paginateApi({
      url: apiUrl,
      roles,
      factory: __ModelName__Factory,
      model: __ModelName__,
    })
  );
});

transact('__ModelName__ index', () => {
  test('auth', requiresAuth(apiUrl, ApiMethod.GET));
  test('authorize', requiresAuthorization(apiUrl, ApiMethod.GET));
  test(
    '/',
    indexApi({
      url: apiUrl,
      roles,
      factory: __ModelName__Factory,
      model: __ModelName__,
    })
  );
});

transact('__ModelName__ create', () => {
  test('auth', requiresAuth(apiUrl, ApiMethod.POST));
  test('authorize', requiresAuthorization(apiUrl, ApiMethod.POST));
  test(
    'validate',
    validateApi(apiUrl, roles, {
${requiredMessages}
    })
  );
  test('store', async () => {
    const data = (await __ModelName__Factory.make()).serialize();
    return createsApi({
      url: apiUrl,
      roles,
      data: { ...data },
      model: __ModelName__,
      assertionData: { },
    });
  });
});

transact('__ModelName__ update', () => {
  test('auth', requiresAuth(\`\${apiUrl}/id\`, ApiMethod.PATCH));
  test('authorize', requiresAuthorization(\`\${apiUrl}/id\`, ApiMethod.PATCH));
  test(
    'validate',
    validateApi(
      \`\${apiUrl}/id\`,
      roles,
      {
${editMessages}
      },
${JSON.stringify(editData)},
      ApiMethod.PATCH
    )
  );
  test('update', async () => {
    return updatesApi({
      url: apiUrl,
      roles: roles,
      factory: __ModelName__Factory,
      model: __ModelName__,
      fields: ${JSON.stringify(updatableFields)},
      assertionData: { },
    });
  });
});

transact('__ModelName__ delete', () => {
  test('auth', requiresAuth(\`\${apiUrl}/id\`, ApiMethod.DELETE));
  test('authorize', requiresAuthorization(\`\${apiUrl}/id\`, ApiMethod.DELETE));
  test(
    'delete',
    deleteApi({
      url: apiUrl,
      roles,
      factory: __ModelName__Factory,
      model: __ModelName__,
    })
  );
});
`;
  return template.replace(/__ModelName__/g, modelName);
};
