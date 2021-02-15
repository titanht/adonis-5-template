module.exports = ({ templateData, modelName }) => {
  let mappedTemplate = '';
  templateData.forEach((template, i) => {
    mappedTemplate = `${mappedTemplate}  @column()\n  public ${
      template.field
    }: ${template.type};${i === templateData.length - 1 ? '' : '\n\n'}`;
  });

  const template = `import { column } from '@ioc:Adonis/Lucid/Orm';
import Model from 'app/modules/shared/model';

export default class __ModelName__ extends Model {
${mappedTemplate}
}
`;
  return template.replace('__ModelName__', modelName);
};
