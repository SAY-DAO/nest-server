import { MigrationInterface, QueryRunner } from "typeorm";

export class New1767874121598 implements MigrationInterface {
    name = 'New1767874121598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "visitor_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "phoneNumber" character varying NOT NULL, "email" character varying, "isWaiting" boolean NOT NULL DEFAULT false, "firstName" character varying, "lastName" character varying, "feedBackVoiceUrl" character varying, CONSTRAINT "PK_e1e4cc41f960dba4c2b6dfc6563" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '"2026-01-08T12:08:42.061Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '2025-11-15 11:23:52.425+03:30'`);
        await queryRunner.query(`DROP TABLE "visitor_entity"`);
    }

}
