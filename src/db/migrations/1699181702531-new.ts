import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699181702531 implements MigrationInterface {
    name = 'New1699181702531'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME COLUMN "campaignNumber" TO "campaignCode"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME CONSTRAINT "UQ_77f8819f4ce0b24cffce96c2906" TO "UQ_b9e68834e43af5477e94c2796ae"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP CONSTRAINT "UQ_b9e68834e43af5477e94c2796ae"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP COLUMN "campaignCode"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD "campaignCode" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD CONSTRAINT "UQ_b9e68834e43af5477e94c2796ae" UNIQUE ("campaignCode")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP CONSTRAINT "UQ_b9e68834e43af5477e94c2796ae"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP COLUMN "campaignCode"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD "campaignCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD CONSTRAINT "UQ_b9e68834e43af5477e94c2796ae" UNIQUE ("campaignCode")`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME CONSTRAINT "UQ_b9e68834e43af5477e94c2796ae" TO "UQ_77f8819f4ce0b24cffce96c2906"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME COLUMN "campaignCode" TO "campaignNumber"`);
    }

}
