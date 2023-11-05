import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699105844419 implements MigrationInterface {
    name = 'New1699105844419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD "campaignNumber" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" ADD CONSTRAINT "UQ_77f8819f4ce0b24cffce96c2906" UNIQUE ("campaignNumber")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP CONSTRAINT "UQ_77f8819f4ce0b24cffce96c2906"`);
        await queryRunner.query(`ALTER TABLE "campaign_entity" DROP COLUMN "campaignNumber"`);
    }

}
