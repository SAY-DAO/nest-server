import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698317601046 implements MigrationInterface {
    name = 'New1698317601046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "familyCount" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "familyCount"`);
    }

}