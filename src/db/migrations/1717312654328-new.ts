import { MigrationInterface, QueryRunner } from "typeorm";

export class New1717312654328 implements MigrationInterface {
    name = 'New1717312654328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" ADD "newsLetterCampaign" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" DROP COLUMN "newsLetterCampaign"`);
    }

}
