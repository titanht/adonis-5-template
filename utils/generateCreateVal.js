const { newLine } = require('./helper');

module.exports = ({ templateData, modelName }) => {
  const schemaMap = {
    number: 'number',
    string: 'string',
  };
  const getRule = (templateItem) => {
    const itemSchema = schemaMap[templateItem.type];
    const suffix = templateItem.required ? '()' : '.optional()';
    return `schema.${itemSchema}${suffix}`;
  };
  const tab = '    ';

  let validationSchema = '';
  templateData.forEach((template, i) => {
    validationSchema = `${validationSchema}${tab}${template.field}: ${getRule(
      template
    )},${newLine(templateData.length, i)}`;
  });

  const template = `import { schema } from '@ioc:Adonis/Core/Validator';
import Validator from 'app/modules/shared/validator';

export default class C__ModelName__Val extends Validator {
  public schema = schema.create({
${validationSchema}
  });
}
`;
  return template.replace(/__ModelName__/g, modelName);
};
