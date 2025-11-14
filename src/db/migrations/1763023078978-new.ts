import { MigrationInterface, QueryRunner } from "typeorm";

export class New1763023078978 implements MigrationInterface {
    name = 'New1763023078978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "title" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "description" json`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '"2025-11-13T08:37:59.462Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '2025-10-15 22:36:06.086+03:30'`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "title" character varying(200) NOT NULL`);
    }

}
