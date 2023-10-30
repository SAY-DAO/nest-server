import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1698319100784 implements MigrationInterface {
  name = 'New1698319100784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" ADD "firstName" hstore`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" ADD "lastName" hstore`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" DROP COLUMN "lastName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "children_pre_register_entity" DROP COLUMN "firstName"`,
    );
  }
}
