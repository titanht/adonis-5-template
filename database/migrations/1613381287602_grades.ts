import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class Grades extends BaseSchema {
  protected tableName = 'grades';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').unique().primary();

      table.string('name').notNullable().unique();
      table.decimal('monthly_fee', 15, 2).notNullable();
      table.decimal('registration_fee', 15, 2).notNullable();
      table.decimal('tutorial_fee', 15, 2).notNullable();
      table.decimal('summer_fee', 15, 2);

      table.timestamps(true);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
