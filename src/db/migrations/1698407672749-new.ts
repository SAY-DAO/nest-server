import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698407672749 implements MigrationInterface {
    name = 'New1698407672749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "bio" hstore`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "bio" character varying`);
    }

}