import { MigrationInterface, QueryRunner } from "typeorm";

export class New1695819156903 implements MigrationInterface {
    name = 'New1695819156903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "distanceRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "distanceRatio" numeric(5,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "difficultyRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "difficultyRatio" numeric(5,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "contributionRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "contributionRatio" numeric(5,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "contributionRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "contributionRatio" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "difficultyRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "difficultyRatio" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "variable_entity" DROP COLUMN "distanceRatio"`);
        await queryRunner.query(`ALTER TABLE "variable_entity" ADD "distanceRatio" integer NOT NULL`);
    }

}
