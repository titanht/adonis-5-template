const { camelCase: camel } = require('camel-case');
const { newLine } = require('./helper');

module.exports = ({ rootFolder, modelName, templateData }) => {
  let factoryFields = '';
  const tab = '    ';

  const getDataGen = (templateItem) => {
    const dataMap = {
      number: 'faker.random.number({ min: 1, max: 10000 })',
      string: 'faker.lorem.sentence()',
    };

    return templateItem.factory || dataMap[templateItem.type];
  };

  templateData.forEach((template, i) => {
    factoryFields = `${factoryFields}${tab}${template.field}: ${getDataGen(
      template
    )},${newLine(templateData.length, i)}`;
  });

  const template = `import Factory from '@ioc:Adonis/Lucid/Factory';
import __ModelName__ from '${rootFolder}/${camel(modelName)}';

export const __ModelName__Factory = Factory.define(__ModelName__, ({ faker }) => {
  return {
${factoryFields}
  };
}).build();
`;
  return template.replace(/__ModelName__/g, modelName);
};
