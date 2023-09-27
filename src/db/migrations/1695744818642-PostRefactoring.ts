import { MigrationInterface, QueryRunner } from "typeorm";

export class PostRefactoring1695744818642 implements MigrationInterface {
    name = 'PostRefactoring1695744818642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" RENAME COLUMN "flaskUserId" TO "flaskUserIsd"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "variable_entity" RENAME COLUMN "flaskUserIsd" TO "flaskUserId"`);
    }

}