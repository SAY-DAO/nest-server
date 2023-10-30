import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698647547317 implements MigrationInterface {
    name = 'New1698647547317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ADD "status" integer DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_pre_register_entity" DROP COLUMN "status"`);
    }

}
