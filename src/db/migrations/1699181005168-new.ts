import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699181005168 implements MigrationInterface {
    name = 'New1699181005168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP COLUMN "campaignName"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD "campaignName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "all_user_entity" ALTER COLUMN "monthlyEmail" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" ALTER COLUMN "monthlyEmail" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP COLUMN "campaignName"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD "campaignName" integer NOT NULL`);
    }

}
