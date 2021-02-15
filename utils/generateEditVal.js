const { newLine, getSchemaMap } = require('./helper');

module.exports = ({ templateData, modelName }) => {
  const schemaMap = getSchemaMap();
  const getRule = (templateItem) => {
    const itemSchema = schemaMap[templateItem.type];
    return `schema.${itemSchema}.optional()`;
  };
  const tab = '    ';

  let validationSchema = '';
  templateData.forEach((template, i) => {
    if (template.editable) {
      validationSchema = `${validationSchema}${tab}${template.field}: ${getRule(
        template
      )},${newLine(templateData.length, i)}`;
    }
  });

  const template = `import { schema } from '@ioc:Adonis/Core/Validator';
import Validator from 'app/modules/shared/validator';

export default class E__ModelName__Val extends Validator {
  public schema = schema.create({
${validationSchema}
  });
}
`;
  return template.replace(/__ModelName__/g, modelName);
};
