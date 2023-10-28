import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698498268673 implements MigrationInterface {
    name = 'New1698498268673'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "education"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "educationLevel" integer`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "schoolType" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "schoolType"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "educationLevel"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "education" integer`);
    }

}
