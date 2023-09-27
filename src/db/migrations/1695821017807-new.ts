import { MigrationInterface, QueryRunner } from "typeorm";

export class New1695821017807 implements MigrationInterface {
    name = 'New1695821017807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "distanceRatio" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "distanceRatio" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "difficultyRatio" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "difficultyRatio" SET DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "contributionRatio" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "contributionRatio" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "contributionRatio" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "contributionRatio" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "difficultyRatio" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "difficultyRatio" TYPE numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "distanceRatio" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ALTER COLUMN "distanceRatio" TYPE numeric(5,2)`);
    }

}
