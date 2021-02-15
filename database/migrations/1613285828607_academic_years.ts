import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AcademicYears extends BaseSchema {
  protected tableName = 'academic_years';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().primary();

      table.integer('year').notNullable();
      table.boolean('active').notNullable().defaultTo(false);

      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
