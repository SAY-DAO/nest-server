import { MigrationInterface, QueryRunner } from "typeorm";

export class New1698779896533 implements MigrationInterface {
    name = 'New1698779896533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" ADD "monthlyEmail" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" DROP COLUMN "monthlyEmail"`);
    }

}
