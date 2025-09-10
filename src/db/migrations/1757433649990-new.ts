import { MigrationInterface, QueryRunner } from "typeorm";

export class New1757433649990 implements MigrationInterface {
    name = 'New1757433649990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "checkPointDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '"2025-09-09T16:00:50.454Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "checkPointDate"`);
    }

}
