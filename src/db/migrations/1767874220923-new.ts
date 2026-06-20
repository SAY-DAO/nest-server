import { MigrationInterface, QueryRunner } from "typeorm";

export class New1767874220923 implements MigrationInterface {
    name = 'New1767874220923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '"2026-01-08T12:10:21.364Z"'`);
        await queryRunner.query(`ALTER TABLE "visitor_entity" ALTER COLUMN "phoneNumber" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visitor_entity" ALTER COLUMN "phoneNumber" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '2026-01-08 15:38:42.061+03:30'`);
    }

}
