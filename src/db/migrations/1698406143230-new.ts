import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698406143230 implements MigrationInterface {
    name = 'New1698406143230'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "birthPlace"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "birthPlaceId" integer`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "birthPlaceName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "birthPlaceName"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "birthPlaceId"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "birthPlace" integer`);
    }

}
