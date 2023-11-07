import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699180499824 implements MigrationInterface {
    name = 'New1699180499824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME COLUMN "campaign" TO "campaignName"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_entity" RENAME COLUMN "campaignName" TO "campaign"`);
    }

}
