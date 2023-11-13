import { MigrationInterface, QueryRunner } from "typeorm";

export class New1699812023327 implements MigrationInterface {
    name = 'New1699812023327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "all_user_entity" RENAME COLUMN "monthlyEmail" TO "monthlyCampaign"`);
        await queryRunner.query(`CREATE TABLE "url_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "urlCode" character varying NOT NULL, "longUrl" character varying NOT NULL, "shortUrl" character varying NOT NULL, CONSTRAINT "PK_0ec3eb469ff2aed091ff9b2545e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "url_entity"`);
        await queryRunner.query(`ALTER TABLE "all_user_entity" RENAME COLUMN "monthlyCampaign" TO "monthlyEmail"`);
    }

}
