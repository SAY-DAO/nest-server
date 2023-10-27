import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698336672558 implements MigrationInterface {
    name = 'New1698336672558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "isApproved" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "isApproved"`);
    }

}
