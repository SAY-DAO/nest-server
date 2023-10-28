import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698509621401 implements MigrationInterface {
    name = 'New1698509621401'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "flaskChildId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "flaskChildId"`);
    }

}
