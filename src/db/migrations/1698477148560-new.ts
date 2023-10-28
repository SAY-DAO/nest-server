import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698477148560 implements MigrationInterface {
    name = 'New1698477148560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" RENAME COLUMN "isApproved" TO "status"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "status" integer DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "status" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" RENAME COLUMN "status" TO "isApproved"`);
    }

}
